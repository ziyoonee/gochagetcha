"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import GachaCard from "@/components/cards/GachaCard";
import type { Gacha } from "@/types";

interface GachasClientProps {
  categories: string[];
  brands: string[];
  initialGachas: Gacha[];
  initialTotal: number;
}

export default function GachasClient({ categories, brands, initialGachas, initialTotal }: GachasClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [gachas, setGachas] = useState<Gacha[]>(initialGachas);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialGachas.length < initialTotal);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "name" | "priceLow" | "priceHigh">("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [expandedFilter, setExpandedFilter] = useState<string | null>(null);

  const loaderRef = useRef<HTMLDivElement>(null);

  // 클라이언트 마운트
  useEffect(() => {
    const urlQuery = searchParams.get("q") || "";
    if (urlQuery) {
      setSearchQuery(urlQuery);
      setInputValue(urlQuery);
    }
    setIsMounted(true);
  }, [searchParams]);

  // API 호출 함수
  const fetchGachas = useCallback(async (pageNum: number, reset: boolean = false) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', pageNum.toString());
      if (searchQuery) params.set('q', searchQuery);
      if (selectedCategory) params.set('category', selectedCategory);
      if (selectedBrand) params.set('brand', selectedBrand);
      if (selectedMonth !== 'all') params.set('month', selectedMonth);
      params.set('sort', sortBy);

      const res = await fetch(`/api/gachas?${params.toString()}`);
      const data = await res.json();

      if (reset) {
        setGachas(data.gachas);
      } else {
        setGachas(prev => [...prev, ...data.gachas]);
      }
      setTotal(data.total);
      setHasMore(data.hasMore);
      setPage(pageNum);
    } catch (error) {
      console.error('가차 로드 오류:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedBrand, selectedMonth, sortBy]);

  // 필터/검색 변경 시 새로 로드
  useEffect(() => {
    if (!isMounted) return;
    fetchGachas(1, true);
  }, [searchQuery, selectedCategory, selectedBrand, selectedMonth, sortBy, isMounted, fetchGachas]);

  // 더 불러오기
  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;
    fetchGachas(page + 1, false);
  }, [isLoading, hasMore, page, fetchGachas]);

  // Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [hasMore, isLoading, loadMore]);

  // 사용 가능한 월 목록 (최근 12개월)
  const availableMonths = (() => {
    const months: string[] = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(d.toISOString().substring(0, 7));
    }
    return months;
  })();

  const currentMonth = new Date().toISOString().substring(0, 7);

  // 활성 필터 개수
  const activeFilterCount = [selectedCategory, selectedBrand, selectedMonth !== "all" ? selectedMonth : null].filter(Boolean).length;

  // 필터 초기화
  const resetFilters = () => {
    setSelectedCategory(null);
    setSelectedBrand(null);
    setSelectedMonth("all");
  };

  const getSortLabel = (sort: typeof sortBy) => {
    switch (sort) {
      case "newest": return "최신순";
      case "name": return "이름순";
      case "priceLow": return "가격 낮은순";
      case "priceHigh": return "가격 높은순";
    }
  };

  const formatMonth = (ym: string) => {
    const [year, month] = ym.split("-");
    return `${year}년 ${parseInt(month)}월`;
  };

  // 검색 처리
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(inputValue);
    if (inputValue.trim()) {
      router.push(`/gachas?q=${encodeURIComponent(inputValue.trim())}`, { scroll: false });
    } else {
      router.push("/gachas", { scroll: false });
    }
  };

  const clearSearch = () => {
    setInputValue("");
    setSearchQuery("");
    router.push("/gachas", { scroll: false });
  };

  const getFilterButtonClass = (isActive: boolean, variant: "primary" | "secondary" | "sky") => {
    const baseClass = "px-4 py-2 text-sm font-medium rounded-full transition-all duration-200";
    if (isActive) {
      switch (variant) {
        case "primary": return `${baseClass} bg-rose-300 text-white shadow-sm`;
        case "secondary": return `${baseClass} bg-violet-300 text-white shadow-sm`;
        case "sky": return `${baseClass} bg-sky-300 text-white shadow-sm`;
      }
    } else {
      switch (variant) {
        case "primary": return `${baseClass} bg-white border border-rose-200 text-rose-400 hover:bg-rose-50`;
        case "secondary": return `${baseClass} bg-white border border-violet-200 text-violet-400 hover:bg-violet-50`;
        case "sky": return `${baseClass} bg-white border border-sky-200 text-sky-400 hover:bg-sky-50`;
      }
    }
  };

  return (
    <div className="min-h-screen py-8 bg-gradient-to-b from-white via-violet-50/30 to-white">
      {/* 배경 장식 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-violet-100/40 rounded-full blur-3xl" />
        <div className="absolute top-40 right-20 w-40 h-40 bg-rose-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-1/4 w-48 h-48 bg-pink-100/30 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-200 to-violet-300 rounded-2xl flex items-center justify-center shadow-sm">
              <svg viewBox="0 0 24 32" className="w-6 h-7 drop-shadow-sm">
                <path d="M12 2 C5 2 2 8 2 12 L22 12 C22 8 19 2 12 2 Z" fill="#EDE9FE" stroke="#C4B5FD" strokeWidth="1" />
                <path d="M2 16 C2 22 5 28 12 28 C19 28 22 22 22 16 L2 16 Z" fill="#C4B5FD" stroke="#A78BFA" strokeWidth="1" />
                <rect x="2" y="12" width="20" height="4" fill="#A78BFA" />
                <ellipse cx="8" cy="7" rx="3" ry="2" fill="white" opacity="0.5" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent">가차</h1>
              <p className="text-muted-foreground">다양한 가차 상품을 찾아보세요</p>
            </div>
          </div>
        </div>

        {/* 검색창 & 필터 */}
        <div className="sticky top-16 z-40 -mx-4 px-4 py-3 bg-gradient-to-b from-white via-white to-white/95 backdrop-blur-sm">
          {/* 검색창 */}
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative max-w-md">
              <input
                type="text"
                placeholder="가차 이름, 브랜드 검색... (오타/줄임말 OK)"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full pl-4 pr-20 py-3 text-sm rounded-full border border-rose-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-300 transition-all shadow-sm"
              />
              {inputValue && (
                <button type="button" onClick={clearSearch} className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 bg-rose-300 text-white p-2 rounded-full hover:bg-rose-400 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>

          {/* 필터 바 */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 sm:p-4 border-b border-gray-50">
              <div className="flex flex-wrap items-center gap-2">
                {/* 필터 토글 */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full transition-all ${
                    showFilters || activeFilterCount > 0 ? "bg-rose-100 text-rose-600" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  필터
                  {activeFilterCount > 0 && (
                    <span className="px-1.5 py-0.5 text-xs bg-rose-500 text-white rounded-full">{activeFilterCount}</span>
                  )}
                </button>

                {/* 정렬 */}
                <div className="relative">
                  <button
                    onClick={() => setExpandedFilter(expandedFilter === "sort" ? null : "sort")}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100 transition-all"
                  >
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                    </svg>
                    {getSortLabel(sortBy)}
                  </button>
                  {expandedFilter === "sort" && (
                    <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20 min-w-[140px]">
                      {(["newest", "name", "priceLow", "priceHigh"] as const).map((option) => (
                        <button
                          key={option}
                          onClick={() => { setSortBy(option); setExpandedFilter(null); }}
                          className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${sortBy === option ? "text-rose-500 font-medium" : "text-gray-700"}`}
                        >
                          {getSortLabel(option)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {activeFilterCount > 0 && (
                <button onClick={resetFilters} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
                  초기화
                </button>
              )}
            </div>

            {/* 확장 필터 */}
            {showFilters && (
              <div className="p-4 space-y-4 bg-gray-50/50">
                {/* 출시월 */}
                <div>
                  <button onClick={() => setExpandedFilter(expandedFilter === "month" ? null : "month")} className="flex items-center justify-between w-full text-left">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">출시월</span>
                      {selectedMonth !== "all" && (
                        <span className="px-2 py-0.5 text-xs bg-rose-100 text-rose-600 rounded-full">
                          {selectedMonth === "new" ? "신상" : formatMonth(selectedMonth)}
                        </span>
                      )}
                    </div>
                    <svg className={`w-4 h-4 text-gray-400 transition-transform ${expandedFilter === "month" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedFilter === "month" && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {[{ value: "all", label: "전체" }, { value: "new", label: "신상 (30일)" }, { value: currentMonth, label: "이번달" }].map((opt) => (
                        <button key={opt.value} onClick={() => setSelectedMonth(opt.value)} className={getFilterButtonClass(selectedMonth === opt.value, "primary")}>
                          {opt.label}
                        </button>
                      ))}
                      {availableMonths.slice(1, 6).map((ym) => (
                        <button key={ym} onClick={() => setSelectedMonth(ym)} className={getFilterButtonClass(selectedMonth === ym, "primary")}>
                          {formatMonth(ym)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 카테고리 */}
                <div>
                  <button onClick={() => setExpandedFilter(expandedFilter === "category" ? null : "category")} className="flex items-center justify-between w-full text-left">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">카테고리</span>
                      {selectedCategory && <span className="px-2 py-0.5 text-xs bg-violet-100 text-violet-600 rounded-full">{selectedCategory}</span>}
                    </div>
                    <svg className={`w-4 h-4 text-gray-400 transition-transform ${expandedFilter === "category" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedFilter === "category" && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button onClick={() => setSelectedCategory(null)} className={getFilterButtonClass(selectedCategory === null, "secondary")}>전체</button>
                      {categories.map((cat) => (
                        <button key={cat} onClick={() => setSelectedCategory(cat)} className={getFilterButtonClass(selectedCategory === cat, "secondary")}>{cat}</button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 브랜드 */}
                <div>
                  <button onClick={() => setExpandedFilter(expandedFilter === "brand" ? null : "brand")} className="flex items-center justify-between w-full text-left">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">브랜드</span>
                      {selectedBrand && <span className="px-2 py-0.5 text-xs bg-sky-100 text-sky-600 rounded-full">{selectedBrand}</span>}
                    </div>
                    <svg className={`w-4 h-4 text-gray-400 transition-transform ${expandedFilter === "brand" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedFilter === "brand" && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button onClick={() => setSelectedBrand(null)} className={getFilterButtonClass(selectedBrand === null, "sky")}>전체</button>
                      {brands.map((brand) => (
                        <button key={brand} onClick={() => setSelectedBrand(brand)} className={getFilterButtonClass(selectedBrand === brand, "sky")}>{brand}</button>
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
          {total}개의 가차
        </p>

        {/* 가챠 그리드 */}
        {gachas.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {gachas.map((gacha) => (
              <GachaCard key={gacha.id} gacha={gacha} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-violet-100 shadow-lg">
            <div className="w-20 h-20 mx-auto mb-5 bg-gradient-to-br from-violet-100 to-violet-200 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-10 h-10 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-700 mb-2">검색 결과가 없어요</h2>
            <p className="text-sm text-gray-400 mb-4">다른 검색어나 필터로 시도해보세요!</p>
            {(searchQuery || activeFilterCount > 0) && (
              <button
                onClick={() => { clearSearch(); resetFilters(); }}
                className="bg-gradient-to-r from-violet-400 to-violet-500 hover:from-violet-500 hover:to-violet-600 text-white rounded-full px-6 py-2.5 font-medium shadow-lg transition-all hover:scale-105"
              >
                필터 초기화
              </button>
            )}
          </div>
        )}

        {/* 로딩 / 무한 스크롤 */}
        {hasMore && (
          <div ref={loaderRef} className="flex justify-center items-center py-8">
            {isLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <svg className="animate-spin h-5 w-5 text-rose-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>불러오는 중...</span>
              </div>
            ) : (
              <div className="h-8" />
            )}
          </div>
        )}

        {!hasMore && gachas.length > 24 && (
          <div className="text-center py-8 text-muted-foreground text-sm">모든 가차를 불러왔습니다</div>
        )}
      </div>
    </div>
  );
}
