/**
 * SNS 게시물 분석하여 가차샵-가차 매핑
 * Instagram, Twitter, Naver Blog에서 이미지/텍스트 수집 후 OpenAI로 분석
 * 실행: npx tsx scripts/analyze-sns-gachas.ts
 */

// dotenv를 먼저 로드
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import puppeteer from 'puppeteer';

const supabase = createClient(
  'https://jsswbuxxvdirrzdkaouw.supabase.co',
  'sb_publishable_8Jgm3Pia07hPA77NbkinMg_Hwj8wx6q'
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

// Instagram 프로필에서 최근 게시물 이미지 수집
async function crawlInstagram(username: string, browser: puppeteer.Browser): Promise<PostData[]> {
  const posts: PostData[] = [];

  try {
    // Instagram 사용자명 추출
    const match = username.match(/instagram\.com\/([^\/\?]+)/);
    if (!match) return posts;
    const user = match[1];

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

    // Instagram 프로필 페이지 접속
    await page.goto(`https://www.instagram.com/${user}/`, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // 로그인 팝업 닫기 시도
    try {
      await page.click('[aria-label="Close"]', { timeout: 3000 });
    } catch {}

    // 이미지 URL 수집
    const imageUrls = await page.evaluate(() => {
      const images: string[] = [];
      const posts = document.querySelectorAll('article img');
      posts.forEach((img) => {
        const src = (img as HTMLImageElement).src;
        if (src && !src.includes('profile')) {
          images.push(src);
        }
      });
      return images.slice(0, 9); // 최근 9개만
    });

    if (imageUrls.length > 0) {
      posts.push({
        platform: 'instagram',
        post_url: `https://www.instagram.com/${user}/`,
        text: '',
        image_urls: imageUrls,
      });
    }

    await page.close();
  } catch (error) {
    console.error(`Instagram 크롤링 실패 (${username}):`, error);
  }

  return posts;
}

// Twitter/X에서 최근 트윗 수집 (Nitter 사용)
async function crawlTwitter(twitterUrl: string, browser: puppeteer.Browser): Promise<PostData[]> {
  const posts: PostData[] = [];

  try {
    // 사용자명 추출
    const match = twitterUrl.match(/(twitter\.com|x\.com)\/([^\/\?]+)/);
    if (!match) return posts;
    const user = match[2];

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

    // Nitter 인스턴스 사용 (트위터 프론트엔드)
    const nitterInstances = [
      'nitter.privacydev.net',
      'nitter.poast.org',
    ];

    for (const instance of nitterInstances) {
      try {
        await page.goto(`https://${instance}/${user}`, {
          waitUntil: 'networkidle2',
          timeout: 20000,
        });

        // 트윗 텍스트와 이미지 수집
        const tweetData = await page.evaluate(() => {
          const tweets: { text: string; images: string[] }[] = [];
          const tweetElements = document.querySelectorAll('.timeline-item');

          tweetElements.forEach((tweet, i) => {
            if (i >= 10) return; // 최근 10개만

            const textEl = tweet.querySelector('.tweet-content');
            const text = textEl?.textContent || '';

            const images: string[] = [];
            tweet.querySelectorAll('.attachment img').forEach((img) => {
              const src = (img as HTMLImageElement).src;
              if (src) images.push(src);
            });

            if (text || images.length > 0) {
              tweets.push({ text, images });
            }
          });

          return tweets;
        });

        for (const tweet of tweetData) {
          posts.push({
            platform: 'twitter',
            post_url: `https://twitter.com/${user}`,
            text: tweet.text,
            image_urls: tweet.images,
          });
        }

        break; // 성공하면 다른 인스턴스 시도 안함
      } catch {
        continue;
      }
    }

    await page.close();
  } catch (error) {
    console.error(`Twitter 크롤링 실패 (${twitterUrl}):`, error);
  }

  return posts;
}

// 네이버 블로그 검색
async function searchNaverBlog(shopName: string): Promise<PostData[]> {
  const posts: PostData[] = [];

  try {
    const query = encodeURIComponent(`${shopName} 가챠 신상`);
    const url = `https://search.naver.com/search.naver?where=blog&query=${query}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    const html = await response.text();

    // 블로그 포스트 제목과 요약 추출
    const titleMatches = html.matchAll(/class="title_link"[^>]*>([^<]+)</g);
    const descMatches = html.matchAll(/class="dsc_txt"[^>]*>([^<]+)</g);

    const titles = Array.from(titleMatches).map(m => m[1]);
    const descs = Array.from(descMatches).map(m => m[1]);

    for (let i = 0; i < Math.min(titles.length, 5); i++) {
      posts.push({
        platform: 'blog',
        post_url: '',
        text: `${titles[i] || ''} ${descs[i] || ''}`,
        image_urls: [],
      });
    }
  } catch (error) {
    console.error(`블로그 검색 실패 (${shopName}):`, error);
  }

  return posts;
}

// OpenAI Vision으로 이미지 분석
async function analyzeImageWithVision(imageUrl: string, gachaNames: string[]): Promise<string[]> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `당신은 일본 가챠(캡슐토이) 전문가입니다. 이미지에서 가챠 상품을 식별하세요.
다음 가챠 목록에서 이미지에 보이는 것들만 골라주세요:
${gachaNames.slice(0, 100).join(', ')}

응답은 발견된 가챠 이름만 쉼표로 구분해서 반환하세요. 없으면 "없음"이라고 답하세요.`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: imageUrl, detail: 'low' },
            },
          ],
        },
      ],
      max_tokens: 500,
    });

    const result = response.choices[0]?.message?.content || '';
    if (result === '없음' || !result) return [];

    return result.split(',').map(s => s.trim()).filter(s => s.length > 0);
  } catch (error) {
    console.error('Vision 분석 실패:', error);
    return [];
  }
}

// 텍스트에서 가챠 이름 추출
async function extractGachasFromText(text: string, gachaNames: string[]): Promise<string[]> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `다음 텍스트에서 가챠(캡슐토이) 상품 이름을 찾아주세요.
참고할 가챠 목록: ${gachaNames.slice(0, 50).join(', ')}

발견된 가챠 이름만 쉼표로 구분해서 반환하세요. 없으면 "없음"이라고 답하세요.`,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      max_tokens: 300,
    });

    const result = response.choices[0]?.message?.content || '';
    if (result === '없음' || !result) return [];

    return result.split(',').map(s => s.trim()).filter(s => s.length > 0);
  } catch (error) {
    console.error('텍스트 분석 실패:', error);
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
    await supabase
      .from('gachashop_gachas')
      .upsert({
        gachashop_id: gachashopId,
        gacha_id: match.gacha_id,
        source,
        confidence: match.confidence,
        last_seen_at: new Date().toISOString(),
      }, {
        onConflict: 'gachashop_id,gacha_id',
      });
  }
}

// 분석 로그 저장
async function saveAnalysisLog(
  gachashopId: string,
  platform: string,
  postUrl: string,
  foundGachas: GachaMatch[],
  rawText: string,
  imageUrls: string[]
) {
  await supabase
    .from('sns_analysis_logs')
    .insert({
      gachashop_id: gachashopId,
      platform,
      post_url: postUrl,
      found_gachas: foundGachas,
      raw_text: rawText.substring(0, 1000),
      image_urls: imageUrls,
    });
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
    .limit(10); // 테스트용으로 10개만

  if (!shops || shops.length === 0) {
    console.log('SNS URL이 있는 가차샵이 없습니다.');
    return;
  }

  console.log(`${shops.length}개 가차샵 분석 예정\n`);

  // Puppeteer 브라우저 시작
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  let totalMappings = 0;

  for (let i = 0; i < shops.length; i++) {
    const shop = shops[i];
    console.log(`\n[${i + 1}/${shops.length}] ${shop.name} 분석 중...`);

    const allPosts: PostData[] = [];

    // Instagram 크롤링
    if (shop.instagram_url) {
      console.log(`  Instagram 크롤링...`);
      const igPosts = await crawlInstagram(shop.instagram_url, browser);
      allPosts.push(...igPosts);
      console.log(`    ${igPosts.length}개 포스트, ${igPosts.reduce((a, p) => a + p.image_urls.length, 0)}개 이미지`);
    }

    // Twitter 크롤링
    if (shop.twitter_url) {
      console.log(`  Twitter 크롤링...`);
      const twPosts = await crawlTwitter(shop.twitter_url, browser);
      allPosts.push(...twPosts);
      console.log(`    ${twPosts.length}개 트윗`);
    }

    // 블로그 검색
    console.log(`  블로그 검색...`);
    const blogPosts = await searchNaverBlog(shop.name);
    allPosts.push(...blogPosts);
    console.log(`    ${blogPosts.length}개 블로그 포스트`);

    // 포스트 분석
    const allMatches: GachaMatch[] = [];

    for (const post of allPosts) {
      // 이미지 분석 (최대 3개)
      for (const imgUrl of post.image_urls.slice(0, 3)) {
        console.log(`  이미지 분석 중...`);
        const foundNames = await analyzeImageWithVision(imgUrl, gachaNames);
        const matches = matchGachas(foundNames, gachaMap);
        allMatches.push(...matches);

        // API 속도 제한
        await new Promise(r => setTimeout(r, 1000));
      }

      // 텍스트 분석
      if (post.text && post.text.length > 10) {
        console.log(`  텍스트 분석 중...`);
        const foundNames = await extractGachasFromText(post.text, gachaNames);
        const matches = matchGachas(foundNames, gachaMap);
        allMatches.push(...matches);
      }

      // 분석 로그 저장
      if (allMatches.length > 0) {
        await saveAnalysisLog(
          shop.id,
          post.platform,
          post.post_url,
          allMatches,
          post.text,
          post.image_urls
        );
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
      uniqueMatches.forEach(m => console.log(`    - ${m.gacha_name} (신뢰도: ${m.confidence})`));
    } else {
      console.log(`  - 매핑된 가챠 없음`);
    }

    // 속도 제한
    await new Promise(r => setTimeout(r, 2000));
  }

  await browser.close();

  console.log('\n=== 분석 완료 ===');
  console.log(`총 ${totalMappings}개 가차-가차샵 매핑 생성`);
}

main().catch(console.error);
