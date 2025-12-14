import { supabase } from './supabase';
import type { Gachashop, Gacha } from '@/types';

// DB 컬럼명 -> TypeScript 타입 변환
function toGachashop(row: Record<string, unknown>): Gachashop {
  return {
    id: row.id as string,
    name: row.name as string,
    address: row.address as string,
    latitude: row.latitude as number,
    longitude: row.longitude as number,
    phone: row.phone as string | undefined,
    openingHours: row.opening_hours as string | undefined,
    imageUrl: row.image_url as string | undefined,
    instagramUrl: row.instagram_url as string | undefined,
    twitterUrl: row.twitter_url as string | undefined,
    reviewCount: row.review_count as number | undefined,
    rating: row.rating as number | undefined,
    naverPlaceId: row.naver_place_id as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function toGacha(row: Record<string, unknown>): Gacha {
  return {
    id: row.id as string,
    name: row.name as string,
    nameKo: row.name_ko as string | undefined,
    keywords: row.keywords as string | undefined,
    brand: row.brand as string,
    price: row.price as number,
    imageUrl: row.image_url as string,
    releaseDate: row.release_date as string | undefined,
    category: row.category as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

// 가차샵 목록 조회
export async function getGachashops(): Promise<Gachashop[]> {
  const { data, error } = await supabase
    .from('gachashops')
    .select('*')
    .order('name');

  if (error) {
    console.error('가차샵 목록 조회 오류:', error);
    return [];
  }

  return data.map(toGachashop);
}

// 인기 가차샵 조회 (리뷰 수 기준, 없으면 최근 등록순)
export async function getPopularGachashops(limit: number = 3): Promise<Gachashop[]> {
  // 먼저 리뷰가 있는 가차샵 시도
  const { data: withReviews, error: error1 } = await supabase
    .from('gachashops')
    .select('*')
    .gt('review_count', 0)
    .order('review_count', { ascending: false })
    .limit(limit);

  if (!error1 && withReviews && withReviews.length >= limit) {
    return withReviews.map(toGachashop);
  }

  // 리뷰 데이터 없으면 최근 등록순
  const { data, error } = await supabase
    .from('gachashops')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('인기 가차샵 조회 오류:', error);
    return [];
  }

  return data.map(toGachashop);
}

// 가차샵 상세 조회
export async function getGachashopById(id: string): Promise<Gachashop | null> {
  const { data, error } = await supabase
    .from('gachashops')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('가차샵 조회 오류:', error);
    return null;
  }

  return toGachashop(data);
}

// 가차 목록 조회 (전체)
export async function getGachas(): Promise<Gacha[]> {
  const allData: Record<string, unknown>[] = [];
  let from = 0;
  const batchSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from('gachas')
      .select('*')
      .order('release_date', { ascending: false })
      .range(from, from + batchSize - 1);

    if (error) {
      console.error('가차 목록 조회 오류:', error);
      break;
    }

    if (!data || data.length === 0) break;

    allData.push(...data);

    if (data.length < batchSize) break;
    from += batchSize;
  }

  return allData.map(toGacha);
}

// 가차 상세 조회
export async function getGachaById(id: string): Promise<Gacha | null> {
  const { data, error } = await supabase
    .from('gachas')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('가차 조회 오류:', error);
    return null;
  }

  return toGacha(data);
}

// 가차샵의 가차 목록 조회
export async function getGachasByGachashopId(gachashopId: string): Promise<Gacha[]> {
  const { data, error } = await supabase
    .from('gachashop_gachas')
    .select(`
      gacha_id,
      gachas (*)
    `)
    .eq('gachashop_id', gachashopId);

  if (error) {
    console.error('가차샵 가차 목록 조회 오류:', error);
    return [];
  }

  return data
    .map((item: Record<string, unknown>) => item.gachas as Record<string, unknown>)
    .filter(Boolean)
    .map(toGacha);
}

// 가차를 보유한 가차샵 목록 조회
export async function getGachashopsByGachaId(gachaId: string): Promise<Gachashop[]> {
  const { data, error } = await supabase
    .from('gachashop_gachas')
    .select(`
      gachashop_id,
      gachashops (*)
    `)
    .eq('gacha_id', gachaId);

  if (error) {
    console.error('가차 판매 가차샵 조회 오류:', error);
    return [];
  }

  return data
    .map((item: Record<string, unknown>) => item.gachashops as Record<string, unknown>)
    .filter(Boolean)
    .map(toGachashop);
}

// 검색 (한글 검색 name_ko, keywords 지원)
export async function searchAll(query: string): Promise<{ gachashops: Gachashop[]; gachas: Gacha[] }> {
  const [gachashopsResult, gachasResult] = await Promise.all([
    supabase
      .from('gachashops')
      .select('*')
      .or(`name.ilike.%${query}%,address.ilike.%${query}%`),
    supabase
      .from('gachas')
      .select('*')
      .or(`name.ilike.%${query}%,name_ko.ilike.%${query}%,brand.ilike.%${query}%,category.ilike.%${query}%,keywords.ilike.%${query}%`),
  ]);

  return {
    gachashops: (gachashopsResult.data || []).map(toGachashop),
    gachas: (gachasResult.data || []).map(toGacha),
  };
}

// 카테고리 목록 조회
export async function getCategories(): Promise<string[]> {
  const { data, error } = await supabase
    .from('gachas')
    .select('category')
    .order('category');

  if (error) {
    console.error('카테고리 조회 오류:', error);
    return [];
  }

  return [...new Set(data.map(d => d.category))].filter(Boolean) as string[];
}

// 브랜드 목록 조회
export async function getBrands(): Promise<string[]> {
  const { data, error } = await supabase
    .from('gachas')
    .select('brand')
    .order('brand');

  if (error) {
    console.error('브랜드 조회 오류:', error);
    return [];
  }

  return [...new Set(data.map(d => d.brand))].filter(Boolean) as string[];
}

// 가차별 보유 가차샵 ID 목록 조회
export async function getGachaGachashopMap(): Promise<Record<string, string[]>> {
  const { data, error } = await supabase
    .from('gachashop_gachas')
    .select('gacha_id, gachashop_id');

  if (error) {
    console.error('가차-가차샵 매핑 조회 오류:', error);
    return {};
  }

  const map: Record<string, string[]> = {};
  data.forEach((item: { gacha_id: string; gachashop_id: string }) => {
    if (!map[item.gacha_id]) {
      map[item.gacha_id] = [];
    }
    map[item.gacha_id].push(item.gachashop_id);
  });

  return map;
}
