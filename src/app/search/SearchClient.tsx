"use client";

import GachashopCard from "@/components/cards/GachashopCard";
import GachaCard from "@/components/cards/GachaCard";
import type { Gachashop, Gacha } from "@/types";

interface SearchClientProps {
  query: string;
  results: {
    gachashops: Gachashop[];
    gachas: Gacha[];
  };
}

export default function SearchClient({ query, results }: SearchClientProps) {
  const totalResults = results.gachashops.length + results.gachas.length;

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* 검색 결과 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            검색 결과
          </h1>
          {query ? (
            <p className="text-muted-foreground">
              &quot;{query}&quot;에 대한 검색 결과 {totalResults}개
            </p>
          ) : (
            <p className="text-muted-foreground">검색어를 입력해주세요.</p>
          )}
        </div>

        {query && totalResults === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-primary/10">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <p className="text-muted-foreground">
              검색 결과가 없습니다.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              다른 검색어로 시도해보세요.
            </p>
          </div>
        )}

        {/* 가차샵 결과 */}
        {results.gachashops.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              가차샵 ({results.gachashops.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.gachashops.map((shop) => (
                <GachashopCard key={shop.id} gachashop={shop} />
              ))}
            </div>
          </div>
        )}

        {/* 가차 결과 */}
        {results.gachas.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">
              가차 ({results.gachas.length})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {results.gachas.map((gacha) => (
                <GachaCard key={gacha.id} gacha={gacha} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
