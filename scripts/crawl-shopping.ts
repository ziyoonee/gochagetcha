/**
 * 네이버 쇼핑/쿠팡에서 가챠 상품 크롤링
 * 실행: npx tsx scripts/crawl-shopping.ts
 */

import * as cheerio from 'cheerio';

interface GachaProduct {
  name: string;
  brand: string;
  price: number;
  imageUrl: string;
  releaseDate: string | null;
  category: string;
}

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
};

// 카테고리 추론
function inferCategory(name: string): string {
  const lower = name.toLowerCase();
  if (/포켓몬|피카츄|pokemon/.test(lower)) return '캐릭터';
  if (/산리오|헬로키티|시나모롤|쿠로미|마이멜로디/.test(lower)) return '캐릭터';
  if (/원피스|나루토|귀멸|주술|드래곤볼|진격|코난|도라에몽|짱구|스파이/.test(lower)) return '애니메이션';
  if (/건담|에바|에반게리온|로봇/.test(lower)) return '로봇';
  if (/동물의숲|마리오|젤다|커비|닌텐도/.test(lower)) return '게임';
  if (/고양이|강아지|동물|펫/.test(lower)) return '동물';
  if (/디즈니|미니언즈|스누피/.test(lower)) return '캐릭터';
  return '캐릭터';
}

// 브랜드 추론
function inferBrand(name: string): string {
  const lower = name.toLowerCase();
  if (/반다이|bandai/.test(lower)) return '반다이';
  if (/타카라토미|takara/.test(lower)) return '타카라토미';
  if (/산리오|sanrio/.test(lower)) return '산리오';
  if (/닌텐도|nintendo/.test(lower)) return '닌텐도';
  if (/리멘트|rement/.test(lower)) return '리멘트';
  if (/에포크|epoch/.test(lower)) return '에포크';
  if (/원피스|나루토|귀멸|주술|드래곤볼|건담/.test(lower)) return '반다이';
  return '반다이';
}

// 네이버 쇼핑 크롤링
async function crawlNaverShopping(keyword: string): Promise<GachaProduct[]> {
  const products: GachaProduct[] = [];
  const url = `https://search.shopping.naver.com/search/all?query=${encodeURIComponent(keyword)}`;

  console.log(`네이버 쇼핑 "${keyword}" 검색 중...`);

  try {
    const response = await fetch(url, { headers });
    const html = await response.text();
    const $ = cheerio.load(html);

    // 상품 아이템 파싱
    $('[class*="product_item"], [class*="item_"], .product_list_item').each((_, el) => {
      const $el = $(el);

      const name = $el.find('[class*="product_title"], [class*="name"], a[title]').first().text().trim()
                || $el.find('a').first().attr('title') || '';

      if (!name || name.length < 5) return;

      // 가격 추출
      const priceText = $el.find('[class*="price"], .num').first().text().replace(/[^0-9]/g, '');
      const price = parseInt(priceText) || 5000;

      // 이미지 URL
      let imageUrl = $el.find('img').first().attr('src')
                  || $el.find('img').first().attr('data-src') || '';

      if (imageUrl && !imageUrl.startsWith('http')) {
        imageUrl = 'https:' + imageUrl;
      }

      products.push({
        name: name.slice(0, 100), // 이름 길이 제한
        brand: inferBrand(name),
        price: price > 100 && price < 50000 ? price : 5000,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
        releaseDate: null,
        category: inferCategory(name)
      });
    });

    console.log(`  ${products.length}개 상품 발견`);
  } catch (error) {
    console.log(`  크롤링 실패: ${error}`);
  }

  return products;
}

// 11번가 크롤링
async function crawl11st(keyword: string): Promise<GachaProduct[]> {
  const products: GachaProduct[] = [];
  const url = `https://search.11st.co.kr/Search.tmall?kwd=${encodeURIComponent(keyword)}`;

  console.log(`11번가 "${keyword}" 검색 중...`);

  try {
    const response = await fetch(url, { headers });
    const html = await response.text();
    const $ = cheerio.load(html);

    $('.c_prd_item, .prd_item, [class*="product"]').each((_, el) => {
      const $el = $(el);

      const name = $el.find('.prd_name, [class*="title"], h3').first().text().trim();
      if (!name || name.length < 5) return;

      const priceText = $el.find('.price, [class*="price"] strong').first().text().replace(/[^0-9]/g, '');
      const price = parseInt(priceText) || 5000;

      let imageUrl = $el.find('img').first().attr('src')
                  || $el.find('img').first().attr('data-src') || '';

      products.push({
        name: name.slice(0, 100),
        brand: inferBrand(name),
        price: price > 100 && price < 50000 ? price : 5000,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
        releaseDate: null,
        category: inferCategory(name)
      });
    });

    console.log(`  ${products.length}개 상품 발견`);
  } catch (error) {
    console.log(`  크롤링 실패: ${error}`);
  }

  return products;
}

// 중복 제거
function deduplicateProducts(products: GachaProduct[]): GachaProduct[] {
  const seen = new Set<string>();
  return products.filter(p => {
    // 이름에서 공백/특수문자 제거하고 비교
    const key = p.name.replace(/[^가-힣a-zA-Z0-9]/g, '').toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function generateSQL(products: GachaProduct[]): string {
  let sql = `-- 가차 상품 시드 데이터 (쇼핑몰 크롤링)\n`;
  sql += `-- Supabase SQL Editor에서 실행\n\n`;

  for (const product of products) {
    const name = product.name.replace(/'/g, "''");
    const brand = product.brand.replace(/'/g, "''");
    const imageUrl = product.imageUrl.replace(/'/g, "''");
    const category = product.category.replace(/'/g, "''");

    sql += `INSERT INTO gachas (name, brand, price, image_url, release_date, category) VALUES ('${name}', '${brand}', ${product.price}, '${imageUrl}', NULL, '${category}') ON CONFLICT DO NOTHING;\n`;
  }

  return sql;
}

async function main() {
  console.log('=== 쇼핑몰 가차 상품 크롤링 시작 ===\n');

  const keywords = ['가챠', '가샤폰', '캡슐토이 피규어', '반다이 가챠', '산리오 가챠'];
  let allProducts: GachaProduct[] = [];

  // 네이버 쇼핑 크롤링
  for (const keyword of keywords) {
    const products = await crawlNaverShopping(keyword);
    allProducts.push(...products);
    await new Promise(r => setTimeout(r, 1000)); // 딜레이
  }

  // 11번가 크롤링
  for (const keyword of keywords.slice(0, 2)) {
    const products = await crawl11st(keyword);
    allProducts.push(...products);
    await new Promise(r => setTimeout(r, 1000));
  }

  // 중복 제거
  allProducts = deduplicateProducts(allProducts);

  console.log(`\n총 ${allProducts.length}개 가차 상품 수집 (중복 제거 후)`);

  if (allProducts.length > 0) {
    const sql = generateSQL(allProducts);
    console.log('\n=== SQL 출력 ===\n');
    console.log(sql);
  } else {
    console.log('\n크롤링된 상품이 없습니다. 수동 데이터를 사용하세요.');
  }

  console.log('\n=== 완료 ===');
}

main().catch(console.error);
