"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import GachaCard from "@/components/cards/GachaCard";
import { Button } from "@/components/ui/button";
import type { Gacha } from "@/types";

interface GachasClientProps {
  gachas: Gacha[];
  categories: string[];
  brands: string[];
}

const ITEMS_PER_LOAD = 24;

export default function GachasClient({ gachas, categories, brands }: GachasClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_LOAD);
  const [isLoading, setIsLoading] = useState(false);

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

  const filteredGachas = useMemo(() => {
    return gachas
      .filter((gacha) => {
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

        return true;
      })
      .sort((a, b) => {
        if (!a.releaseDate) return 1;
        if (!b.releaseDate) return -1;
        return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
      });
  }, [gachas, selectedCategory, selectedBrand, selectedMonth]);

  // 필터 변경 시 displayCount 리셋
  useEffect(() => {
    setDisplayCount(ITEMS_PER_LOAD);
  }, [selectedCategory, selectedBrand, selectedMonth]);

  // 표시할 가챠
  const displayedGachas = filteredGachas.slice(0, displayCount);
  const hasMore = displayCount < filteredGachas.length;

  // 더 불러오기
  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    // 약간의 딜레이로 로딩 효과
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

  const resetFilter = (setter: (value: null | string) => void, value: null | string) => {
    setter(value);
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">가차</h1>
          <p className="text-muted-foreground">
            다양한 가차 상품을 찾아보세요. 총 {gachas.length}개의 가차가 있습니다.
          </p>
        </div>

        {/* 필터 */}
        <div className="mb-8 space-y-4">
          {/* 출시월 필터 */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">출시월</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedMonth === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => resetFilter(setSelectedMonth, "all")}
                className={`rounded-full ${
                  selectedMonth === "all"
                    ? "bg-rose-500 text-white hover:bg-rose-600"
                    : "border-rose-300 hover:bg-rose-50 text-rose-600"
                }`}
              >
                전체
              </Button>
              <Button
                variant={selectedMonth === "new" ? "default" : "outline"}
                size="sm"
                onClick={() => resetFilter(setSelectedMonth, "new")}
                className={`rounded-full ${
                  selectedMonth === "new"
                    ? "bg-rose-500 text-white hover:bg-rose-600"
                    : "border-rose-300 hover:bg-rose-50 text-rose-600"
                }`}
              >
                신상 (30일)
              </Button>
              <Button
                variant={selectedMonth === currentMonth ? "default" : "outline"}
                size="sm"
                onClick={() => resetFilter(setSelectedMonth, currentMonth)}
                className={`rounded-full ${
                  selectedMonth === currentMonth
                    ? "bg-rose-500 text-white hover:bg-rose-600"
                    : "border-rose-300 hover:bg-rose-50 text-rose-600"
                }`}
              >
                이번달
              </Button>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="rounded-full border border-rose-300 px-3 py-1 text-sm text-rose-600 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="all">월 선택</option>
                {availableMonths.map((ym) => (
                  <option key={ym} value={ym}>
                    {formatMonth(ym)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 카테고리 필터 */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">카테고리</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className={`rounded-full ${
                  selectedCategory === null
                    ? "bg-primary text-primary-foreground"
                    : "border-primary/30 hover:bg-primary/10"
                }`}
              >
                전체
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full ${
                    selectedCategory === category
                      ? "bg-primary text-primary-foreground"
                      : "border-primary/30 hover:bg-primary/10"
                  }`}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* 브랜드 필터 */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">브랜드</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedBrand === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedBrand(null)}
                className={`rounded-full ${
                  selectedBrand === null
                    ? "bg-secondary text-secondary-foreground"
                    : "border-secondary/30 hover:bg-secondary/10"
                }`}
              >
                전체
              </Button>
              {brands.map((brand) => (
                <Button
                  key={brand}
                  variant={selectedBrand === brand ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedBrand(brand)}
                  className={`rounded-full ${
                    selectedBrand === brand
                      ? "bg-secondary text-secondary-foreground"
                      : "border-secondary/30 hover:bg-secondary/10"
                  }`}
                >
                  {brand}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* 결과 개수 */}
        <p className="text-sm text-muted-foreground mb-4">
          {filteredGachas.length}개의 가챠
          {hasMore && ` (${displayedGachas.length}개 표시 중)`}
        </p>

        {/* 가챠 그리드 */}
        {displayedGachas.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {displayedGachas.map((gacha) => (
              <GachaCard key={gacha.id} gacha={gacha} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-primary/10">
            <p className="text-muted-foreground">조건에 맞는 가챠가 없습니다.</p>
          </div>
        )}

        {/* 무한 스크롤 로더 */}
        {hasMore && (
          <div ref={loaderRef} className="flex justify-center items-center py-8">
            {isLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <svg
                  className="animate-spin h-5 w-5 text-rose-500"
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
