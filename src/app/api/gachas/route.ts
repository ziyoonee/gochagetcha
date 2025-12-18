import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const PAGE_SIZE = 24;

// 가차 목록 API (페이지네이션 + 필터 + 검색)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const category = searchParams.get('category') || '';
  const brand = searchParams.get('brand') || '';
  const month = searchParams.get('month') || '';
  const sort = searchParams.get('sort') || 'newest';
  const query = searchParams.get('q') || '';
  const available = searchParams.get('available') === 'true';

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  // 판매처 있는 가차만 필터
  let availableGachaIds: string[] | null = null;
  if (available) {
    const { data: mappings } = await supabase
      .from('gachashop_gachas')
      .select('gacha_id');
    availableGachaIds = [...new Set((mappings || []).map((m: { gacha_id: string }) => m.gacha_id))];
    if (availableGachaIds.length === 0) {
      return NextResponse.json({ gachas: [], total: 0, page, pageSize: PAGE_SIZE, hasMore: false });
    }
  }

  // 검색어가 있으면 하이브리드 검색
  let matchedIds: string[] | null = null;
  if (query.trim()) {
    // 텍스트 매칭
    const exactResult = await supabase
      .from('gachas')
      .select('id')
      .or(`name.ilike.%${query}%,name_ko.ilike.%${query}%,brand.ilike.%${query}%,category.ilike.%${query}%`);

    // Trigram 유사도 검색
    const similarResult = await supabase
      .rpc('search_gachas_trigram', {
        search_query: query,
        similarity_threshold: 0.15,
        max_results: 200
      });

    const exactIds = (exactResult.data || []).map((g: { id: string }) => g.id);
    const similarIds = (similarResult.data || [])
      .map((g: { id: string }) => g.id)
      .filter((id: string) => !exactIds.includes(id));

    matchedIds = [...exactIds, ...similarIds];
  }

  // 기본 쿼리 빌드
  let queryBuilder = supabase.from('gachas').select('*', { count: 'exact' });

  // 검색 필터
  if (matchedIds !== null) {
    if (matchedIds.length === 0) {
      return NextResponse.json({ gachas: [], total: 0, page, pageSize: PAGE_SIZE, hasMore: false });
    }
    queryBuilder = queryBuilder.in('id', matchedIds);
  }

  // 판매처 있는 가차만 필터
  if (availableGachaIds !== null) {
    // 검색과 available 둘 다 있으면 교집합
    if (matchedIds !== null) {
      const intersection = matchedIds.filter(id => availableGachaIds!.includes(id));
      if (intersection.length === 0) {
        return NextResponse.json({ gachas: [], total: 0, page, pageSize: PAGE_SIZE, hasMore: false });
      }
      queryBuilder = supabase.from('gachas').select('*', { count: 'exact' }).in('id', intersection);
    } else {
      queryBuilder = queryBuilder.in('id', availableGachaIds);
    }
  }

  // 카테고리 필터
  if (category) {
    queryBuilder = queryBuilder.eq('category', category);
  }

  // 브랜드 필터
  if (brand) {
    queryBuilder = queryBuilder.eq('brand', brand);
  }

  // 월 필터
  if (month === 'new') {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    queryBuilder = queryBuilder.gte('release_date', thirtyDaysAgo);
  } else if (month && month !== 'all') {
    queryBuilder = queryBuilder.gte('release_date', `${month}-01`).lt('release_date', `${month}-32`);
  }

  // 정렬
  switch (sort) {
    case 'newest':
      queryBuilder = queryBuilder.order('release_date', { ascending: false, nullsFirst: false });
      break;
    case 'name':
      queryBuilder = queryBuilder.order('name_ko', { ascending: true });
      break;
    case 'priceLow':
      queryBuilder = queryBuilder.order('price', { ascending: true });
      break;
    case 'priceHigh':
      queryBuilder = queryBuilder.order('price', { ascending: false });
      break;
  }

  // 페이지네이션
  queryBuilder = queryBuilder.range(from, to);

  const { data, count, error } = await queryBuilder;

  if (error) {
    console.error('가차 목록 조회 오류:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 타입 변환
  const gachas = (data || []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    name: row.name as string,
    nameKo: row.name_ko as string | undefined,
    brand: row.brand as string,
    price: row.price as number,
    imageUrl: row.image_url as string,
    releaseDate: row.release_date as string | undefined,
    category: row.category as string,
  }));

  return NextResponse.json({
    gachas,
    total: count || 0,
    page,
    pageSize: PAGE_SIZE,
    hasMore: to < (count || 0) - 1
  });
}
