/**
 * 반다이 가샤폰 2025년 전체 월별 크롤링
 * 실행: npx tsx scripts/crawl-bandai-all.ts
 */

import * as cheerio from 'cheerio';
import * as fs from 'fs';

interface GachaProduct {
  name: string;
  nameKo: string;
  brand: string;
  price: number;
  imageUrl: string;
  releaseDate: string | null;
  category: string;
}

const BANDAI_SCHEDULE_URL = 'https://gashapon.jp/schedule/';
const BANDAI_DETAIL_URL = 'https://gashapon.jp/products/detail.php?jan_code=';

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'ko-KR,ko;q=0.9,ja;q=0.8',
};

// 2025년 크롤링할 월 목록
const MONTHS_2025 = ['202501', '202502', '202503', '202504', '202505', '202506',
                     '202507', '202508', '202509', '202510', '202511', '202512'];

// 한글 검색 키워드 추출
function extractKoreanKeywords(name: string): string {
  const keywords: string[] = [];
  const translations: [RegExp, string][] = [
    [/ONE PIECE|ワンピース/gi, '원피스'],
    [/NARUTO|ナルト/gi, '나루토'],
    [/鬼滅の刃/gi, '귀멸의 칼날'],
    [/呪術廻戦/gi, '주술회전'],
    [/ドラゴンボール/gi, '드래곤볼'],
    [/進撃の巨人/gi, '진격의 거인'],
    [/名探偵コナン/gi, '명탐정 코난'],
    [/ドラえもん/gi, '도라에몽'],
    [/クレヨンしんちゃん/gi, '짱구'],
    [/SPY×FAMILY|スパイファミリー/gi, '스파이패밀리'],
    [/ちいかわ/gi, '치이카와'],
    [/僕のヒーローアカデミア/gi, '히로아카'],
    [/チェンソーマン/gi, '체인소맨'],
    [/ブルーロック/gi, '블루록'],
    [/推しの子/gi, '최애의 아이'],
    [/BLEACH/gi, '블리치'],
    [/MINECRAFT|マインクラフト/gi, '마인크래프트'],
    [/ポケモン|ポケットモンスター/gi, '포켓몬'],
    [/サンリオ/gi, '산리오'],
    [/ハローキティ|キティ/gi, '헬로키티'],
    [/シナモロール/gi, '시나모롤'],
    [/クロミ/gi, '쿠로미'],
    [/マイメロディ/gi, '마이멜로디'],
    [/リラックマ/gi, '리락쿠마'],
    [/すみっコぐらし/gi, '스밋코구라시'],
    [/ディズニー/gi, '디즈니'],
    [/ガンダム/gi, '건담'],
    [/エヴァンゲリオン/gi, '에반게리온'],
    [/仮面ライダー/gi, '가면라이더'],
    [/ウルトラマン/gi, '울트라맨'],
    [/プリキュア/gi, '프리큐어'],
    [/フィギュア/gi, '피규어'],
    [/マスコット/gi, '마스코트'],
    [/コレクション/gi, '컬렉션'],
    [/ミニチュア/gi, '미니어처'],
  ];

  for (const [pattern, keyword] of translations) {
    if (pattern.test(name)) keywords.push(keyword);
  }
  keywords.push('가챠', '캡슐토이', '반다이');
  return [...new Set(keywords)].join(' ');
}

// 카테고리 추론
function inferCategory(name: string): string {
  const lower = name.toLowerCase();
  if (/ポケモン|pokemon/.test(lower)) return '캐릭터';
  if (/サンリオ|キティ|シナモロール|クロミ/.test(lower)) return '캐릭터';
  if (/ワンピース|one piece/.test(lower)) return '애니메이션';
  if (/ナルト|鬼滅|呪術|ドラゴンボール|進撃|コナン/.test(lower)) return '애니메이션';
  if (/ガンダム|エヴァ/.test(lower)) return '로봇';
  if (/マインクラフト|どうぶつの森|マリオ/.test(lower)) return '게임';
  if (/ちいかわ/.test(lower)) return '캐릭터';
  return '캐릭터';
}

// 출시일 파싱
function parseReleaseDate(ym: string): string {
  const year = ym.substring(0, 4);
  const month = ym.substring(4, 6);
  return `${year}-${month}-01`;
}

// 월별 jan_code 목록 추출
async function getJanCodesForMonth(ym: string): Promise<string[]> {
  try {
    const url = `${BANDAI_SCHEDULE_URL}?ym=${ym}`;
    const response = await fetch(url, { headers });
    const html = await response.text();

    const janCodes: string[] = [];
    const regex = /detail\.php\?jan_code=(\d+)/g;
    let match;

    while ((match = regex.exec(html)) !== null) {
      if (!janCodes.includes(match[1])) {
        janCodes.push(match[1]);
      }
    }

    return janCodes;
  } catch (error) {
    console.error(`${ym} 크롤링 실패:`, error);
    return [];
  }
}

// 상품 상세 페이지 크롤링
async function crawlProductDetail(janCode: string, releaseYm: string): Promise<GachaProduct | null> {
  try {
    const url = BANDAI_DETAIL_URL + janCode;
    const response = await fetch(url, { headers });
    const html = await response.text();
    const $ = cheerio.load(html);

    const titleTag = $('title').text();
    const name = titleTag.replace('｜ガシャポンオフィシャルサイト', '').trim();

    if (!name || name.length < 3) return null;

    const imageUrl = $('meta[property="og:image"]').attr('content') || '';

    let price = 500;
    const priceMatch = html.match(/(\d+)円/);
    if (priceMatch) price = parseInt(priceMatch[1]);

    return {
      name,
      nameKo: extractKoreanKeywords(name),
      brand: '반다이',
      price: price * 10,
      imageUrl,
      releaseDate: parseReleaseDate(releaseYm),
      category: inferCategory(name)
    };
  } catch (error) {
    return null;
  }
}

function generateSQL(products: GachaProduct[]): string {
  let sql = `-- 가차 상품 시드 데이터 (반다이 2025년 전체)\n`;
  sql += `-- 총 ${products.length}개\n\n`;

  for (const product of products) {
    const name = product.name.replace(/'/g, "''");
    const nameKo = product.nameKo.replace(/'/g, "''");
    const imageUrl = product.imageUrl || '';
    const releaseDate = product.releaseDate ? `'${product.releaseDate}'` : 'NULL';
    const category = product.category.replace(/'/g, "''");

    sql += `INSERT INTO gachas (name, name_ko, brand, price, image_url, release_date, category) VALUES ('${name}', '${nameKo}', '반다이', ${product.price}, '${imageUrl}', ${releaseDate}, '${category}') ON CONFLICT DO NOTHING;\n`;
  }

  return sql;
}

async function main() {
  console.log('=== 반다이 가샤폰 2025년 전체 크롤링 ===\n');

  const allJanCodes: Map<string, string> = new Map(); // janCode -> releaseYm

  // 1. 각 월별 jan_code 수집
  for (const ym of MONTHS_2025) {
    const year = ym.substring(0, 4);
    const month = ym.substring(4, 6);
    process.stdout.write(`${year}년 ${month}월 수집 중...`);

    const codes = await getJanCodesForMonth(ym);
    for (const code of codes) {
      if (!allJanCodes.has(code)) {
        allJanCodes.set(code, ym);
      }
    }
    console.log(` ${codes.length}개 (누적: ${allJanCodes.size}개)`);

    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`\n총 ${allJanCodes.size}개 고유 상품 발견\n`);

  // 2. 상세 정보 크롤링
  const products: GachaProduct[] = [];
  let count = 0;
  const total = allJanCodes.size;

  for (const [janCode, releaseYm] of allJanCodes) {
    count++;
    if (count % 50 === 0) {
      console.log(`${count}/${total} 처리 중...`);
    }

    const product = await crawlProductDetail(janCode, releaseYm);
    if (product) {
      products.push(product);
    }

    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`\n총 ${products.length}개 가차 상품 수집 완료`);

  // 3. SQL 파일 저장
  const sql = generateSQL(products);
  fs.writeFileSync('scripts/gachas-bandai-2025.sql', sql);
  console.log('\n✅ scripts/gachas-bandai-2025.sql 저장됨');

  // 4. 출시월별 통계
  const monthStats: Record<string, number> = {};
  for (const p of products) {
    const month = p.releaseDate?.substring(0, 7) || 'unknown';
    monthStats[month] = (monthStats[month] || 0) + 1;
  }

  console.log('\n=== 월별 통계 ===');
  Object.entries(monthStats).sort().forEach(([month, count]) => {
    console.log(`  ${month}: ${count}개`);
  });
}

main().catch(console.error);
