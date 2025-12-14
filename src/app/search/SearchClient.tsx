"use client";

import Link from "next/link";
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
    <div className="min-h-screen py-8 bg-gradient-to-b from-white via-rose-50/30 to-white">
      {/* 배경 장식 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-rose-100/40 rounded-full blur-3xl" />
        <div className="absolute top-40 right-20 w-40 h-40 bg-sky-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-1/4 w-48 h-48 bg-violet-100/30 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* 검색 결과 헤더 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-rose-200 to-rose-300 rounded-2xl flex items-center justify-center shadow-sm">
              <svg
                className="w-6 h-6 text-rose-600"
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
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
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
          </div>
        </div>

        {query && totalResults === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-rose-100 shadow-lg relative overflow-hidden">
            {/* 배경 장식 */}
            <div className="absolute top-6 left-8 animate-bounce" style={{ animationDuration: "3s" }}>
              <svg className="w-5 h-5 text-rose-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="absolute top-12 right-12 animate-pulse" style={{ animationDelay: "0.5s" }}>
              <svg className="w-4 h-4 text-violet-200" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <div className="absolute bottom-8 left-16 animate-bounce" style={{ animationDuration: "2.5s", animationDelay: "1s" }}>
              <svg viewBox="0 0 30 40" className="w-5 h-7 opacity-30">
                <path d="M15 3 C6 3 3 10 3 16 L27 16 C27 10 24 3 15 3 Z" fill="#FECDD3" />
                <path d="M3 20 C3 26 6 34 15 34 C24 34 27 26 27 20 L3 20 Z" fill="#FDA4AF" />
                <rect x="3" y="16" width="24" height="4" fill="#FB7185" />
              </svg>
            </div>

            <div className="relative z-10">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-rose-100 to-rose-200 rounded-full flex items-center justify-center shadow-lg">
                <svg
                  className="w-12 h-12 text-rose-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-700 mb-2">
                검색 결과가 없어요
              </h2>
              <p className="text-sm text-gray-400 mb-6">
                다른 검색어로 시도해보세요!
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/gachashops">
                  <button className="bg-gradient-to-r from-rose-400 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white rounded-full px-8 py-3 font-medium shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95 flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    가차샵 둘러보기
                  </button>
                </Link>
                <Link href="/gachas">
                  <button className="border-2 border-violet-200 text-violet-500 bg-white hover:bg-violet-50 hover:border-violet-300 rounded-full px-8 py-3 font-medium transition-all hover:scale-105 flex items-center justify-center gap-2">
                    <svg viewBox="0 0 24 32" className="w-4 h-5">
                      <path d="M12 2 C5 2 2 8 2 12 L22 12 C22 8 19 2 12 2 Z" fill="#EDE9FE" stroke="#C4B5FD" strokeWidth="1" />
                      <path d="M2 16 C2 22 5 28 12 28 C19 28 22 22 22 16 L2 16 Z" fill="#C4B5FD" stroke="#A78BFA" strokeWidth="1" />
                      <rect x="2" y="12" width="20" height="4" fill="#A78BFA" />
                    </svg>
                    가차 둘러보기
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* 가차샵 결과 */}
        {results.gachashops.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-rose-200 to-rose-300 rounded-xl flex items-center justify-center shadow-sm">
                  <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">가차샵</h2>
                  <p className="text-sm text-muted-foreground">{results.gachashops.length}개의 결과</p>
                </div>
              </div>
              <Link
                href={`/gachashops?q=${encodeURIComponent(query)}`}
                className="group w-10 h-10 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-500 flex items-center justify-center transition-all hover:shadow-md hover:scale-110 active:scale-95"
                title="더보기"
              >
                <svg className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
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
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-200 to-violet-300 rounded-xl flex items-center justify-center shadow-sm">
                  <svg viewBox="0 0 24 32" className="w-5 h-6 drop-shadow-sm">
                    <path d="M12 2 C5 2 2 8 2 12 L22 12 C22 8 19 2 12 2 Z" fill="#EDE9FE" stroke="#C4B5FD" strokeWidth="1" />
                    <path d="M2 16 C2 22 5 28 12 28 C19 28 22 22 22 16 L2 16 Z" fill="#C4B5FD" stroke="#A78BFA" strokeWidth="1" />
                    <rect x="2" y="12" width="20" height="4" fill="#A78BFA" />
                    <ellipse cx="8" cy="7" rx="3" ry="2" fill="white" opacity="0.5" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">가차</h2>
                  <p className="text-sm text-muted-foreground">{results.gachas.length}개의 결과</p>
                </div>
              </div>
              <Link
                href={`/gachas?q=${encodeURIComponent(query)}`}
                className="group w-10 h-10 rounded-full bg-violet-50 hover:bg-violet-100 text-violet-500 flex items-center justify-center transition-all hover:shadow-md hover:scale-110 active:scale-95"
                title="더보기"
              >
                <svg className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
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
