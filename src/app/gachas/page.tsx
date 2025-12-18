import { Suspense } from "react";
import { getCategories, getBrands } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import GachasClient from "./GachasClient";
import type { Gacha } from "@/types";

// 5분 캐시
export const revalidate = 300;

// 초기 가차 24개만 로드
async function getInitialGachas(): Promise<{ gachas: Gacha[]; total: number }> {
  const { data, count, error } = await supabase
    .from('gachas')
    .select('*', { count: 'exact' })
    .order('release_date', { ascending: false, nullsFirst: false })
    .range(0, 23);

  if (error) {
    console.error('초기 가차 로드 오류:', error);
    return { gachas: [], total: 0 };
  }

  const gachas = (data || []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    name: row.name as string,
    nameKo: row.name_ko as string | undefined,
    brand: row.brand as string,
    price: row.price as number,
    imageUrl: row.image_url as string,
    releaseDate: row.release_date as string | undefined,
    category: row.category as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }));

  return { gachas, total: count || 0 };
}

export default async function GachasPage() {
  const [{ gachas, total }, categories, brands] = await Promise.all([
    getInitialGachas(),
    getCategories(),
    getBrands(),
  ]);

  return (
    <Suspense fallback={<GachasLoading />}>
      <GachasClient
        categories={categories}
        brands={brands}
        initialGachas={gachas}
        initialTotal={total}
      />
    </Suspense>
  );
}

function GachasLoading() {
  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6">
          <div className="h-9 w-24 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-5 w-48 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="h-12 w-full max-w-md bg-gray-100 rounded-full animate-pulse mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
