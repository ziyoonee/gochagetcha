"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import GachaCard from "@/components/cards/GachaCard";
import type { Gacha } from "@/types";

interface GachasClientProps {
  gachas: Gacha[];
  categories: string[];
  brands: string[];
  gachaGachashopMap: Record<string, string[]>;
}

const ITEMS_PER_LOAD = 24;

export default function GachasClient({ gachas, categories, brands, gachaGachashopMap }: GachasClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "name" | "priceLow" | "priceHigh">("newest");
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_LOAD);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [inputValue, setInputValue] = useState(initialQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedFilter, setExpandedFilter] = useState<string | null>(null);

  const loaderRef = useRef<HTMLDivElement>(null);

  // 사용 가능한 월 목록 추출
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    gachas.forEach((g) => {
      if (g.releaseDate) {
        months.add(g.releaseDate.substring(0, 7));
      }
    });
    return Array.from(months).sort().reverse();
  }, [gachas]);

  const currentMonth = new Date().toISOString().substring(0, 7);

  // 활성 필터 개수
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategory) count++;
    if (selectedBrand) count++;
    if (selectedMonth !== "all") count++;
    if (showOnlyAvailable) count++;
    return count;
  }, [selectedCategory, selectedBrand, selectedMonth, showOnlyAvailable]);

  // 필터 초기화
  const resetFilters = () => {
    setSelectedCategory(null);
    setSelectedBrand(null);
    setSelectedMonth("all");
    setShowOnlyAvailable(false);
  };

  // 정렬 라벨
  const getSortLabel = (sort: typeof sortBy) => {
    switch (sort) {
      case "newest": return "최신순";
      case "name": return "이름순";
      case "priceLow": return "가격 낮은순";
      case "priceHigh": return "가격 높은순";
    }
  };

  const filteredGachas = useMemo(() => {
    return gachas
      .filter((gacha) => {
        // 검색어 필터 (keywords 포함)
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const matchesSearch =
            gacha.name.toLowerCase().includes(query) ||
            (gacha.nameKo && gacha.nameKo.toLowerCase().includes(query)) ||
            (gacha.keywords && gacha.keywords.toLowerCase().includes(query)) ||
            gacha.brand.toLowerCase().includes(query) ||
            gacha.category.toLowerCase().includes(query);
          if (!matchesSearch) return false;
        }

        if (selectedCategory && gacha.category !== selectedCategory) return false;
        if (selectedBrand && gacha.brand !== selectedBrand) return false;

        if (selectedMonth === "new") {
          if (!gacha.releaseDate) return false;
          const releaseDate = new Date(gacha.releaseDate);
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          if (releaseDate < thirtyDaysAgo) return false;
        } else if (selectedMonth !== "all") {
          if (!gacha.releaseDate) return false;
          if (!gacha.releaseDate.startsWith(selectedMonth)) return false;
        }

        // 판매처 있는 가차만 보기
        if (showOnlyAvailable) {
          const gachashopIds = gachaGachashopMap[gacha.id] || [];
          if (gachashopIds.length === 0) return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "newest":
            if (!a.releaseDate) return 1;
            if (!b.releaseDate) return -1;
            return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
          case "name":
            const nameA = a.nameKo || a.name;
            const nameB = b.nameKo || b.name;
            return nameA.localeCompare(nameB, "ko");
          case "priceLow":
            return a.price - b.price;
          case "priceHigh":
            return b.price - a.price;
          default:
            return 0;
        }
      });
  }, [gachas, selectedCategory, selectedBrand, selectedMonth, showOnlyAvailable, searchQuery, sortBy, gachaGachashopMap]);

  // 필터 변경 시 displayCount 리셋
  useEffect(() => {
    setDisplayCount(ITEMS_PER_LOAD);
  }, [selectedCategory, selectedBrand, selectedMonth, showOnlyAvailable, searchQuery, sortBy]);

  // 표시할 가챠
  const displayedGachas = filteredGachas.slice(0, displayCount);
  const hasMore = displayCount < filteredGachas.length;

  // 더 불러오기
  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setTimeout(() => {
      setDisplayCount((prev) => Math.min(prev + ITEMS_PER_LOAD, filteredGachas.length));
      setIsLoading(false);
    }, 300);
  }, [isLoading, hasMore, filteredGachas.length]);

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

  const formatMonth = (ym: string) => {
    const [year, month] = ym.split("-");
    return `${year}년 ${parseInt(month)}월`;
  };

  // 검색 처리
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(inputValue);
    // URL 업데이트
    if (inputValue.trim()) {
      router.push(`/gachas?q=${encodeURIComponent(inputValue.trim())}`, { scroll: false });
    } else {
      router.push("/gachas", { scroll: false });
    }
  };

  // 검색 초기화
  const clearSearch = () => {
    setInputValue("");
    setSearchQuery("");
    router.push("/gachas", { scroll: false });
  };

  // 필터 버튼 스타일 (파스텔 톤)
  const getFilterButtonClass = (isActive: boolean, variant: "primary" | "secondary" | "sky") => {
    const baseClass = "px-4 py-2 text-sm font-medium rounded-full transition-all duration-200";

    if (isActive) {
      switch (variant) {
        case "primary":
          return `${baseClass} bg-rose-300 text-white shadow-sm`;
        case "secondary":
          return `${baseClass} bg-violet-300 text-white shadow-sm`;
        case "sky":
          return `${baseClass} bg-sky-300 text-white shadow-sm`;
      }
    } else {
      switch (variant) {
        case "primary":
          return `${baseClass} bg-white border border-rose-200 text-rose-400 hover:bg-rose-50 hover:border-rose-300`;
        case "secondary":
          return `${baseClass} bg-white border border-violet-200 text-violet-400 hover:bg-violet-50 hover:border-violet-300`;
        case "sky":
          return `${baseClass} bg-white border border-sky-200 text-sky-400 hover:bg-sky-50 hover:border-sky-300`;
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
        {/* 떠다니는 캡슐 장식 */}
        <div className="absolute top-32 right-[12%] animate-bounce opacity-30" style={{ animationDuration: "3s" }}>
          <svg viewBox="0 0 30 40" className="w-6 h-8">
            <path d="M15 3 C6 3 3 10 3 16 L27 16 C27 10 24 3 15 3 Z" fill="#EDE9FE" />
            <path d="M3 20 C3 26 6 34 15 34 C24 34 27 26 27 20 L3 20 Z" fill="#C4B5FD" />
            <rect x="3" y="16" width="24" height="4" fill="#A78BFA" />
          </svg>
        </div>
        <div className="absolute top-64 left-[8%] animate-bounce opacity-25" style={{ animationDuration: "2.5s", animationDelay: "0.5s" }}>
          <svg viewBox="0 0 30 40" className="w-5 h-7 rotate-12">
            <path d="M15 3 C6 3 3 10 3 16 L27 16 C27 10 24 3 15 3 Z" fill="#FECDD3" />
            <path d="M3 20 C3 26 6 34 15 34 C24 34 27 26 27 20 L3 20 Z" fill="#FDA4AF" />
            <rect x="3" y="16" width="24" height="4" fill="#FB7185" />
          </svg>
        </div>
        <div className="absolute bottom-40 right-[18%] animate-bounce opacity-20" style={{ animationDuration: "3.5s", animationDelay: "1s" }}>
          <svg viewBox="0 0 30 40" className="w-4 h-6 -rotate-12">
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

        {/* 검색창 & 필터 (Sticky) */}
        <div className="sticky top-16 z-40 -mx-4 px-4 py-3 bg-gradient-to-b from-white via-white to-white/95 backdrop-blur-sm">
          {/* 검색창 */}
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative max-w-md">
              <input
                type="text"
                placeholder="가차 이름, 브랜드, 카테고리 검색..."
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
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                  </svg>
                  {getSortLabel(sortBy)}
                  <svg className={`w-3.5 h-3.5 transition-transform ${expandedFilter === "sort" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedFilter === "sort" && (
                  <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20 min-w-[140px]">
                    {(["newest", "name", "priceLow", "priceHigh"] as const).map((option) => (
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

              {/* 판매처 있는 가차만 토글 */}
              <button
                onClick={() => setShowOnlyAvailable(!showOnlyAvailable)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full transition-all ${
                  showOnlyAvailable
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {showOnlyAvailable ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 32" className="w-4 h-5">
                    <path d="M12 2 C5 2 2 8 2 12 L22 12 C22 8 19 2 12 2 Z" fill="#D1FAE5" stroke="#6EE7B7" strokeWidth="1" />
                    <path d="M2 16 C2 22 5 28 12 28 C19 28 22 22 22 16 L2 16 Z" fill="#6EE7B7" stroke="#34D399" strokeWidth="1" />
                    <rect x="2" y="12" width="20" height="4" fill="#34D399" />
                  </svg>
                )}
                <span className="hidden sm:inline">판매처 있는 가차만</span>
                <span className="sm:hidden">보유</span>
              </button>
            </div>

            {/* 필터 초기화 */}
            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors whitespace-nowrap"
              >
                초기화
              </button>
            )}
          </div>

          {/* 확장 필터 패널 */}
          {showFilters && (
            <div className="p-4 space-y-4 bg-gray-50/50">
              {/* 출시월 */}
              <div>
                <button
                  onClick={() => setExpandedFilter(expandedFilter === "month" || expandedFilter === "monthSelect" ? null : "month")}
                  className="flex items-center justify-between w-full text-left"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">출시월</span>
                    {selectedMonth !== "all" && (
                      <span className="px-2 py-0.5 text-xs bg-rose-100 text-rose-600 rounded-full">
                        {selectedMonth === "new" ? "신상" : selectedMonth === currentMonth ? "이번달" : formatMonth(selectedMonth)}
                      </span>
                    )}
                  </div>
                  <svg className={`w-4 h-4 text-gray-400 transition-transform ${expandedFilter === "month" || expandedFilter === "monthSelect" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {(expandedFilter === "month" || expandedFilter === "monthSelect") && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[
                      { value: "all", label: "전체" },
                      { value: "new", label: "신상 (30일)" },
                      { value: currentMonth, label: "이번달" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setSelectedMonth(option.value)}
                        className={getFilterButtonClass(selectedMonth === option.value, "primary")}
                      >
                        {option.label}
                      </button>
                    ))}
                    {/* 월 선택 드롭다운 */}
                    <div className="relative">
                      <button
                        onClick={() => setExpandedFilter(expandedFilter === "monthSelect" ? "month" : "monthSelect")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full transition-all ${
                          selectedMonth !== "all" && selectedMonth !== "new" && selectedMonth !== currentMonth
                            ? "bg-rose-300 text-white shadow-sm"
                            : "bg-white border border-rose-200 text-rose-400 hover:bg-rose-50"
                        }`}
                      >
                        {selectedMonth !== "all" && selectedMonth !== "new" && selectedMonth !== currentMonth
                          ? formatMonth(selectedMonth)
                          : "월 선택"}
                        <svg className={`w-3.5 h-3.5 transition-transform ${expandedFilter === "monthSelect" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {expandedFilter === "monthSelect" && (
                        <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-30 max-h-60 overflow-y-auto min-w-[140px]">
                          {availableMonths.map((ym) => (
                            <button
                              key={ym}
                              onClick={() => { setSelectedMonth(ym); setExpandedFilter(null); }}
                              className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                                selectedMonth === ym ? "text-rose-500 font-medium" : "text-gray-700"
                              }`}
                            >
                              {formatMonth(ym)}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 카테고리 */}
              <div>
                <button
                  onClick={() => setExpandedFilter(expandedFilter === "category" ? null : "category")}
                  className="flex items-center justify-between w-full text-left"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">카테고리</span>
                    {selectedCategory && (
                      <span className="px-2 py-0.5 text-xs bg-violet-100 text-violet-600 rounded-full">
                        {selectedCategory}
                      </span>
                    )}
                  </div>
                  <svg className={`w-4 h-4 text-gray-400 transition-transform ${expandedFilter === "category" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedFilter === "category" && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={getFilterButtonClass(selectedCategory === null, "secondary")}
                    >
                      전체
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={getFilterButtonClass(selectedCategory === category, "secondary")}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 브랜드 */}
              <div>
                <button
                  onClick={() => setExpandedFilter(expandedFilter === "brand" ? null : "brand")}
                  className="flex items-center justify-between w-full text-left"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">브랜드</span>
                    {selectedBrand && (
                      <span className="px-2 py-0.5 text-xs bg-sky-100 text-sky-600 rounded-full">
                        {selectedBrand}
                      </span>
                    )}
                  </div>
                  <svg className={`w-4 h-4 text-gray-400 transition-transform ${expandedFilter === "brand" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedFilter === "brand" && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedBrand(null)}
                      className={getFilterButtonClass(selectedBrand === null, "sky")}
                    >
                      전체
                    </button>
                    {brands.map((brand) => (
                      <button
                        key={brand}
                        onClick={() => setSelectedBrand(brand)}
                        className={getFilterButtonClass(selectedBrand === brand, "sky")}
                      >
                        {brand}
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
          {filteredGachas.length}개의 가차
        </p>

        {/* 가챠 그리드 */}
        {displayedGachas.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {displayedGachas.map((gacha) => (
              <GachaCard key={gacha.id} gacha={gacha} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-violet-100 shadow-lg relative overflow-hidden">
            {/* 배경 장식 */}
            <div className="absolute top-6 left-8 animate-bounce" style={{ animationDuration: "3s" }}>
              <svg viewBox="0 0 30 40" className="w-5 h-7 opacity-30">
                <path d="M15 3 C6 3 3 10 3 16 L27 16 C27 10 24 3 15 3 Z" fill="#EDE9FE" />
                <path d="M3 20 C3 26 6 34 15 34 C24 34 27 26 27 20 L3 20 Z" fill="#C4B5FD" />
                <rect x="3" y="16" width="24" height="4" fill="#A78BFA" />
              </svg>
            </div>
            <div className="absolute top-10 right-12 animate-pulse" style={{ animationDelay: "0.5s" }}>
              <svg className="w-4 h-4 text-violet-200" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <div className="absolute bottom-8 right-16 animate-bounce" style={{ animationDuration: "2.5s", animationDelay: "1s" }}>
              <svg viewBox="0 0 30 40" className="w-4 h-6 opacity-25 rotate-12">
                <path d="M15 3 C6 3 3 10 3 16 L27 16 C27 10 24 3 15 3 Z" fill="#FECDD3" />
                <path d="M3 20 C3 26 6 34 15 34 C24 34 27 26 27 20 L3 20 Z" fill="#FDA4AF" />
                <rect x="3" y="16" width="24" height="4" fill="#FB7185" />
              </svg>
            </div>

            <div className="relative z-10">
              <div className="w-20 h-20 mx-auto mb-5 bg-gradient-to-br from-violet-100 to-violet-200 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-10 h-10 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-700 mb-2">검색 결과가 없어요</h2>
              <p className="text-sm text-gray-400 mb-4">다른 검색어나 필터로 시도해보세요!</p>
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="bg-gradient-to-r from-violet-400 to-violet-500 hover:from-violet-500 hover:to-violet-600 text-white rounded-full px-6 py-2.5 font-medium shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95"
                >
                  검색 초기화
                </button>
              )}
            </div>
          </div>
        )}

        {/* 무한 스크롤 로더 */}
        {hasMore && (
          <div ref={loaderRef} className="flex justify-center items-center py-8">
            {isLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <svg
                  className="animate-spin h-5 w-5 text-rose-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>불러오는 중...</span>
              </div>
            ) : (
              <div className="h-8" />
            )}
          </div>
        )}

        {/* 모두 로드됨 */}
        {!hasMore && displayedGachas.length > ITEMS_PER_LOAD && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            모든 가챠를 불러왔습니다
          </div>
        )}
      </div>
    </div>
  );
}
