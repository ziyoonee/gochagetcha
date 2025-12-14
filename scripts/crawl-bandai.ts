/**
 * 반다이 가샤폰 사이트 크롤링 (jan_code 기반)
 * 실행: npx tsx scripts/crawl-bandai.ts
 */

import * as cheerio from 'cheerio';

interface GachaProduct {
  name: string;
  nameKo: string; // 한글 검색용 이름
  brand: string;
  price: number;
  imageUrl: string;
  releaseDate: string | null;
  category: string;
}

const BANDAI_SCHEDULE_URL = 'https://gashapon.jp/schedule/';
const BANDAI_DETAIL_URL = 'https://gashapon.jp/products/detail.php?jan_code=';

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'ko-KR,ko;q=0.9,ja;q=0.8',
};

// 한글 검색 키워드 추출 (일본어에서 한글 키워드만 추출)
function extractKoreanKeywords(name: string): string {
  const keywords: string[] = [];

  // 애니메이션/캐릭터 이름 매핑
  const translations: [RegExp, string][] = [
    // 애니메이션
    [/ONE PIECE|ワンピース/gi, '원피스'],
    [/NARUTO|ナルト/gi, '나루토'],
    [/鬼滅の刃|きめつのやいば/gi, '귀멸의 칼날'],
    [/呪術廻戦|じゅじゅつかいせん/gi, '주술회전'],
    [/ドラゴンボール/gi, '드래곤볼'],
    [/進撃の巨人/gi, '진격의 거인'],
    [/名探偵コナン/gi, '명탐정 코난'],
    [/ドラえもん/gi, '도라에몽'],
    [/クレヨンしんちゃん/gi, '짱구'],
    [/SPY×FAMILY|スパイファミリー/gi, '스파이패밀리'],
    [/ちいかわ/gi, '치이카와'],
    [/僕のヒーローアカデミア/gi, '히로아카'],
    [/ハイキュー/gi, '하이큐'],
    [/DEATH NOTE|デスノート/gi, '데스노트'],
    [/キン肉マン/gi, '킨니쿠맨'],
    [/聖闘士星矢/gi, '세인트세이야'],
    [/家庭教師ヒットマンREBORN/gi, '리본'],
    [/おジャ魔女どれみ/gi, '도레미'],
    [/ぴちぴちピッチ/gi, '피치피치핏치'],
    [/きらりん☆レボリューション/gi, '키라링'],
    [/チェンソーマン/gi, '체인소맨'],
    [/ブルーロック/gi, '블루록'],
    [/推しの子/gi, '최애의 아이'],
    [/BLEACH|ブリーチ/gi, '블리치'],
    [/ケロロ/gi, '케로로'],
    [/デジモン/gi, '디지몬'],
    [/プリキュア/gi, '프리큐어'],
    [/アイカツ/gi, '아이카츠'],
    [/エウレカセブン/gi, '에우레카세븐'],

    // 게임
    [/MINECRAFT|マインクラフト/gi, '마인크래프트'],
    [/どうぶつの森/gi, '동물의 숲'],
    [/マリオ/gi, '마리오'],
    [/ゼルダ/gi, '젤다'],
    [/カービィ/gi, '커비'],
    [/ポケモン|ポケットモンスター/gi, '포켓몬'],
    [/ペルソナ/gi, '페르소나'],

    // 캐릭터
    [/サンリオ/gi, '산리오'],
    [/ハローキティ|キティ/gi, '헬로키티'],
    [/シナモロール/gi, '시나모롤'],
    [/クロミ/gi, '쿠로미'],
    [/マイメロディ/gi, '마이멜로디'],
    [/ポムポムプリン/gi, '폼폼푸린'],
    [/リラックマ/gi, '리락쿠마'],
    [/すみっコぐらし/gi, '스밋코구라시'],
    [/ディズニー/gi, '디즈니'],
    [/ミニオンズ/gi, '미니언즈'],
    [/スヌーピー|PEANUTS/gi, '스누피'],
    [/トトロ/gi, '토토로'],
    [/ジブリ/gi, '지브리'],
    [/アンパンマン/gi, '호빵맨'],
    [/LOONEY TUNES/gi, '루니툰'],
    [/ズートピア/gi, '주토피아'],
    [/ハリー・ポッター|Harry Potter/gi, '해리포터'],
    [/くまモン/gi, '쿠마몬'],
    [/BT21/gi, 'BT21'],
    [/コジコジ/gi, '코지코지'],
    [/たまごっち/gi, '다마고치'],
    [/ゴジラ/gi, '고질라'],
    [/ウルトラ/gi, '울트라맨'],
    [/仮面ライダー/gi, '가면라이더'],
    [/トーマス/gi, '토마스'],

    // 로봇
    [/ガンダム/gi, '건담'],
    [/エヴァンゲリオン|エヴァ/gi, '에반게리온'],

    // 상품 유형
    [/フィギュア/gi, '피규어'],
    [/マスコット/gi, '마스코트'],
    [/コレクション/gi, '컬렉션'],
    [/ミニチュア/gi, '미니어처'],
    [/キーチェーン|キーホルダー/gi, '키체인'],
    [/アクセサリー/gi, '악세서리'],
    [/チャーム/gi, '참'],
    [/ぬいぐるみ/gi, '인형'],
  ];

  for (const [pattern, keyword] of translations) {
    if (pattern.test(name)) {
      keywords.push(keyword);
    }
  }

  // 기본 키워드 추가
  keywords.push('가챠', '캡슐토이', '반다이');

  // 중복 제거 후 반환
  return [...new Set(keywords)].join(' ');
}

// 카테고리 추론
function inferCategory(name: string): string {
  const lower = name.toLowerCase();
  if (/ポケモン|ピカチュウ|pokemon|포켓몬/.test(lower)) return '캐릭터';
  if (/サンリオ|キティ|シナモロール|クロミ|マイメロ/.test(lower)) return '캐릭터';
  if (/ワンピース|one piece|원피스/.test(lower)) return '애니메이션';
  if (/ナルト|귀멸|鬼滅|주술|呪術|ドラゴンボール|進撃|コナン|ドラえもん|クレヨンしんちゃん|スパイ/.test(lower)) return '애니메이션';
  if (/ガンダム|gundam|에바|エヴァ|로봇/.test(lower)) return '로봇';
  if (/どうぶつの森|マリオ|ゼルダ|カービィ|nintendo|닌텐도/.test(lower)) return '게임';
  if (/ねこ|猫|犬|いぬ|動物|고양이|강아지/.test(lower)) return '동물';
  if (/ディズニー|ミニオン|スヌーピー|disney/.test(lower)) return '캐릭터';
  if (/ちいかわ|치이카와/.test(lower)) return '캐릭터';
  return '캐릭터';
}

// 출시일 파싱 (예: "2025年12月 第1週" -> "2025-12-01")
function parseReleaseDate(dateText: string): string | null {
  // "2025年12月" 형식
  const match = dateText.match(/(\d{4})年(\d{1,2})月/);
  if (match) {
    const year = match[1];
    const month = match[2].padStart(2, '0');
    return `${year}-${month}-01`;
  }
  return null;
}

// 스케줄 페이지에서 jan_code 목록 추출
async function getJanCodes(): Promise<string[]> {
  console.log('스케줄 페이지에서 상품 목록 추출 중...');

  try {
    const response = await fetch(BANDAI_SCHEDULE_URL, { headers });
    const html = await response.text();

    // jan_code 추출
    const janCodes: string[] = [];
    const regex = /detail\.php\?jan_code=(\d+)/g;
    let match;

    while ((match = regex.exec(html)) !== null) {
      if (!janCodes.includes(match[1])) {
        janCodes.push(match[1]);
      }
    }

    console.log(`${janCodes.length}개 상품 발견`);
    return janCodes;
  } catch (error) {
    console.error('스케줄 페이지 크롤링 실패:', error);
    return [];
  }
}

// 상품 상세 페이지 크롤링
async function crawlProductDetail(janCode: string): Promise<GachaProduct | null> {
  try {
    const url = BANDAI_DETAIL_URL + janCode;
    const response = await fetch(url, { headers });
    const html = await response.text();
    const $ = cheerio.load(html);

    // 상품명 추출 (title 태그에서)
    const titleTag = $('title').text();
    const name = titleTag.replace('｜ガシャポンオフィシャルサイト', '').trim();

    if (!name || name.length < 3) {
      return null;
    }

    // 이미지 URL 추출 (og:image 메타태그에서)
    const imageUrl = $('meta[property="og:image"]').attr('content') || '';

    // 가격 추출
    let price = 500; // 기본값
    const priceMatch = html.match(/(\d+)円/);
    if (priceMatch) {
      price = parseInt(priceMatch[1]);
    }

    // 출시일 추출
    let releaseDate: string | null = null;
    const releaseDateHtml = html.match(/発売時期[\s\S]*?(\d{4}年\d{1,2}月)/);
    if (releaseDateHtml) {
      releaseDate = parseReleaseDate(releaseDateHtml[1]);
    }

    return {
      name,
      nameKo: extractKoreanKeywords(name), // 한글 검색 키워드
      brand: '반다이',
      price: price * 10, // 엔 -> 원 환산 (대략 10배)
      imageUrl,
      releaseDate,
      category: inferCategory(name)
    };
  } catch (error) {
    console.error(`상품 ${janCode} 크롤링 실패:`, error);
    return null;
  }
}

function generateSQL(products: GachaProduct[]): string {
  let sql = `-- 가차 상품 시드 데이터 (반다이 공식 사이트 크롤링)\n`;
  sql += `-- Supabase SQL Editor에서 실행\n\n`;

  sql += `-- 1. name_ko 컬럼 추가 (한글 검색용)\n`;
  sql += `ALTER TABLE gachas ADD COLUMN IF NOT EXISTS name_ko TEXT;\n\n`;

  sql += `-- 2. 가차 상품 데이터 삽입\n`;

  for (const product of products) {
    const name = product.name.replace(/'/g, "''");
    const nameKo = product.nameKo.replace(/'/g, "''");
    const brand = product.brand.replace(/'/g, "''");
    const imageUrl = product.imageUrl || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400';
    const releaseDate = product.releaseDate ? `'${product.releaseDate}'` : 'NULL';
    const category = product.category.replace(/'/g, "''");

    sql += `INSERT INTO gachas (name, name_ko, brand, price, image_url, release_date, category) VALUES ('${name}', '${nameKo}', '${brand}', ${product.price}, '${imageUrl}', ${releaseDate}, '${category}') ON CONFLICT DO NOTHING;\n`;
  }

  return sql;
}

async function main() {
  console.log('=== 반다이 가샤폰 크롤링 시작 ===\n');

  // 1. 스케줄 페이지에서 jan_code 목록 가져오기
  const janCodes = await getJanCodes();

  if (janCodes.length === 0) {
    console.log('상품을 찾을 수 없습니다.');
    return;
  }

  // 2. 각 상품 상세 페이지 크롤링 (전체)
  const products: GachaProduct[] = [];
  const maxProducts = janCodes.length; // 전체 크롤링

  console.log(`\n상품 상세 정보 수집 중 (${maxProducts}개)...`);

  for (let i = 0; i < maxProducts; i++) {
    const janCode = janCodes[i];
    process.stdout.write(`\r  ${i + 1}/${maxProducts} 처리 중...`);

    const product = await crawlProductDetail(janCode);
    if (product) {
      products.push(product);
    }

    // API 호출 간격 (0.5초)
    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`\n\n총 ${products.length}개 가차 상품 수집 완료`);

  // 3. SQL 생성
  if (products.length > 0) {
    const sql = generateSQL(products);
    console.log('\n=== Supabase SQL Editor에서 아래 SQL 실행 ===\n');
    console.log(sql);
  }

  console.log('\n=== 완료 ===');
}

main().catch(console.error);
