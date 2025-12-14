/**
 * 인스타그램에서 가차샵 게시물을 크롤링하고 GPT-4로 보유 가차 분석
 *
 * 실행: npx tsx scripts/crawl-instagram-gachas.ts <인스타그램URL>
 * 예시: npx tsx scripts/crawl-instagram-gachas.ts https://www.instagram.com/gachaparadise_kr
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

if (!OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY가 설정되지 않았습니다.');
  process.exit(1);
}

interface InstagramPost {
  imageUrl: string;
  caption: string;
  timestamp?: string;
}

interface AnalyzedGacha {
  name: string;
  nameKo?: string;
  brand?: string;
  estimatedPrice?: number;
  category?: string;
  confidence: 'high' | 'medium' | 'low';
  source: 'image' | 'caption' | 'both';
}

// 인스타그램 프로필에서 게시물 정보 추출 시도
async function fetchInstagramPosts(profileUrl: string): Promise<InstagramPost[]> {
  console.log('📱 인스타그램 프로필 접근 중...');

  const headers = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
  };

  try {
    const response = await fetch(profileUrl, { headers });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();

    // 인스타그램 페이지에서 데이터 추출 시도
    // 참고: 인스타그램은 로그인 없이 접근이 제한될 수 있음

    // 방법 1: __additionalDataLoaded 또는 window._sharedData에서 JSON 추출
    const sharedDataMatch = html.match(/window\._sharedData\s*=\s*({.+?});<\/script>/);
    const additionalDataMatch = html.match(
      /window\.__additionalDataLoaded\s*\([^,]+,\s*({.+?})\);/
    );

    let posts: InstagramPost[] = [];

    if (sharedDataMatch) {
      try {
        const data = JSON.parse(sharedDataMatch[1]);
        const edges =
          data?.entry_data?.ProfilePage?.[0]?.graphql?.user?.edge_owner_to_timeline_media?.edges ||
          [];

        posts = edges.slice(0, 12).map((edge: any) => ({
          imageUrl: edge.node.display_url || edge.node.thumbnail_src,
          caption: edge.node.edge_media_to_caption?.edges?.[0]?.node?.text || '',
          timestamp: edge.node.taken_at_timestamp
            ? new Date(edge.node.taken_at_timestamp * 1000).toISOString()
            : undefined,
        }));
      } catch (e) {
        console.log('  _sharedData 파싱 실패');
      }
    }

    if (posts.length === 0 && additionalDataMatch) {
      try {
        const data = JSON.parse(additionalDataMatch[1]);
        // 추가 데이터 파싱 로직
      } catch (e) {
        console.log('  __additionalDataLoaded 파싱 실패');
      }
    }

    // 방법 2: og:image 메타 태그에서 최소한의 이미지 추출
    if (posts.length === 0) {
      const ogImageMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
      if (ogImageMatch) {
        posts.push({
          imageUrl: ogImageMatch[1],
          caption: '',
        });
      }
    }

    return posts;
  } catch (error) {
    console.error('❌ 인스타그램 접근 실패:', error);
    return [];
  }
}

// GPT-4 Vision으로 이미지 + 캡션 분석
async function analyzeWithGPT4(posts: InstagramPost[]): Promise<AnalyzedGacha[]> {
  if (posts.length === 0) {
    return [];
  }

  console.log(`\n🔍 ${posts.length}개 게시물 분석 중...`);

  // 모든 게시물의 캡션을 하나로 합침
  const allCaptions = posts
    .map((p, i) => `[게시물 ${i + 1}] ${p.caption}`)
    .filter((c) => c.length > 10)
    .join('\n\n');

  // 이미지들과 캡션을 함께 분석
  const content: any[] = [
    {
      type: 'text',
      text: `이 가차샵의 인스타그램 게시물들입니다. 이미지와 캡션을 분석해서 이 가차샵이 보유하고 있는 가차 상품들을 모두 추출해주세요.

[게시물 캡션들]
${allCaptions || '(캡션 없음)'}

다음 형식의 JSON으로 응답해주세요:
{
  "gachas": [
    {
      "name": "상품명 (원본)",
      "nameKo": "상품명 (한국어)",
      "brand": "브랜드 (반다이/타카라토미/리멘트/에포크/기타)",
      "estimatedPrice": 가격(숫자, 300-1000원),
      "category": "카테고리 (캐릭터/동물/애니메이션/미니어처/피규어/기타)",
      "confidence": "high/medium/low",
      "source": "image/caption/both"
    }
  ],
  "shopInfo": {
    "specialty": "주력 상품 카테고리",
    "notes": "참고사항"
  }
}

- 이미지에서 보이는 가차 기계/상품을 모두 식별
- 캡션에서 언급된 상품명, 브랜드, 신상품 정보 추출
- 해시태그에서 상품 정보 추출
- 중복 제거하고 고유한 상품만 나열`,
    },
  ];

  // 이미지 추가 (최대 10개)
  for (const post of posts.slice(0, 10)) {
    if (post.imageUrl) {
      content.push({
        type: 'image_url',
        image_url: { url: post.imageUrl, detail: 'high' },
      });
    }
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content:
              '당신은 일본 가챠폰(캡슐토이) 전문가입니다. 이미지와 텍스트에서 가챠 상품 정보를 정확하게 추출합니다.',
          },
          { role: 'user', content },
        ],
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API 오류: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const responseText = data.choices[0].message.content;

    // JSON 파싱
    let jsonStr = responseText;
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    } else {
      const braceMatch = responseText.match(/\{[\s\S]*\}/);
      if (braceMatch) {
        jsonStr = braceMatch[0];
      }
    }

    const parsed = JSON.parse(jsonStr);
    return parsed.gachas || [];
  } catch (error) {
    console.error('❌ GPT-4 분석 실패:', error);
    return [];
  }
}

// 결과 저장
function saveResults(
  profileUrl: string,
  posts: InstagramPost[],
  gachas: AnalyzedGacha[]
) {
  const outputDir = path.join(__dirname, 'instagram-analysis');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const profileName = profileUrl.split('/').filter(Boolean).pop() || 'unknown';

  // JSON 저장
  const result = {
    profileUrl,
    analyzedAt: new Date().toISOString(),
    postsAnalyzed: posts.length,
    gachasFound: gachas.length,
    gachas,
  };

  const jsonPath = path.join(outputDir, `${profileName}-${timestamp}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2));

  console.log(`\n📄 결과 저장: ${jsonPath}`);

  return result;
}

// 메인 함수
async function main() {
  const instagramUrl = process.argv[2];

  if (!instagramUrl) {
    console.log('사용법: npx tsx scripts/crawl-instagram-gachas.ts <인스타그램URL>');
    console.log('');
    console.log('예시:');
    console.log('  npx tsx scripts/crawl-instagram-gachas.ts https://www.instagram.com/gachaparadise_kr');
    console.log('');
    console.log('또는 이미지 URL 직접 입력:');
    console.log('  npx tsx scripts/crawl-instagram-gachas.ts --image "이미지URL1" "이미지URL2"');
    return;
  }

  console.log('=== 인스타그램 가차샵 분석 ===\n');

  // --image 옵션: 이미지 URL 직접 입력
  if (instagramUrl === '--image') {
    const imageUrls = process.argv.slice(3);
    if (imageUrls.length === 0) {
      console.log('이미지 URL을 입력해주세요.');
      return;
    }

    const posts: InstagramPost[] = imageUrls.map((url) => ({
      imageUrl: url,
      caption: '',
    }));

    console.log(`🖼️  ${posts.length}개 이미지 분석`);

    const gachas = await analyzeWithGPT4(posts);
    console.log(`\n📦 발견된 가차: ${gachas.length}개\n`);

    for (const gacha of gachas) {
      const emoji = gacha.confidence === 'high' ? '✅' : gacha.confidence === 'medium' ? '🟡' : '❓';
      console.log(`${emoji} ${gacha.nameKo || gacha.name}`);
      console.log(`   브랜드: ${gacha.brand || '?'} | 가격: ${gacha.estimatedPrice || '?'}원 | ${gacha.category || '?'}`);
    }

    saveResults('direct-images', posts, gachas);
    return;
  }

  // 인스타그램 프로필 크롤링
  const posts = await fetchInstagramPosts(instagramUrl);

  if (posts.length === 0) {
    console.log('\n⚠️  인스타그램에서 게시물을 가져올 수 없습니다.');
    console.log('   인스타그램은 로그인 없이 접근이 제한됩니다.');
    console.log('\n대안: 이미지 URL을 직접 입력해주세요:');
    console.log('  npx tsx scripts/crawl-instagram-gachas.ts --image "이미지URL1" "이미지URL2"');
    console.log('\n이미지 URL 얻는 방법:');
    console.log('  1. 인스타그램 게시물 열기');
    console.log('  2. 이미지 우클릭 → "이미지 주소 복사"');
    return;
  }

  console.log(`✅ ${posts.length}개 게시물 발견`);

  // GPT-4로 분석
  const gachas = await analyzeWithGPT4(posts);

  console.log(`\n📦 발견된 가차: ${gachas.length}개\n`);

  for (const gacha of gachas) {
    const emoji = gacha.confidence === 'high' ? '✅' : gacha.confidence === 'medium' ? '🟡' : '❓';
    console.log(`${emoji} ${gacha.nameKo || gacha.name}`);
    console.log(`   브랜드: ${gacha.brand || '?'} | 가격: ${gacha.estimatedPrice || '?'}원 | ${gacha.category || '?'}`);
  }

  saveResults(instagramUrl, posts, gachas);

  console.log('\n=== 완료 ===');
}

main().catch(console.error);
