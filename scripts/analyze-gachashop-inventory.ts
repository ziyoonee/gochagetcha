/**
 * DB의 가차샵 기준으로 인스타그램 이미지 분석하여 보유 가차 추출
 *
 * 흐름:
 * 1. Supabase에서 가차샵 목록 조회 (instagram_url 있는 것만)
 * 2. 인스타그램 게시물 이미지 분석 (GPT-4 Vision)
 * 3. 발견된 가차 목록 추출
 * 4. (2차) DB에 있는 가차와 매칭
 *
 * 실행: npx tsx scripts/analyze-gachashop-inventory.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// .env.local 파일 로드
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

if (!OPENAI_API_KEY || OPENAI_API_KEY.includes('여기에')) {
  console.error('❌ OPENAI_API_KEY가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DB 가차샵 타입
interface DBGachashop {
  id: string;
  name: string;
  address: string;
  instagram_url?: string;
  image_url?: string;
}

// DB 가차 타입
interface DBGacha {
  id: string;
  name: string;
  name_ko?: string;
  brand: string;
  price: number;
  category: string;
}

// 분석 결과 타입
interface AnalyzedGacha {
  name: string;
  nameKo?: string;
  brand?: string;
  estimatedPrice?: number;
  category?: string;
  confidence: 'high' | 'medium' | 'low';
  matchedDbGacha?: DBGacha; // DB 매칭 결과
}

interface AnalysisResult {
  gachashop: DBGachashop;
  analyzedGachas: AnalyzedGacha[];
  rawResponse: string;
}

// DB에서 가차샵 목록 조회
async function fetchGachashopsFromDB(): Promise<DBGachashop[]> {
  console.log('📦 DB에서 가차샵 목록 조회 중...');

  const { data, error } = await supabase
    .from('gachashops')
    .select('id, name, address, instagram_url, image_url')
    .not('instagram_url', 'is', null)
    .order('name');

  if (error) {
    console.error('DB 조회 실패:', error);
    return [];
  }

  console.log(`   ${data?.length || 0}개 가차샵 발견 (인스타 URL 있음)\n`);
  return data || [];
}

// DB에서 모든 가차 조회 (매칭용)
async function fetchGachasFromDB(): Promise<DBGacha[]> {
  console.log('📦 DB에서 가차 목록 조회 중...');

  const { data, error } = await supabase
    .from('gachas')
    .select('id, name, name_ko, brand, price, category');

  if (error) {
    console.error('DB 조회 실패:', error);
    return [];
  }

  console.log(`   ${data?.length || 0}개 가차 로드됨\n`);
  return data || [];
}

// 인스타그램 URL에서 이미지 URL 추출 (프로필/게시물)
async function getInstagramImageUrl(instagramUrl: string): Promise<string | null> {
  // 인스타그램은 직접 크롤링이 어려우므로,
  // 일단 가차샵의 대표 이미지(image_url)를 사용하거나
  // 수동으로 이미지 URL을 입력받는 방식으로 진행

  // TODO: 인스타그램 API 연동 또는 수동 입력 방식 추가
  return null;
}

// GPT-4 Vision으로 이미지 분석
async function analyzeImageWithGPT4(imageUrl: string): Promise<string> {
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
          content: `당신은 일본 가챠폰(캡슐토이) 전문가입니다.
이미지에서 가챠 기계나 가챠 상품을 식별하고 정보를 추출합니다.

다음 형식의 JSON으로 응답해주세요:
{
  "gachas": [
    {
      "name": "상품명 (원본 일본어/영어)",
      "nameKo": "상품명 (한국어 번역)",
      "brand": "브랜드 (반다이, 타카라토미, 리멘트, 에포크, 기타)",
      "estimatedPrice": 가격(숫자, 원화 기준 300-1000),
      "category": "카테고리 (캐릭터, 동물, 애니메이션, 미니어처, 피규어, 실용품, 기타)",
      "confidence": "high/medium/low"
    }
  ],
  "totalMachinesVisible": 보이는 가챠 기계 수,
  "notes": "추가 참고사항"
}

- 가능한 많은 가챠를 식별해주세요
- 글씨가 보이면 그대로 읽어주세요
- 확신이 낮아도 일단 포함시키고 confidence를 low로 표시`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: '이 가챠샵 사진에서 보이는 모든 가챠 상품을 분석해주세요.',
            },
            {
              type: 'image_url',
              image_url: { url: imageUrl, detail: 'high' },
            },
          ],
        },
      ],
      max_tokens: 3000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API 오류: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// GPT 응답 파싱
function parseGPTResponse(response: string): AnalyzedGacha[] {
  try {
    let jsonStr = response;
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    } else {
      const braceMatch = response.match(/\{[\s\S]*\}/);
      if (braceMatch) {
        jsonStr = braceMatch[0];
      }
    }

    const parsed = JSON.parse(jsonStr);
    return parsed.gachas || [];
  } catch (e) {
    console.error('  JSON 파싱 실패');
    return [];
  }
}

// DB 가차와 매칭 (유사도 기반)
function matchWithDBGachas(analyzedGachas: AnalyzedGacha[], dbGachas: DBGacha[]): AnalyzedGacha[] {
  return analyzedGachas.map((analyzed) => {
    const searchTerms = [
      analyzed.name.toLowerCase(),
      analyzed.nameKo?.toLowerCase(),
    ].filter(Boolean);

    // 간단한 키워드 매칭
    for (const dbGacha of dbGachas) {
      const dbTerms = [
        dbGacha.name.toLowerCase(),
        dbGacha.name_ko?.toLowerCase(),
      ].filter(Boolean);

      for (const searchTerm of searchTerms) {
        for (const dbTerm of dbTerms) {
          // 부분 문자열 매칭
          if (
            searchTerm!.includes(dbTerm!) ||
            dbTerm!.includes(searchTerm!) ||
            // 브랜드 + 키워드 매칭
            (analyzed.brand?.toLowerCase() === dbGacha.brand.toLowerCase() &&
              searchTerm!.split(' ').some((word) => dbTerm!.includes(word)))
          ) {
            return { ...analyzed, matchedDbGacha: dbGacha };
          }
        }
      }
    }

    return analyzed;
  });
}

// 결과 저장
function saveResults(results: AnalysisResult[], dbGachas: DBGacha[]) {
  const outputDir = path.join(__dirname, 'inventory-analysis');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  // 상세 JSON
  const jsonPath = path.join(outputDir, `inventory-${timestamp}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));

  // 요약 리포트
  let report = `# 가차샵 보유 가차 분석 결과\n`;
  report += `생성일: ${new Date().toLocaleString('ko-KR')}\n\n`;

  let totalAnalyzed = 0;
  let totalMatched = 0;

  for (const result of results) {
    report += `## ${result.gachashop.name}\n`;
    report += `주소: ${result.gachashop.address}\n`;
    report += `인스타: ${result.gachashop.instagram_url || '-'}\n\n`;

    report += `### 발견된 가차 (${result.analyzedGachas.length}개)\n`;

    for (const gacha of result.analyzedGachas) {
      totalAnalyzed++;
      const matchStatus = gacha.matchedDbGacha ? '✅ DB 매칭' : '❓ 신규';
      if (gacha.matchedDbGacha) totalMatched++;

      report += `- ${gacha.nameKo || gacha.name} [${matchStatus}]\n`;
      report += `  - 브랜드: ${gacha.brand || '?'}, 가격: ${gacha.estimatedPrice || '?'}원\n`;
      report += `  - 카테고리: ${gacha.category || '?'}, 확신도: ${gacha.confidence}\n`;
      if (gacha.matchedDbGacha) {
        report += `  - DB 매칭: ${gacha.matchedDbGacha.name} (ID: ${gacha.matchedDbGacha.id})\n`;
      }
    }
    report += '\n---\n\n';
  }

  report += `## 요약\n`;
  report += `- 분석된 가차샵: ${results.length}개\n`;
  report += `- 발견된 가차: ${totalAnalyzed}개\n`;
  report += `- DB 매칭: ${totalMatched}개 (${((totalMatched / totalAnalyzed) * 100).toFixed(1)}%)\n`;
  report += `- 신규 가차: ${totalAnalyzed - totalMatched}개\n`;

  const reportPath = path.join(outputDir, `inventory-${timestamp}.md`);
  fs.writeFileSync(reportPath, report);

  // SQL 생성 (gachashop_gachas 연결용)
  let sql = `-- 가차샵-가차 연결 SQL\n-- ${new Date().toLocaleString('ko-KR')}\n\n`;

  for (const result of results) {
    sql += `-- ${result.gachashop.name}\n`;
    for (const gacha of result.analyzedGachas) {
      if (gacha.matchedDbGacha) {
        sql += `INSERT INTO gachashop_gachas (gachashop_id, gacha_id) VALUES ('${result.gachashop.id}', '${gacha.matchedDbGacha.id}') ON CONFLICT DO NOTHING;\n`;
      }
    }
    sql += '\n';
  }

  const sqlPath = path.join(outputDir, `inventory-${timestamp}.sql`);
  fs.writeFileSync(sqlPath, sql);

  console.log(`\n📄 결과 저장:`);
  console.log(`   JSON: ${jsonPath}`);
  console.log(`   리포트: ${reportPath}`);
  console.log(`   SQL: ${sqlPath}`);
}

// 수동 이미지 URL 입력 모드
async function manualMode(dbGachas: DBGacha[]) {
  console.log('\n=== 수동 분석 모드 ===');
  console.log('사용법: npx tsx scripts/analyze-gachashop-inventory.ts <가차샵ID> <이미지URL>\n');

  const [, , shopId, imageUrl] = process.argv;

  if (!shopId || !imageUrl) {
    console.log('예시:');
    console.log('  npx tsx scripts/analyze-gachashop-inventory.ts shop-123 https://example.com/image.jpg');
    return;
  }

  // 가차샵 조회
  const { data: shop } = await supabase
    .from('gachashops')
    .select('id, name, address, instagram_url')
    .eq('id', shopId)
    .single();

  if (!shop) {
    console.error(`❌ 가차샵을 찾을 수 없습니다: ${shopId}`);
    return;
  }

  console.log(`🏪 ${shop.name}`);
  console.log(`🔍 이미지 분석 중...\n`);

  try {
    const response = await analyzeImageWithGPT4(imageUrl);
    const analyzedGachas = parseGPTResponse(response);
    const matchedGachas = matchWithDBGachas(analyzedGachas, dbGachas);

    console.log(`📦 발견된 가차: ${matchedGachas.length}개\n`);

    for (const gacha of matchedGachas) {
      const matchStatus = gacha.matchedDbGacha ? '✅' : '❓';
      console.log(`${matchStatus} ${gacha.nameKo || gacha.name}`);
      console.log(`   브랜드: ${gacha.brand || '?'}, 카테고리: ${gacha.category || '?'}`);
      if (gacha.matchedDbGacha) {
        console.log(`   → DB 매칭: ${gacha.matchedDbGacha.name}`);
      }
    }

    const result: AnalysisResult = {
      gachashop: shop,
      analyzedGachas: matchedGachas,
      rawResponse: response,
    };

    saveResults([result], dbGachas);
  } catch (error) {
    console.error('❌ 분석 실패:', error);
  }
}

// 메인 함수
async function main() {
  console.log('=== 가차샵 보유 가차 분석 ===\n');

  // DB에서 가차 목록 로드 (매칭용)
  const dbGachas = await fetchGachasFromDB();

  // 명령줄 인자가 있으면 수동 모드
  if (process.argv.length > 2) {
    await manualMode(dbGachas);
    return;
  }

  // 자동 모드: DB에서 인스타 URL 있는 가차샵 분석
  const gachashops = await fetchGachashopsFromDB();

  if (gachashops.length === 0) {
    console.log('인스타그램 URL이 있는 가차샵이 없습니다.');
    console.log('\n수동 분석 모드 사용:');
    console.log('  npx tsx scripts/analyze-gachashop-inventory.ts <가차샵ID> <이미지URL>');
    return;
  }

  // 가차샵의 대표 이미지로 분석 (image_url 사용)
  const shopsWithImages = gachashops.filter((s) => s.image_url);
  console.log(`🖼️  이미지 있는 가차샵: ${shopsWithImages.length}개\n`);

  const results: AnalysisResult[] = [];

  for (let i = 0; i < shopsWithImages.length; i++) {
    const shop = shopsWithImages[i];
    console.log(`[${i + 1}/${shopsWithImages.length}] ${shop.name} 분석 중...`);

    try {
      const response = await analyzeImageWithGPT4(shop.image_url!);
      const analyzedGachas = parseGPTResponse(response);
      const matchedGachas = matchWithDBGachas(analyzedGachas, dbGachas);

      results.push({
        gachashop: shop,
        analyzedGachas: matchedGachas,
        rawResponse: response,
      });

      const matchedCount = matchedGachas.filter((g) => g.matchedDbGacha).length;
      console.log(`  ✅ ${matchedGachas.length}개 발견 (DB 매칭: ${matchedCount}개)`);

      // API 요청 간 딜레이
      await new Promise((r) => setTimeout(r, 1500));
    } catch (error) {
      console.error(`  ❌ 분석 실패:`, error);
    }
  }

  if (results.length > 0) {
    saveResults(results, dbGachas);
  }

  console.log('\n=== 분석 완료 ===');
}

main().catch(console.error);
