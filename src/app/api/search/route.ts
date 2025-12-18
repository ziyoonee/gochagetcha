import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 가차 하이브리드 검색 API
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q') || '';

  if (!query.trim()) {
    return NextResponse.json({ gachas: [] });
  }

  // 1. 텍스트 매칭 (정확한 결과)
  const exactResult = await supabase
    .from('gachas')
    .select('id')
    .or(`name.ilike.%${query}%,name_ko.ilike.%${query}%,brand.ilike.%${query}%,category.ilike.%${query}%`);

  // 2. Trigram 유사도 검색 (유사한 결과)
  const similarResult = await supabase
    .rpc('search_gachas_trigram', {
      search_query: query,
      similarity_threshold: 0.15,
      max_results: 100
    });

  // 3. ID 목록 병합 (중복 제거, 순서 유지)
  const exactIds = (exactResult.data || []).map((g: { id: string }) => g.id);
  const similarIds = (similarResult.data || [])
    .map((g: { id: string }) => g.id)
    .filter((id: string) => !exactIds.includes(id));

  const matchedIds = [...exactIds, ...similarIds];

  return NextResponse.json({ matchedIds });
}
