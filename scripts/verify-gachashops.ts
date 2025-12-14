import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://jsswbuxxvdirrzdkaouw.supabase.co',
  'sb_publishable_8Jgm3Pia07hPA77NbkinMg_Hwj8wx6q'
);

const KAKAO_API_KEY = '6d9f046f9a41d35d838a03809eab2c91';

// 가차샵 관련 카테고리 키워드
const VALID_CATEGORIES = [
  '장난감', '완구', '캡슐토이', '가챠', '피규어', '취미', '게임', '오락', '문구'
];

// 확실히 가차샵이 아닌 카테고리
const INVALID_CATEGORIES = [
  '교회', '성당', '사찰', '종교',
  '음식점', '카페', '식당', '주점',
  '교량', '다리', '도로',
  '학교', '학원',
  '병원', '의원', '약국',
  '은행', '금융',
  '부동산', '숙박'
];

async function searchKakao(query: string): Promise<{ category: string; placeName: string } | null> {
  try {
    const url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: { 'Authorization': `KakaoAK ${KAKAO_API_KEY}` }
    });
    const data = await res.json();

    if (data.documents && data.documents.length > 0) {
      const doc = data.documents[0];
      return {
        category: doc.category_name || '',
        placeName: doc.place_name || ''
      };
    }
    return null;
  } catch (e) {
    return null;
  }
}

function isValidGachashop(category: string): boolean {
  const categoryLower = category.toLowerCase();

  // 확실히 아닌 카테고리 체크
  for (const invalid of INVALID_CATEGORIES) {
    if (categoryLower.includes(invalid)) {
      return false;
    }
  }

  // 유효한 카테고리 체크
  for (const valid of VALID_CATEGORIES) {
    if (categoryLower.includes(valid)) {
      return true;
    }
  }

  // 카테고리가 비어있거나 알 수 없으면 수동 확인 필요
  return true; // 기본적으로 유지
}

async function main() {
  console.log('=== 가차샵 데이터 검증 시작 ===\n');

  const { data: shops, error } = await supabase
    .from('gachashops')
    .select('id, name')
    .order('name');

  if (error || !shops) {
    console.error('데이터 조회 오류:', error);
    return;
  }

  console.log(`총 ${shops.length}개 가차샵 검증 중...\n`);

  const invalidShops: { id: string; name: string; category: string }[] = [];
  const unknownShops: { id: string; name: string; category: string }[] = [];

  for (let i = 0; i < shops.length; i++) {
    const shop = shops[i];
    const result = await searchKakao(shop.name);

    if (result) {
      const isValid = isValidGachashop(result.category);

      if (!isValid) {
        invalidShops.push({ id: shop.id, name: shop.name, category: result.category });
        console.log(`❌ [${i+1}/${shops.length}] ${shop.name} - ${result.category}`);
      } else if (!result.category || result.category.length < 3) {
        unknownShops.push({ id: shop.id, name: shop.name, category: result.category || '(없음)' });
        console.log(`⚠️ [${i+1}/${shops.length}] ${shop.name} - 카테고리 불명확: ${result.category || '(없음)'}`);
      } else {
        console.log(`✅ [${i+1}/${shops.length}] ${shop.name} - ${result.category}`);
      }
    } else {
      console.log(`❓ [${i+1}/${shops.length}] ${shop.name} - 검색 결과 없음`);
    }

    // API 속도 제한 방지
    await new Promise(r => setTimeout(r, 100));
  }

  console.log('\n=== 검증 결과 ===');
  console.log(`\n❌ 삭제 대상 (${invalidShops.length}개):`);
  invalidShops.forEach(s => console.log(`  - ${s.name}: ${s.category}`));

  if (unknownShops.length > 0) {
    console.log(`\n⚠️ 수동 확인 필요 (${unknownShops.length}개):`);
    unknownShops.forEach(s => console.log(`  - ${s.name}: ${s.category}`));
  }

  // 삭제용 SQL 생성
  if (invalidShops.length > 0) {
    console.log('\n=== 삭제 SQL ===');
    const ids = invalidShops.map(s => `'${s.id}'`).join(', ');
    console.log(`DELETE FROM gachashops WHERE id IN (${ids});`);
  }
}

main();
