/**
 * 네이버 검색에서 가차샵 이미지 크롤링
 * 실행: npx tsx scripts/crawl-gachashop-images.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface GachashopInfo {
  name: string;
  address: string;
}

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'ko-KR,ko;q=0.9',
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

// 네이버 검색에서 이미지 URL 추출
async function searchNaverImage(shopName: string, address: string): Promise<string | null> {
  try {
    // 주소에서 시/구 추출
    const location = address.split(' ').slice(0, 2).join(' ');
    const query = encodeURIComponent(`${shopName} ${location}`);
    const url = `https://search.naver.com/search.naver?where=nexearch&query=${query}`;

    const response = await fetch(url, { headers });
    const html = await response.text();

    // 이미지 URL 추출 (pstatic.net 이미지)
    const imageRegex = /https:\/\/search\.pstatic\.net\/common\?src=[^"&]+/g;
    const matches = html.match(imageRegex);

    if (matches && matches.length > 0) {
      // HTML 엔티티 디코딩
      let imageUrl = matches[0].replace(/&amp;/g, '&');
      return imageUrl;
    }

    // 다른 이미지 패턴 시도
    const mblogRegex = /https:\/\/[^"']*mblogthumb-phinf\.pstatic\.net[^"']+/g;
    const mblogMatches = html.match(mblogRegex);

    if (mblogMatches && mblogMatches.length > 0) {
      return mblogMatches[0];
    }

    return null;
  } catch (error) {
    console.error(`  검색 실패: ${shopName}`);
    return null;
  }
}

// UPDATE SQL 생성
function generateUpdateSQL(shops: { name: string; imageUrl: string }[]): string {
  let sql = `-- 가차샵 이미지 업데이트\n`;
  sql += `-- Supabase SQL Editor에서 실행\n\n`;

  for (const shop of shops) {
    const name = shop.name.replace(/'/g, "''");
    const imageUrl = shop.imageUrl.replace(/'/g, "''");
    sql += `UPDATE gachashops SET image_url = '${imageUrl}' WHERE name = '${name}';\n`;
  }

  return sql;
}

async function main() {
  console.log('=== 가차샵 이미지 크롤링 시작 ===\n');

  // SQL 파일에서 가차샵 목록 읽기
  const sqlPath = path.join(__dirname, 'gachashops-seed-v2.sql');

  if (!fs.existsSync(sqlPath)) {
    console.error('gachashops-seed-v2.sql 파일을 찾을 수 없습니다.');
    return;
  }

  const shops = parseGachashopsFromSQL(sqlPath);
  console.log(`${shops.length}개 가차샵 발견\n`);

  const results: { name: string; imageUrl: string }[] = [];
  let foundCount = 0;

  for (let i = 0; i < shops.length; i++) {
    const shop = shops[i];
    process.stdout.write(`\r[${i + 1}/${shops.length}] ${shop.name} 검색 중...`);

    const imageUrl = await searchNaverImage(shop.name, shop.address);

    if (imageUrl) {
      results.push({ name: shop.name, imageUrl });
      foundCount++;
    }

    // 딜레이 (0.5초)
    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`\n\n총 ${foundCount}/${shops.length}개 이미지 발견`);

  if (results.length > 0) {
    const sql = generateUpdateSQL(results);
    const outputPath = path.join(__dirname, 'gachashops-images-update.sql');
    fs.writeFileSync(outputPath, sql);
    console.log(`\nSQL 저장됨: ${outputPath}`);
    console.log('\n=== SQL 미리보기 (처음 10개) ===\n');
    console.log(sql.split('\n').slice(0, 15).join('\n'));
  }

  console.log('\n=== 완료 ===');
}

main().catch(console.error);
