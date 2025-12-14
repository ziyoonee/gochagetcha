/**
 * SNS 게시물 분석하여 가차샵-가차 매핑
 * - 트위터/스레드/블로그: 텍스트만 분석 (빠르고 저렴)
 * - 인스타그램: 로그인 성공 시 이미지+텍스트 분석
 * 실행: npx tsx scripts/analyze-sns-gachas.ts
 */

// dotenv를 먼저 로드
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import puppeteer, { Browser, Page } from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

const supabase = createClient(
  'https://jsswbuxxvdirrzdkaouw.supabase.co',
  'sb_publishable_8Jgm3Pia07hPA77NbkinMg_Hwj8wx6q'
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const COOKIES_PATH = path.join(__dirname, 'instagram-cookies.json');

interface GachaMatch {
  gacha_id: string;
  gacha_name: string;
  confidence: number;
}

interface PostData {
  platform: string;
  post_url: string;
  text: string;
  image_urls: string[];
}

// DB에서 모든 가차 이름 가져오기
async function getAllGachaNames(): Promise<Map<string, { id: string; name: string; nameKo: string }>> {
  const { data } = await supabase
    .from('gachas')
    .select('id, name, name_ko');

  const gachaMap = new Map();
  if (data) {
    for (const g of data) {
      // 일본어 이름으로 매핑
      gachaMap.set(g.name.toLowerCase(), { id: g.id, name: g.name, nameKo: g.name_ko });
      // 한글 키워드로도 매핑
      if (g.name_ko) {
        const keywords = g.name_ko.split(' ');
        for (const kw of keywords) {
          if (kw.length > 1) {
            gachaMap.set(kw.toLowerCase(), { id: g.id, name: g.name, nameKo: g.name_ko });
          }
        }
      }
    }
  }
  return gachaMap;
}

// Instagram 로그인
async function loginToInstagram(page: Page): Promise<boolean> {
  const username = process.env.INSTAGRAM_USERNAME;
  const password = process.env.INSTAGRAM_PASSWORD;

  if (!username || !password || username === '여기에_인스타_아이디') {
    console.log('⚠️  Instagram 계정 정보가 설정되지 않았습니다.');
    console.log('   .env.local 파일에 INSTAGRAM_USERNAME과 INSTAGRAM_PASSWORD를 설정하세요.');
    return false;
  }

  // 저장된 쿠키가 있으면 로드
  if (fs.existsSync(COOKIES_PATH)) {
    try {
      const cookies = JSON.parse(fs.readFileSync(COOKIES_PATH, 'utf-8'));
      await page.setCookie(...cookies);
      console.log('✓ 저장된 Instagram 세션 로드됨');

      // 세션 유효성 확인
      await page.goto('https://www.instagram.com/', { waitUntil: 'networkidle2' });
      const isLoggedIn = await page.evaluate(() => {
        return !document.querySelector('input[name="username"]');
      });

      if (isLoggedIn) {
        console.log('✓ Instagram 세션 유효함');
        return true;
      }
      console.log('⚠️  Instagram 세션 만료됨, 재로그인...');
    } catch (e) {
      console.log('⚠️  쿠키 로드 실패, 재로그인...');
    }
  }

  console.log('Instagram 로그인 중...');

  try {
    await page.goto('https://www.instagram.com/accounts/login/', {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // 쿠키 동의 버튼 클릭 (있으면)
    try {
      await page.click('button:has-text("Allow all cookies")', { timeout: 3000 });
    } catch {}
    try {
      await page.click('[data-cookiebanner="accept_button"]', { timeout: 3000 });
    } catch {}

    await page.waitForSelector('input[name="username"]', { timeout: 10000 });

    // 로그인 정보 입력
    await page.type('input[name="username"]', username, { delay: 100 });
    await page.type('input[name="password"]', password, { delay: 100 });

    // 로그인 버튼 클릭
    await page.click('button[type="submit"]');

    // 로그인 완료 대기 (URL 변경 또는 시간 대기)
    await new Promise(r => setTimeout(r, 8000)); // 8초 대기

    // 2FA 또는 추가 인증 팝업 처리
    try {
      // "정보 저장" 팝업
      await page.click('button:has-text("나중에 하기")', { timeout: 5000 });
    } catch {}
    try {
      await page.click('button:has-text("Not Now")', { timeout: 3000 });
    } catch {}

    // 알림 팝업
    try {
      await page.click('button:has-text("나중에 하기")', { timeout: 3000 });
    } catch {}
    try {
      await page.click('button:has-text("Not Now")', { timeout: 3000 });
    } catch {}

    // 로그인 성공 확인
    const loginSuccess = await page.evaluate(() => {
      return !document.querySelector('input[name="username"]');
    });

    if (loginSuccess) {
      // 쿠키 저장
      const cookies = await page.cookies();
      fs.writeFileSync(COOKIES_PATH, JSON.stringify(cookies, null, 2));
      console.log('✓ Instagram 로그인 성공, 세션 저장됨');
      return true;
    } else {
      console.log('❌ Instagram 로그인 실패');
      return false;
    }
  } catch (error) {
    console.error('❌ Instagram 로그인 에러:', error);
    return false;
  }
}

// Instagram 프로필에서 2025년 게시물 전체 수집 (로그인 상태)
async function crawlInstagram(instagramUrl: string, page: Page): Promise<PostData[]> {
  const posts: PostData[] = [];

  try {
    // Instagram 사용자명 추출
    const match = instagramUrl.match(/instagram\.com\/([^\/\?]+)/);
    if (!match) return posts;
    const user = match[1];

    console.log(`    프로필 접속: @${user}`);

    await page.goto(`https://www.instagram.com/${user}/`, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // 잠시 대기 (동적 로딩)
    await new Promise(r => setTimeout(r, 2000));

    // 스크롤하면서 게시물 수집 (2025년 게시물까지)
    let lastPostCount = 0;
    let scrollAttempts = 0;
    const maxScrollAttempts = 10; // 최대 10번 스크롤
    const allPostUrls: string[] = [];

    while (scrollAttempts < maxScrollAttempts) {
      // 게시물 링크들 수집
      const postUrls = await page.evaluate(() => {
        const urls: string[] = [];
        document.querySelectorAll('a[href*="/p/"]').forEach(link => {
          const href = (link as HTMLAnchorElement).href;
          if (href && !urls.includes(href)) {
            urls.push(href);
          }
        });
        return urls;
      });

      // 새 게시물 추가
      for (const url of postUrls) {
        if (!allPostUrls.includes(url)) {
          allPostUrls.push(url);
        }
      }

      // 더 이상 새 게시물이 없으면 종료
      if (allPostUrls.length === lastPostCount) {
        break;
      }
      lastPostCount = allPostUrls.length;

      // 스크롤 다운
      await page.evaluate(() => window.scrollBy(0, 1000));
      await new Promise(r => setTimeout(r, 1500));
      scrollAttempts++;
    }

    console.log(`    ${allPostUrls.length}개 게시물 발견, 2025년 게시물 분석 중...`);

    // 각 게시물의 상세 정보 수집 (2025년 게시물만)
    let posts2025Count = 0;
    for (const postUrl of allPostUrls) {
      if (posts2025Count >= 30) break; // 샵당 최대 30개 게시물

      try {
        await page.goto(postUrl, { waitUntil: 'networkidle2', timeout: 15000 });
        await new Promise(r => setTimeout(r, 800));

        const postDetails = await page.evaluate(() => {
          // 날짜 추출
          const timeEl = document.querySelector('time');
          const dateStr = timeEl?.getAttribute('datetime') || '';

          // 캡션 텍스트 추출
          const captionEl = document.querySelector('h1') ||
                           document.querySelector('[class*="Caption"]') ||
                           document.querySelector('span[class*="_ap3a"]');
          const caption = captionEl?.textContent || '';

          // 모든 이미지 수집
          const images: string[] = [];
          document.querySelectorAll('img[src*="instagram"]').forEach(img => {
            const src = (img as HTMLImageElement).src;
            if (src && !src.includes('profile') && !src.includes('44x44') && !src.includes('150x150')) {
              images.push(src);
            }
          });

          return { caption, images, dateStr };
        });

        // 2025년 게시물인지 확인
        if (postDetails.dateStr && postDetails.dateStr.startsWith('2025')) {
          if (postDetails.images.length > 0 || postDetails.caption) {
            posts.push({
              platform: 'instagram',
              post_url: postUrl,
              text: postDetails.caption,
              image_urls: postDetails.images.slice(0, 3), // 최대 3개 이미지
            });
            posts2025Count++;
          }
        } else if (postDetails.dateStr && postDetails.dateStr.startsWith('2024')) {
          // 2024년 게시물이 나오면 중단 (더 이전 게시물은 스킵)
          console.log(`    2024년 게시물 도달, 수집 완료`);
          break;
        }

        await new Promise(r => setTimeout(r, 300));
      } catch (e) {
        // 게시물 로드 실패 시 계속 진행
      }
    }

    console.log(`    2025년 게시물 ${posts.length}개 수집 완료`);

  } catch (error) {
    console.error(`Instagram 크롤링 실패 (${instagramUrl}):`, error);
  }

  return posts;
}

// Twitter/X에서 2025년 트윗 텍스트 수집 (스크롤하며 전체 수집)
async function crawlTwitter(twitterUrl: string, page: Page): Promise<PostData[]> {
  const posts: PostData[] = [];

  try {
    const match = twitterUrl.match(/(twitter\.com|x\.com)\/([^\/\?]+)/);
    if (!match) return posts;
    const user = match[2];

    // 직접 Twitter 접근 시도
    await page.goto(`https://x.com/${user}`, {
      waitUntil: 'networkidle2',
      timeout: 20000,
    });

    await new Promise(r => setTimeout(r, 3000));

    // 스크롤하면서 2025년 트윗 수집
    let scrollAttempts = 0;
    const maxScrollAttempts = 8;
    const collectedTexts = new Set<string>();
    let found2024 = false;

    while (scrollAttempts < maxScrollAttempts && !found2024) {
      // 트윗 텍스트와 날짜 수집
      const tweetData = await page.evaluate(() => {
        const results: { text: string; date: string }[] = [];

        const tweetElements = document.querySelectorAll('[data-testid="tweet"]');

        tweetElements.forEach((tweet) => {
          const textEl = tweet.querySelector('[data-testid="tweetText"]');
          const text = textEl?.textContent || '';

          // 날짜 추출 (time 태그에서)
          const timeEl = tweet.querySelector('time');
          const dateStr = timeEl?.getAttribute('datetime') || '';

          if (text && text.length > 5) {
            results.push({ text, date: dateStr });
          }
        });

        return results;
      });

      for (const tweet of tweetData) {
        // 2025년 트윗만 수집
        if (tweet.date.startsWith('2025')) {
          if (!collectedTexts.has(tweet.text)) {
            collectedTexts.add(tweet.text);
            posts.push({
              platform: 'twitter',
              post_url: `https://x.com/${user}`,
              text: tweet.text,
              image_urls: [],
            });
          }
        } else if (tweet.date.startsWith('2024')) {
          found2024 = true;
        }
      }

      if (posts.length >= 50) break; // 최대 50개

      // 스크롤 다운
      await page.evaluate(() => window.scrollBy(0, 1500));
      await new Promise(r => setTimeout(r, 2000));
      scrollAttempts++;
    }

    console.log(`    2025년 트윗 ${posts.length}개 수집`);

  } catch (error) {
    console.log(`    Twitter 크롤링 실패 (로그인 필요할 수 있음)`);
  }

  return posts;
}

// Threads에서 2025년 텍스트 수집 (스크롤하며 전체 수집)
async function crawlThreads(threadsUrl: string, page: Page): Promise<PostData[]> {
  const posts: PostData[] = [];

  try {
    // threads.net/@username 형태
    const match = threadsUrl.match(/threads\.net\/@?([^\/\?]+)/);
    if (!match) return posts;
    const user = match[1];

    await page.goto(`https://www.threads.net/@${user}`, {
      waitUntil: 'networkidle2',
      timeout: 20000,
    });

    await new Promise(r => setTimeout(r, 3000));

    // 스크롤하면서 스레드 수집
    let scrollAttempts = 0;
    const maxScrollAttempts = 6;
    const collectedTexts = new Set<string>();

    while (scrollAttempts < maxScrollAttempts) {
      // 스레드 텍스트와 날짜 수집
      const threadData = await page.evaluate(() => {
        const results: { text: string; date: string }[] = [];

        // 게시물 컨테이너 찾기
        const postContainers = document.querySelectorAll('[data-pressable-container="true"]');

        postContainers.forEach((container) => {
          // 텍스트 추출
          const textEl = container.querySelector('span');
          const text = textEl?.textContent || '';

          // 날짜 추출
          const timeEl = container.querySelector('time');
          const dateStr = timeEl?.getAttribute('datetime') || '';

          if (text && text.length > 10) {
            results.push({ text, date: dateStr });
          }
        });

        return results;
      });

      for (const thread of threadData) {
        // 2025년 또는 날짜 없는 것 수집 (Threads는 날짜 파싱이 어려울 수 있음)
        if (!thread.date || thread.date.startsWith('2025')) {
          if (!collectedTexts.has(thread.text) && (
            thread.text.includes('가챠') || thread.text.includes('가샤폰') ||
            thread.text.includes('캡슐') || thread.text.includes('입고') ||
            thread.text.includes('신상') || thread.text.includes('뽑기') ||
            thread.text.includes('가차')
          )) {
            collectedTexts.add(thread.text);
            posts.push({
              platform: 'threads',
              post_url: `https://www.threads.net/@${user}`,
              text: thread.text,
              image_urls: [],
            });
          }
        }
      }

      if (posts.length >= 30) break; // 최대 30개

      // 스크롤 다운
      await page.evaluate(() => window.scrollBy(0, 1000));
      await new Promise(r => setTimeout(r, 1500));
      scrollAttempts++;
    }

    console.log(`    2025년 스레드 ${posts.length}개 수집`);

  } catch (error) {
    console.log(`    Threads 크롤링 실패`);
  }

  return posts;
}

// 네이버 블로그 검색 - 2025년 게시물, URL도 함께 반환
async function searchNaverBlog(shopName: string, page: Page): Promise<{ posts: PostData[]; blogUrl: string | null }> {
  const posts: PostData[] = [];
  let blogUrl: string | null = null;

  try {
    // 2025년 기간 필터 추가
    const query = encodeURIComponent(`${shopName} 가챠`);
    const url = `https://search.naver.com/search.naver?where=blog&query=${query}&nso=so:dd,p:from20250101,a:all`;

    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 15000,
    });

    // 스크롤하며 더 많은 결과 수집
    let scrollAttempts = 0;
    const maxScrollAttempts = 3;

    while (scrollAttempts < maxScrollAttempts) {
      await page.evaluate(() => window.scrollBy(0, 1000));
      await new Promise(r => setTimeout(r, 1000));
      scrollAttempts++;
    }

    const blogData = await page.evaluate(() => {
      const results: { title: string; desc: string; url: string; date: string }[] = [];

      // 블로그 검색 결과
      const items = document.querySelectorAll('.api_txt_lines.total_tit, .title_area a');
      const descs = document.querySelectorAll('.api_txt_lines.dsc_txt, .dsc_area');
      const dates = document.querySelectorAll('.sub_time, .sub_txt');

      items.forEach((item, i) => {
        if (i >= 20) return; // 최대 20개
        const title = item.textContent || '';
        const desc = descs[i]?.textContent || '';
        const url = (item as HTMLAnchorElement).href || '';
        const date = dates[i]?.textContent || '';
        if (title) {
          results.push({ title, desc, url, date });
        }
      });

      return results;
    });

    for (const blog of blogData) {
      // 가게 공식 블로그인지 확인 (제목에 가게명 포함)
      if (blog.url && blog.url.includes('blog.naver.com') && blog.title.includes(shopName)) {
        blogUrl = blog.url.split('?')[0]; // 쿼리 파라미터 제거
      }

      posts.push({
        platform: 'blog',
        post_url: blog.url,
        text: `${blog.title} ${blog.desc}`,
        image_urls: [],
      });
    }

    console.log(`    2025년 블로그 ${posts.length}개 수집`);

  } catch (error) {
    console.log(`    블로그 검색 실패`);
  }

  return { posts, blogUrl };
}

// 이미지 다운로드 후 base64 변환
async function downloadImageAsBase64(imageUrl: string): Promise<string | null> {
  try {
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.instagram.com/',
      },
    });

    if (!response.ok) return null;

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    return null;
  }
}

// OpenAI Vision으로 이미지 분석
async function analyzeImageWithVision(imageUrl: string, gachaNames: string[]): Promise<string[]> {
  try {
    const base64Image = await downloadImageAsBase64(imageUrl);
    if (!base64Image) {
      return [];
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `당신은 일본 가챠(캡슐토이/가샤폰) 전문가입니다.
이미지에서 가챠 상품이나 캡슐토이 기계를 찾아주세요.
보이는 상품의 이름, 시리즈명, 캐릭터명을 한국어로 알려주세요.

예시 형식: 원피스 피규어, 포켓몬 마스코트, 치이카와 인형, 산리오 컬렉션

없으면 "없음"이라고만 답하세요.`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: base64Image, detail: 'low' },
            },
          ],
        },
      ],
      max_tokens: 300,
    });

    const result = response.choices[0]?.message?.content || '';
    console.log(`      Vision 결과: ${result.substring(0, 100)}`);

    if (result === '없음' || !result) return [];

    return result.split(',').map(s => s.trim()).filter(s => s.length > 0 && s !== '없음');
  } catch (error: any) {
    console.log(`      Vision 분석 실패: ${error.message?.substring(0, 50)}`);
    return [];
  }
}

// 텍스트에서 가챠 이름 추출
async function extractGachasFromText(text: string, gachaNames: string[]): Promise<string[]> {
  if (!text || text.length < 5) return [];

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `다음 텍스트에서 가챠/캡슐토이 상품 이름을 찾아주세요.
애니메이션, 캐릭터, 시리즈명 등을 포함해서 찾아주세요.

예시: 원피스, 포켓몬, 치이카와, 산리오, 드래곤볼, 귀멸의칼날, 주술회전 등

발견된 것만 쉼표로 구분해서 반환하세요. 없으면 "없음"`,
        },
        {
          role: 'user',
          content: text.substring(0, 500),
        },
      ],
      max_tokens: 200,
    });

    const result = response.choices[0]?.message?.content || '';
    if (result === '없음' || !result) return [];

    return result.split(',').map(s => s.trim()).filter(s => s.length > 0 && s !== '없음');
  } catch (error) {
    return [];
  }
}

// 가챠 이름으로 DB 매칭
function matchGachas(
  foundNames: string[],
  gachaMap: Map<string, { id: string; name: string; nameKo: string }>
): GachaMatch[] {
  const matches: GachaMatch[] = [];
  const seenIds = new Set<string>();

  for (const name of foundNames) {
    const normalizedName = name.toLowerCase().trim();

    // 정확한 매칭
    if (gachaMap.has(normalizedName)) {
      const gacha = gachaMap.get(normalizedName)!;
      if (!seenIds.has(gacha.id)) {
        seenIds.add(gacha.id);
        matches.push({
          gacha_id: gacha.id,
          gacha_name: gacha.name,
          confidence: 0.9,
        });
      }
      continue;
    }

    // 부분 매칭
    for (const [key, gacha] of gachaMap.entries()) {
      if (key.includes(normalizedName) || normalizedName.includes(key)) {
        if (!seenIds.has(gacha.id)) {
          seenIds.add(gacha.id);
          matches.push({
            gacha_id: gacha.id,
            gacha_name: gacha.name,
            confidence: 0.7,
          });
        }
        break;
      }
    }
  }

  return matches;
}

// 매핑 저장
async function saveMapping(gachashopId: string, matches: GachaMatch[], source: string) {
  for (const match of matches) {
    const { error } = await supabase
      .from('gachashop_gachas')
      .upsert({
        gachashop_id: gachashopId,
        gacha_id: match.gacha_id,
      }, {
        onConflict: 'gachashop_id,gacha_id',
      });

    if (error) {
      console.log(`    ⚠️ 저장 실패: ${error.message}`);
    }
  }
}

// 발견된 SNS 정보 업데이트
async function updateShopSNS(shopId: string, updates: {
  threads_url?: string;
  blog_url?: string;
  instagram_url?: string;
  twitter_url?: string;
}) {
  // null/undefined 값 제거
  const cleanUpdates: Record<string, string> = {};
  for (const [key, value] of Object.entries(updates)) {
    if (value) cleanUpdates[key] = value;
  }

  if (Object.keys(cleanUpdates).length === 0) return;

  const { error } = await supabase
    .from('gachashops')
    .update(cleanUpdates)
    .eq('id', shopId);

  if (!error) {
    const updated = Object.keys(cleanUpdates).join(', ');
    console.log(`    ✓ SNS 정보 업데이트: ${updated}`);
  }
}

async function main() {
  console.log('=== SNS 가차 분석 시작 ===\n');

  // 가챠 목록 로드
  const gachaMap = await getAllGachaNames();
  const gachaNames = Array.from(gachaMap.keys());
  console.log(`${gachaMap.size}개 가챠 이름 로드됨\n`);

  // SNS URL이 있는 가차샵 가져오기
  const { data: shops } = await supabase
    .from('gachashops')
    .select('id, name, instagram_url, twitter_url')
    .or('instagram_url.neq.null,twitter_url.neq.null')
    ; // 전체 분석

  if (!shops || shops.length === 0) {
    console.log('SNS URL이 있는 가차샵이 없습니다.');
    return;
  }

  console.log(`${shops.length}개 가차샵 분석 예정\n`);

  // Puppeteer 브라우저 시작
  const browser = await puppeteer.launch({
    headless: false, // 로그인 확인을 위해 false
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800'],
    defaultViewport: { width: 1280, height: 800 },
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  // Instagram 로그인
  const instagramLoggedIn = await loginToInstagram(page);

  let totalMappings = 0;

  for (let i = 0; i < shops.length; i++) {
    const shop = shops[i];
    console.log(`\n[${i + 1}/${shops.length}] ${shop.name} 분석 중...`);

    const allPosts: PostData[] = [];
    const textOnlyPosts: PostData[] = []; // 텍스트만 분석할 포스트

    // Instagram 크롤링 (로그인 성공시에만, 이미지+텍스트)
    if (shop.instagram_url && instagramLoggedIn) {
      console.log(`  Instagram 크롤링 (이미지+텍스트)...`);
      const igPosts = await crawlInstagram(shop.instagram_url, page);
      allPosts.push(...igPosts);
      console.log(`    ${igPosts.length}개 포스트 수집`);
    }

    // Twitter 크롤링 (텍스트만)
    if (shop.twitter_url) {
      console.log(`  Twitter 크롤링 (텍스트만)...`);
      const twPosts = await crawlTwitter(shop.twitter_url, page);
      textOnlyPosts.push(...twPosts);
    }

    // Threads 크롤링 (인스타 URL에서 추출 시도, 텍스트만)
    let threadsUrl: string | null = null;
    if (shop.instagram_url) {
      const igUser = shop.instagram_url.match(/instagram\.com\/([^\/\?]+)/)?.[1];
      if (igUser) {
        threadsUrl = `https://threads.net/@${igUser}`;
        console.log(`  Threads 크롤링 (텍스트만)...`);
        const threadsPosts = await crawlThreads(threadsUrl, page);
        textOnlyPosts.push(...threadsPosts);
      }
    }

    // 블로그 검색 (텍스트만)
    console.log(`  블로그 검색 (텍스트만)...`);
    const blogResult = await searchNaverBlog(shop.name, page);
    textOnlyPosts.push(...blogResult.posts);

    // 발견된 SNS 정보 저장
    const snsUpdates: { threads_url?: string; blog_url?: string } = {};
    if (threadsUrl && textOnlyPosts.some(p => p.platform === 'threads')) {
      snsUpdates.threads_url = threadsUrl;
    }
    if (blogResult.blogUrl) {
      snsUpdates.blog_url = blogResult.blogUrl;
    }
    if (Object.keys(snsUpdates).length > 0) {
      await updateShopSNS(shop.id, snsUpdates);
    }

    // 포스트 분석
    const allMatches: GachaMatch[] = [];
    let imageCount = 0;
    let textCount = 0;

    // Instagram 포스트: 이미지 + 텍스트 분석
    for (const post of allPosts) {
      // 이미지 분석 (인스타그램만, 최대 4개)
      if (post.platform === 'instagram') {
        for (const imgUrl of post.image_urls.slice(0, 2)) {
          if (imageCount >= 4) break; // 샵당 최대 4개 이미지
          console.log(`    이미지 분석 중... (${imageCount + 1})`);
          const foundNames = await analyzeImageWithVision(imgUrl, gachaNames);
          const matches = matchGachas(foundNames, gachaMap);
          allMatches.push(...matches);
          imageCount++;
          await new Promise(r => setTimeout(r, 1000));
        }
      }

      // 텍스트 분석
      if (post.text && post.text.length > 10 && textCount < 10) {
        const foundNames = await extractGachasFromText(post.text, gachaNames);
        const matches = matchGachas(foundNames, gachaMap);
        allMatches.push(...matches);
        textCount++;
      }
    }

    // 텍스트 전용 포스트 분석 (트위터, 스레드, 블로그)
    for (const post of textOnlyPosts) {
      if (post.text && post.text.length > 10 && textCount < 20) {
        const foundNames = await extractGachasFromText(post.text, gachaNames);
        const matches = matchGachas(foundNames, gachaMap);
        allMatches.push(...matches);
        textCount++;
      }
    }

    // 중복 제거 후 매핑 저장
    const uniqueMatches = allMatches.filter((match, index, self) =>
      index === self.findIndex(m => m.gacha_id === match.gacha_id)
    );

    if (uniqueMatches.length > 0) {
      await saveMapping(shop.id, uniqueMatches, 'sns_analysis');
      totalMappings += uniqueMatches.length;
      console.log(`  ✓ ${uniqueMatches.length}개 가챠 매핑됨`);
      uniqueMatches.slice(0, 5).forEach(m => console.log(`    - ${m.gacha_name.substring(0, 40)}...`));
    } else {
      console.log(`  - 매핑된 가챠 없음`);
    }

    // 속도 제한
    await new Promise(r => setTimeout(r, 3000));
  }

  await browser.close();

  console.log('\n=== 분석 완료 ===');
  console.log(`총 ${totalMappings}개 가차-가차샵 매핑 생성`);
}

main().catch(console.error);
