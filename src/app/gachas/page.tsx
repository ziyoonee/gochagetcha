import { Suspense } from "react";
import { getGachas, getCategories, getBrands, getGachaGachashopMap } from "@/lib/db";
import GachasClient from "./GachasClient";

export const revalidate = 60; // 60초마다 재검증

export default async function GachasPage() {
  const [gachas, categories, brands, gachaGachashopMap] = await Promise.all([
    getGachas(),
    getCategories(),
    getBrands(),
    getGachaGachashopMap(),
  ]);

  return (
    <Suspense fallback={<GachasLoading />}>
      <GachasClient
        gachas={gachas}
        categories={categories}
        brands={brands}
        gachaGachashopMap={gachaGachashopMap}
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
        <div className="space-y-5 mb-6">
          <div className="h-10 w-full bg-gray-100 rounded animate-pulse" />
          <div className="h-10 w-full bg-gray-100 rounded animate-pulse" />
          <div className="h-10 w-full bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
