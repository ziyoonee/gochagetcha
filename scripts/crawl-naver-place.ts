/**
 * 네이버 플레이스에서 가차샵 리뷰 수, 평점 크롤링
 * 실행: npx tsx scripts/crawl-naver-place.ts
 *
 * 주의: 네이버가 UI를 자주 변경하므로 작동하지 않을 수 있습니다.
 */

import * as fs from 'fs';
import * as path from 'path';

interface GachashopInfo {
  name: string;
  address: string;
}

interface PlaceInfo {
  name: string;
  reviewCount: number;
  rating: number | null;
  naverPlaceId: string | null;
}

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
  'Referer': 'https://www.naver.com/',
};

// SQL 파일에서 가차샵 정보 추출
function parseGachashopsFromSQL(sqlPath: string): GachashopInfo[] {
  const content = fs.readFileSync(sqlPath, 'utf-8');
  const shops: GachashopInfo[] = [];

  const regex = /VALUES \('([^']+)', '([^']+)',/g;
  let match;

  while ((match = regex.exec(content)) !== null) {
    shops.push({
      name: match[1],
      address: match[2]
    });
  }

  return shops;
}

// 네이버 검색에서 플레이스 정보 추출
async function searchNaverPlace(shopName: string, address: string): Promise<PlaceInfo | null> {
  try {
    // 주소에서 시/구 추출
    const location = address.split(' ').slice(0, 2).join(' ');
    const query = encodeURIComponent(`${shopName} ${location}`);

    // 네이버 통합 검색
    const searchUrl = `https://search.naver.com/search.naver?where=nexearch&query=${query}`;
    const response = await fetch(searchUrl, { headers });
    const html = await response.text();

    let reviewCount = 0;
    let rating: number | null = null;
    let naverPlaceId: string | null = null;

    // 플레이스 ID 추출 (place/xxxxx 형태)
    const placeIdMatch = html.match(/place\/(\d+)/);
    if (placeIdMatch) {
      naverPlaceId = placeIdMatch[1];
    }

    // 방문자 리뷰 수 추출 (여러 패턴 시도)
    // 패턴 1: "리뷰 123" 또는 "방문자리뷰 123"
    const reviewPatterns = [
      /방문자리뷰\s*(\d+(?:,\d+)*)/,
      /리뷰\s*(\d+(?:,\d+)*)/,
      /review[^>]*>(\d+(?:,\d+)*)/i,
      /"reviewCount"\s*:\s*(\d+)/,
      /후기\s*(\d+(?:,\d+)*)/,
    ];

    for (const pattern of reviewPatterns) {
      const match = html.match(pattern);
      if (match) {
        reviewCount = parseInt(match[1].replace(/,/g, ''), 10);
        break;
      }
    }

    // 평점 추출
    const ratingPatterns = [
      /별점\s*(\d+\.?\d*)/,
      /"rating"\s*:\s*(\d+\.?\d*)/,
      /data-rating="(\d+\.?\d*)"/,
      /class="[^"]*score[^"]*"[^>]*>(\d+\.?\d*)/i,
    ];

    for (const pattern of ratingPatterns) {
      const match = html.match(pattern);
      if (match) {
        rating = parseFloat(match[1]);
        if (rating > 5) rating = rating / 10; // 50점 만점인 경우 변환
        break;
      }
    }

    // 플레이스 페이지 직접 조회 시도
    if (naverPlaceId && reviewCount === 0) {
      try {
        const placeUrl = `https://m.place.naver.com/place/${naverPlaceId}/home`;
        const placeResponse = await fetch(placeUrl, { headers });
        const placeHtml = await placeResponse.text();

        // JSON-LD 또는 스크립트에서 데이터 추출
        const jsonMatch = placeHtml.match(/"visitorReviewCount"\s*:\s*(\d+)/);
        if (jsonMatch) {
          reviewCount = parseInt(jsonMatch[1], 10);
        }

        const ratingMatch = placeHtml.match(/"ratingScore"\s*:\s*"?(\d+\.?\d*)"?/);
        if (ratingMatch) {
          rating = parseFloat(ratingMatch[1]);
        }
      } catch (e) {
        // 플레이스 페이지 접근 실패 시 무시
      }
    }

    return {
      name: shopName,
      reviewCount,
      rating,
      naverPlaceId,
    };
  } catch (error) {
    console.error(`  검색 실패: ${shopName}`, error);
    return null;
  }
}

// UPDATE SQL 생성
function generateUpdateSQL(results: PlaceInfo[]): string {
  let sql = `-- 가차샵 인기도 정보 업데이트\n`;
  sql += `-- Supabase SQL Editor에서 실행\n`;
  sql += `-- 생성일: ${new Date().toISOString()}\n\n`;

  for (const place of results) {
    const name = place.name.replace(/'/g, "''");
    const ratingStr = place.rating !== null ? `${place.rating}` : 'NULL';
    const placeIdStr = place.naverPlaceId ? `'${place.naverPlaceId}'` : 'NULL';

    sql += `UPDATE gachashops SET review_count = ${place.reviewCount}, rating = ${ratingStr}, naver_place_id = ${placeIdStr} WHERE name = '${name}';\n`;
  }

  return sql;
}

async function main() {
  console.log('=== 네이버 플레이스 크롤링 시작 ===\n');

  // SQL 파일에서 가차샵 목록 읽기
  const sqlPath = path.join(__dirname, 'gachashops-seed-v2.sql');

  if (!fs.existsSync(sqlPath)) {
    console.error('gachashops-seed-v2.sql 파일을 찾을 수 없습니다.');
    return;
  }

  const shops = parseGachashopsFromSQL(sqlPath);
  console.log(`${shops.length}개 가차샵 발견\n`);

  const results: PlaceInfo[] = [];
  let foundCount = 0;

  for (let i = 0; i < shops.length; i++) {
    const shop = shops[i];
    process.stdout.write(`\r[${i + 1}/${shops.length}] ${shop.name} 검색 중...                    `);

    const placeInfo = await searchNaverPlace(shop.name, shop.address);

    if (placeInfo) {
      results.push(placeInfo);
      if (placeInfo.reviewCount > 0) {
        foundCount++;
        console.log(`\n  -> 리뷰 ${placeInfo.reviewCount}개, 평점 ${placeInfo.rating ?? 'N/A'}`);
      }
    }

    // 딜레이 (1초) - 네이버 차단 방지
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log(`\n\n총 ${foundCount}/${shops.length}개 리뷰 정보 발견`);

  // 결과 저장
  if (results.length > 0) {
    // SQL 파일
    const sql = generateUpdateSQL(results);
    const sqlOutputPath = path.join(__dirname, 'gachashops-popularity-update.sql');
    fs.writeFileSync(sqlOutputPath, sql);
    console.log(`\nSQL 저장됨: ${sqlOutputPath}`);

    // JSON 파일 (디버깅용)
    const jsonOutputPath = path.join(__dirname, 'gachashops-popularity.json');
    fs.writeFileSync(jsonOutputPath, JSON.stringify(results, null, 2));
    console.log(`JSON 저장됨: ${jsonOutputPath}`);

    // 통계
    const withReviews = results.filter(r => r.reviewCount > 0);
    const avgReviews = withReviews.length > 0
      ? Math.round(withReviews.reduce((sum, r) => sum + r.reviewCount, 0) / withReviews.length)
      : 0;

    console.log(`\n=== 통계 ===`);
    console.log(`리뷰가 있는 가차샵: ${withReviews.length}개`);
    console.log(`평균 리뷰 수: ${avgReviews}개`);
    console.log(`최다 리뷰: ${Math.max(...results.map(r => r.reviewCount))}개`);
  }

  console.log('\n=== 완료 ===');
}

main().catch(console.error);
