"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import GachashopCard from "@/components/cards/GachashopCard";
import type { Gachashop } from "@/types";

interface GachashopsClientProps {
  gachashops: Gachashop[];
}

// 주소에서 지역 추출
function extractRegion(address: string): string {
  const firstWord = address.split(" ")[0];
  if (firstWord.includes("특별자치")) {
    return firstWord.replace("특별자치도", "").replace("특별자치시", "");
  }
  return firstWord;
}

// 지역 정렬 순서
const REGION_ORDER = [
  "서울", "경기", "인천", "부산", "대구", "대전", "광주", "울산", "세종",
  "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"
];

export default function GachashopsClient({ gachashops }: GachashopsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "newest">("name");
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [inputValue, setInputValue] = useState(initialQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedFilter, setExpandedFilter] = useState<string | null>(null);

  // 지역 목록 추출
  const regions = useMemo(() => {
    const regionSet = new Set<string>();
    gachashops.forEach((shop) => {
      if (shop.address) {
        regionSet.add(extractRegion(shop.address));
      }
    });
    return Array.from(regionSet).sort((a, b) => {
      const aIndex = REGION_ORDER.indexOf(a);
      const bIndex = REGION_ORDER.indexOf(b);
      if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
  }, [gachashops]);

  // 필터링된 가챠샵
  const filteredShops = useMemo(() => {
    let result = gachashops;

    // 검색어 필터
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (shop) =>
          shop.name.toLowerCase().includes(query) ||
          shop.address.toLowerCase().includes(query)
      );
    }

    // 지역 필터
    if (selectedRegion) {
      result = result.filter((shop) => extractRegion(shop.address) === selectedRegion);
    }

    // 정렬
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name, "ko");
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    return result;
  }, [gachashops, selectedRegion, searchQuery, sortBy]);

  // 지역별 가챠샵 수 (검색 결과 기준)
  const regionCounts = useMemo(() => {
    const searchFiltered = searchQuery
      ? gachashops.filter(
          (shop) =>
            shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            shop.address.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : gachashops;

    const counts: Record<string, number> = {};
    searchFiltered.forEach((shop) => {
      const region = extractRegion(shop.address);
      counts[region] = (counts[region] || 0) + 1;
    });
    return counts;
  }, [gachashops, searchQuery]);

  // 활성 필터 개수
  const activeFilterCount = selectedRegion ? 1 : 0;

  // 정렬 라벨
  const getSortLabel = (sort: typeof sortBy) => {
    switch (sort) {
      case "name": return "이름순";
      case "newest": return "최신순";
    }
  };

  // 검색 처리
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(inputValue);
    setSelectedRegion(null);
    if (inputValue.trim()) {
      router.push(`/gachashops?q=${encodeURIComponent(inputValue.trim())}`, { scroll: false });
    } else {
      router.push("/gachashops", { scroll: false });
    }
  };

  // 검색 초기화
  const clearSearch = () => {
    setInputValue("");
    setSearchQuery("");
    router.push("/gachashops", { scroll: false });
  };

  return (
    <div className="min-h-screen py-8 bg-gradient-to-b from-white via-rose-50/30 to-white">
      {/* 배경 장식 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-rose-100/40 rounded-full blur-3xl" />
        <div className="absolute top-40 right-20 w-40 h-40 bg-pink-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-1/4 w-48 h-48 bg-sky-100/30 rounded-full blur-3xl" />
        {/* 떠다니는 캡슐 장식 */}
        <div className="absolute top-32 right-[15%] animate-bounce opacity-30" style={{ animationDuration: "3s" }}>
          <svg viewBox="0 0 30 40" className="w-6 h-8">
            <path d="M15 3 C6 3 3 10 3 16 L27 16 C27 10 24 3 15 3 Z" fill="#FECDD3" />
            <path d="M3 20 C3 26 6 34 15 34 C24 34 27 26 27 20 L3 20 Z" fill="#FDA4AF" />
            <rect x="3" y="16" width="24" height="4" fill="#FB7185" />
          </svg>
        </div>
        <div className="absolute bottom-60 left-[8%] animate-bounce opacity-25" style={{ animationDuration: "2.5s", animationDelay: "0.5s" }}>
          <svg viewBox="0 0 30 40" className="w-5 h-7 rotate-12">
            <path d="M15 3 C6 3 3 10 3 16 L27 16 C27 10 24 3 15 3 Z" fill="#BAE6FD" />
            <path d="M3 20 C3 26 6 34 15 34 C24 34 27 26 27 20 L3 20 Z" fill="#7DD3FC" />
            <rect x="3" y="16" width="24" height="4" fill="#38BDF8" />
          </svg>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-rose-200 to-rose-300 rounded-2xl flex items-center justify-center shadow-sm">
              <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">가차샵</h1>
              <p className="text-muted-foreground">전국의 가차샵을 찾아보세요</p>
            </div>
          </div>
        </div>

        {/* 검색창 & 필터 (Sticky) */}
        <div className="sticky top-16 z-40 -mx-4 px-4 py-3 bg-gradient-to-b from-white via-white to-white/95 backdrop-blur-sm">
          {/* 검색창 */}
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative max-w-md">
              <input
                type="text"
                placeholder="가차샵 이름 또는 주소 검색..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full pl-4 pr-20 py-3 text-sm rounded-full border border-rose-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-300 transition-all shadow-sm"
              />
              {inputValue && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-rose-300 text-white p-2 rounded-full hover:bg-rose-400 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>

          {/* 필터 & 정렬 바 */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          {/* 필터 헤더 */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 sm:p-4 border-b border-gray-50">
            <div className="flex flex-wrap items-center gap-2">
              {/* 필터 토글 버튼 */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full transition-all ${
                  showFilters || activeFilterCount > 0
                    ? "bg-rose-100 text-rose-600"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                필터
                {activeFilterCount > 0 && (
                  <span className="px-1.5 py-0.5 text-xs bg-rose-500 text-white rounded-full">
                    {activeFilterCount}
                  </span>
                )}
                <svg className={`w-3.5 h-3.5 transition-transform ${showFilters ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* 정렬 드롭다운 */}
              <div className="relative">
                <button
                  onClick={() => setExpandedFilter(expandedFilter === "sort" ? null : "sort")}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                  </svg>
                  {getSortLabel(sortBy)}
                  <svg className={`w-3.5 h-3.5 transition-transform ${expandedFilter === "sort" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedFilter === "sort" && (
                  <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20 min-w-[120px]">
                    {(["name", "newest"] as const).map((option) => (
                      <button
                        key={option}
                        onClick={() => { setSortBy(option); setExpandedFilter(null); }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                          sortBy === option ? "text-rose-500 font-medium" : "text-gray-700"
                        }`}
                      >
                        {getSortLabel(option)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 필터 초기화 */}
            {activeFilterCount > 0 && (
              <button
                onClick={() => setSelectedRegion(null)}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors whitespace-nowrap"
              >
                초기화
              </button>
            )}
          </div>

          {/* 확장 필터 패널 */}
          {showFilters && (
            <div className="p-4 bg-gray-50/50">
              {/* 지역 */}
              <div>
                <button
                  onClick={() => setExpandedFilter(expandedFilter === "region" ? null : "region")}
                  className="flex items-center justify-between w-full text-left"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">지역</span>
                    {selectedRegion && (
                      <span className="px-2 py-0.5 text-xs bg-rose-100 text-rose-600 rounded-full">
                        {selectedRegion}
                      </span>
                    )}
                  </div>
                  <svg className={`w-4 h-4 text-gray-400 transition-transform ${expandedFilter === "region" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedFilter === "region" && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedRegion(null)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all ${
                        selectedRegion === null
                          ? "bg-rose-300 text-white shadow-sm"
                          : "bg-white border border-rose-200 text-rose-400 hover:bg-rose-50"
                      }`}
                    >
                      전체 ({Object.values(regionCounts).reduce((a, b) => a + b, 0)})
                    </button>
                    {regions.map((region) => (
                      <button
                        key={region}
                        onClick={() => setSelectedRegion(region)}
                        disabled={!regionCounts[region]}
                        className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all ${
                          selectedRegion === region
                            ? "bg-rose-300 text-white shadow-sm"
                            : regionCounts[region]
                            ? "bg-white border border-rose-200 text-rose-400 hover:bg-rose-50"
                            : "bg-gray-50 border border-gray-200 text-gray-300 cursor-not-allowed"
                        }`}
                      >
                        {region} ({regionCounts[region] || 0})
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          </div>
        </div>

        {/* 결과 개수 */}
        <p className="text-sm text-muted-foreground mb-4">
          {searchQuery && <span>&quot;{searchQuery}&quot; 검색 결과 · </span>}
          {selectedRegion && <span>{selectedRegion} 지역 · </span>}
          {filteredShops.length}개의 가차샵
        </p>

        {/* 가챠샵 그리드 */}
        {filteredShops.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredShops.map((shop) => (
              <GachashopCard key={shop.id} gachashop={shop} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-rose-100 shadow-lg relative overflow-hidden">
            {/* 배경 장식 */}
            <div className="absolute top-6 left-8 animate-bounce" style={{ animationDuration: "3s" }}>
              <svg className="w-5 h-5 text-rose-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="absolute top-10 right-12 animate-pulse" style={{ animationDelay: "0.5s" }}>
              <svg className="w-4 h-4 text-pink-200" fill="currentColor" viewBox="0 0 24 24">
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
              <div className="w-20 h-20 mx-auto mb-5 bg-gradient-to-br from-rose-100 to-rose-200 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-10 h-10 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-700 mb-2">검색 결과가 없어요</h2>
              <p className="text-sm text-gray-400 mb-4">다른 검색어로 시도해보세요!</p>
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="bg-gradient-to-r from-rose-400 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white rounded-full px-6 py-2.5 font-medium shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95"
                >
                  검색 초기화
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
