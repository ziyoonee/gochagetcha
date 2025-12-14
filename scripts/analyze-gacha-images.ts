/**
 * GPT-4 Vision을 활용한 가차 이미지 분석 스크립트
 * 인스타그램 등 SNS 이미지에서 가차 상품 정보를 추출합니다.
 *
 * 실행: npx tsx scripts/analyze-gacha-images.ts
 *
 * 사용법:
 * 1. OPENAI_API_KEY가 .env.local에 설정되어 있어야 함
 * 2. 아래 imageUrls 배열에 분석할 이미지 URL 추가
 * 3. 스크립트 실행
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// .env.local 파일 로드
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY || OPENAI_API_KEY.includes('여기에')) {
  console.error('❌ OPENAI_API_KEY가 설정되지 않았습니다.');
  console.error('   .env.local 파일에 OpenAI API 키를 입력해주세요.');
  process.exit(1);
}

// 분석할 이미지 URL 목록 (가차샵 ID와 함께)
interface ImageToAnalyze {
  gachashopId: string;
  gachashopName: string;
  imageUrl: string;
}

// 여기에 분석할 이미지 추가
const imagesToAnalyze: ImageToAnalyze[] = [
  // 예시:
  // {
  //   gachashopId: 'shop-1',
  //   gachashopName: '가차파라다이스 홍대점',
  //   imageUrl: 'https://instagram.com/p/xxx/media',
  // },
];

// 분석 결과 타입
interface GachaAnalysisResult {
  gachashopId: string;
  gachashopName: string;
  imageUrl: string;
  gachas: {
    name: string;
    nameKo?: string;
    brand?: string;
    estimatedPrice?: number;
    category?: string;
    confidence: 'high' | 'medium' | 'low';
  }[];
  rawResponse: string;
}

// GPT-4 Vision으로 이미지 분석
async function analyzeImageWithGPT4Vision(imageUrl: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `당신은 일본 가챠폰(캡슐토이) 전문가입니다.
이미지에서 가챠 기계나 가챠 상품을 식별하고 정보를 추출합니다.

다음 형식의 JSON으로 응답해주세요:
{
  "gachas": [
    {
      "name": "상품명 (일본어/영어)",
      "nameKo": "상품명 (한국어 번역)",
      "brand": "브랜드 (반다이, 타카라토미, 리멘트 등)",
      "estimatedPrice": 가격 (숫자, 원화 기준 추정),
      "category": "카테고리 (캐릭터, 동물, 애니메이션, 미니어처 등)",
      "confidence": "high/medium/low (확신도)"
    }
  ],
  "notes": "추가 참고사항"
}

이미지에서 가챠가 보이지 않으면 빈 배열을 반환하세요.
가격을 추정할 때 일반적으로 300~800원 범위입니다.`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: '이 이미지에서 가챠(캡슐토이) 상품들을 분석해주세요. 보이는 모든 가챠 상품의 정보를 추출해주세요.',
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
                detail: 'high',
              },
            },
          ],
        },
      ],
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API 오류: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// JSON 응답 파싱
function parseGPTResponse(response: string): { gachas: GachaAnalysisResult['gachas']; notes?: string } {
  try {
    // JSON 블록 추출 (```json ... ``` 형식 처리)
    let jsonStr = response;
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    } else {
      // 중괄호로 시작하는 JSON 찾기
      const braceMatch = response.match(/\{[\s\S]*\}/);
      if (braceMatch) {
        jsonStr = braceMatch[0];
      }
    }

    const parsed = JSON.parse(jsonStr);
    return {
      gachas: parsed.gachas || [],
      notes: parsed.notes,
    };
  } catch (e) {
    console.error('  JSON 파싱 실패:', e);
    return { gachas: [] };
  }
}

// 결과를 SQL로 변환
function generateSQL(results: GachaAnalysisResult[]): string {
  let sql = `-- GPT-4 Vision 분석 결과\n`;
  sql += `-- 생성일: ${new Date().toISOString()}\n\n`;

  const allGachas: Set<string> = new Set();
  const connections: { gachashopId: string; gachaName: string }[] = [];

  for (const result of results) {
    sql += `-- ${result.gachashopName} (${result.gachashopId})\n`;
    sql += `-- 이미지: ${result.imageUrl}\n`;

    for (const gacha of result.gachas) {
      if (!allGachas.has(gacha.name)) {
        allGachas.add(gacha.name);
        const name = gacha.name.replace(/'/g, "''");
        const nameKo = (gacha.nameKo || gacha.name).replace(/'/g, "''");
        const brand = (gacha.brand || '알 수 없음').replace(/'/g, "''");
        const price = gacha.estimatedPrice || 500;
        const category = (gacha.category || '기타').replace(/'/g, "''");

        sql += `INSERT INTO gachas (name, name_ko, brand, price, category) VALUES ('${name}', '${nameKo}', '${brand}', ${price}, '${category}') ON CONFLICT (name) DO NOTHING;\n`;
      }

      connections.push({ gachashopId: result.gachashopId, gachaName: gacha.name });
    }
    sql += '\n';
  }

  // 연결 테이블 INSERT
  sql += `-- 가차샵-가차 연결\n`;
  for (const conn of connections) {
    const gachaName = conn.gachaName.replace(/'/g, "''");
    sql += `INSERT INTO gachashop_gachas (gachashop_id, gacha_id)
SELECT '${conn.gachashopId}', id FROM gachas WHERE name = '${gachaName}'
ON CONFLICT DO NOTHING;\n`;
  }

  return sql;
}

// 결과를 JSON으로 저장
function saveResults(results: GachaAnalysisResult[]) {
  const outputDir = path.join(__dirname, 'analysis-results');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  // JSON 저장
  const jsonPath = path.join(outputDir, `analysis-${timestamp}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 JSON 저장: ${jsonPath}`);

  // SQL 저장
  const sqlPath = path.join(outputDir, `analysis-${timestamp}.sql`);
  fs.writeFileSync(sqlPath, generateSQL(results));
  console.log(`📄 SQL 저장: ${sqlPath}`);
}

// 단일 이미지 분석 (CLI에서 사용)
export async function analyzeImage(imageUrl: string): Promise<void> {
  console.log('\n🔍 이미지 분석 중...');
  console.log(`   URL: ${imageUrl}\n`);

  try {
    const response = await analyzeImageWithGPT4Vision(imageUrl);
    const parsed = parseGPTResponse(response);

    console.log('📦 발견된 가챠:');
    if (parsed.gachas.length === 0) {
      console.log('   (가챠를 찾을 수 없음)');
    } else {
      for (const gacha of parsed.gachas) {
        console.log(`   - ${gacha.nameKo || gacha.name}`);
        console.log(`     브랜드: ${gacha.brand || '?'}, 가격: ${gacha.estimatedPrice || '?'}원`);
        console.log(`     카테고리: ${gacha.category || '?'}, 확신도: ${gacha.confidence}`);
      }
    }

    if (parsed.notes) {
      console.log(`\n📝 참고: ${parsed.notes}`);
    }
  } catch (error) {
    console.error('❌ 분석 실패:', error);
  }
}

// 메인 함수
async function main() {
  console.log('=== GPT-4 Vision 가챠 이미지 분석 ===\n');

  // 명령줄 인자로 이미지 URL이 주어진 경우
  const cliImageUrl = process.argv[2];
  if (cliImageUrl) {
    await analyzeImage(cliImageUrl);
    return;
  }

  // 배열에 정의된 이미지 분석
  if (imagesToAnalyze.length === 0) {
    console.log('분석할 이미지가 없습니다.');
    console.log('\n사용법:');
    console.log('  1. 스크립트 내 imagesToAnalyze 배열에 이미지 추가');
    console.log('  2. 또는 CLI에서 직접 URL 전달:');
    console.log('     npx tsx scripts/analyze-gacha-images.ts "이미지URL"');
    return;
  }

  const results: GachaAnalysisResult[] = [];

  for (let i = 0; i < imagesToAnalyze.length; i++) {
    const item = imagesToAnalyze[i];
    console.log(`[${i + 1}/${imagesToAnalyze.length}] ${item.gachashopName} 분석 중...`);

    try {
      const response = await analyzeImageWithGPT4Vision(item.imageUrl);
      const parsed = parseGPTResponse(response);

      results.push({
        gachashopId: item.gachashopId,
        gachashopName: item.gachashopName,
        imageUrl: item.imageUrl,
        gachas: parsed.gachas,
        rawResponse: response,
      });

      console.log(`  ✅ ${parsed.gachas.length}개 가챠 발견`);

      // API 요청 간 딜레이
      if (i < imagesToAnalyze.length - 1) {
        await new Promise((r) => setTimeout(r, 1000));
      }
    } catch (error) {
      console.error(`  ❌ 분석 실패:`, error);
    }
  }

  if (results.length > 0) {
    saveResults(results);
  }

  console.log('\n=== 분석 완료 ===');
}

main().catch(console.error);
