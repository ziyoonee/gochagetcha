/**
 * 카카오 로컬 API로 가차샵 검색 후 Supabase에 저장
 * 실행: npx tsx scripts/fetch-gachashops.ts
 */

import { createClient } from '@supabase/supabase-js';

const KAKAO_REST_API_KEY = '6d9f046f9a41d35d838a03809eab2c91';
const SUPABASE_URL = 'https://jsswbuxxvdirrzdkaouw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_8Jgm3Pia07hPA77NbkinMg_Hwj8wx6q';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 검색 키워드 (영어와 한글 혼합)
const SEARCH_KEYWORDS = ['가챠', '가차', '캡슐토이', '가샤폰', '뽑기방', '랜덤캡슐', '가챠샵', '가차샵', '캡슐머신'];

interface KakaoPlace {
  place_name: string;
  address_name: string;
  road_address_name: string;
  x: string; // longitude
  y: string; // latitude
  phone: string;
}

interface KakaoResponse {
  documents: KakaoPlace[];
  meta: {
    is_end: boolean;
    pageable_count: number;
    total_count: number;
  };
}

async function searchPlaces(keyword: string, page: number = 1): Promise<KakaoPlace[]> {
  const url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(keyword)}&page=${page}&size=15`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `KakaoAK ${KAKAO_REST_API_KEY}`
    }
  });

  if (!response.ok) {
    console.error(`API 오류: ${response.status} ${response.statusText}`);
    return [];
  }

  const data: KakaoResponse = await response.json();
  console.log(`"${keyword}" 검색: ${data.documents.length}개 결과 (페이지 ${page})`);

  return data.documents;
}

async function fetchAllGachashops(): Promise<KakaoPlace[]> {
  const allPlaces: KakaoPlace[] = [];
  const seenNames = new Set<string>();

  for (const keyword of SEARCH_KEYWORDS) {
    // 각 키워드당 최대 3페이지까지 검색
    for (let page = 1; page <= 3; page++) {
      const places = await searchPlaces(keyword, page);

      for (const place of places) {
        // 중복 제거
        if (!seenNames.has(place.place_name)) {
          seenNames.add(place.place_name);
          allPlaces.push(place);
        }
      }

      if (places.length < 15) break; // 마지막 페이지

      // API 호출 간격
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  console.log(`\n총 ${allPlaces.length}개 가차샵 발견`);
  return allPlaces;
}

async function saveToSupabase(places: KakaoPlace[]) {
  console.log('\nSupabase에 저장 중...');

  const gachashops = places.map(place => ({
    name: place.place_name,
    address: place.road_address_name || place.address_name,
    latitude: parseFloat(place.y),
    longitude: parseFloat(place.x),
    phone: place.phone || null,
    opening_hours: null,
    image_url: null
  }));

  // SQL INSERT 문 생성 (Supabase SQL Editor에서 실행용)
  console.log('\n=== Supabase SQL Editor에서 아래 SQL 실행 ===\n');

  for (const shop of gachashops) {
    const sql = `INSERT INTO gachashops (name, address, latitude, longitude, phone) VALUES ('${shop.name.replace(/'/g, "''")}', '${shop.address.replace(/'/g, "''")}', ${shop.latitude}, ${shop.longitude}, ${shop.phone ? `'${shop.phone}'` : 'NULL'}) ON CONFLICT DO NOTHING;`;
    console.log(sql);
  }

  console.log(`\n총 ${gachashops.length}개 INSERT문 생성됨`);
}

async function main() {
  console.log('=== 가차샵 데이터 수집 시작 ===\n');

  const places = await fetchAllGachashops();

  if (places.length > 0) {
    await saveToSupabase(places);
  }

  console.log('\n=== 완료 ===');
}

main().catch(console.error);
