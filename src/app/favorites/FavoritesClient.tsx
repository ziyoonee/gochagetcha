"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import GachashopCard from "@/components/cards/GachashopCard";
import GachaCard from "@/components/cards/GachaCard";
import { getFavorites } from "@/lib/favorites";
import type { Gachashop, Gacha } from "@/types";

interface FavoritesClientProps {
  allGachashops: Gachashop[];
  allGachas: Gacha[];
}

export default function FavoritesClient({ allGachashops, allGachas }: FavoritesClientProps) {
  const [favoriteShops, setFavoriteShops] = useState<Gachashop[]>([]);
  const [favoriteGachas, setFavoriteGachas] = useState<Gacha[]>([]);
  const [activeTab, setActiveTab] = useState<"shops" | "gachas">("shops");
  const [mounted, setMounted] = useState(false);

  // 즐겨찾기 목록 새로고침
  const refreshFavorites = useCallback(() => {
    const favorites = getFavorites();

    const shops = allGachashops.filter((shop) =>
      favorites.gachashops.includes(shop.id)
    );
    const gachas = allGachas.filter((gacha) =>
      favorites.gachas.includes(gacha.id)
    );

    setFavoriteShops(shops);
    setFavoriteGachas(gachas);
  }, [allGachashops, allGachas]);

  useEffect(() => {
    setMounted(true);
    refreshFavorites();

    // localStorage 변경 감지 (다른 탭에서 변경 시)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "gachagetcha-favorites") {
        refreshFavorites();
      }
    };

    // 같은 탭에서 변경 감지 (커스텀 이벤트)
    const handleFavoriteChange = () => {
      refreshFavorites();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("favoriteChanged", handleFavoriteChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("favoriteChanged", handleFavoriteChange);
    };
  }, [refreshFavorites]);

  const totalFavorites = favoriteShops.length + favoriteGachas.length;

  if (!mounted) {
    return (
      <div className="min-h-screen py-8 bg-gradient-to-b from-white via-pink-50/30 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-10 bg-pink-100 rounded-xl w-48 mb-4"></div>
            <div className="h-6 bg-pink-50 rounded-lg w-64"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gradient-to-b from-white via-pink-50/30 to-white">
      {/* 배경 장식 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-pink-100/40 rounded-full blur-3xl" />
        <div className="absolute top-40 right-20 w-40 h-40 bg-rose-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-1/4 w-48 h-48 bg-violet-100/30 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-200 to-rose-300 rounded-2xl flex items-center justify-center shadow-sm">
              <svg
                className="w-6 h-6 text-pink-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">즐겨찾기</h1>
              <p className="text-muted-foreground">
                {totalFavorites > 0
                  ? `총 ${totalFavorites}개의 즐겨찾기`
                  : "즐겨찾기한 항목이 없습니다."}
              </p>
            </div>
          </div>
        </div>

        {totalFavorites === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-pink-100 shadow-lg relative overflow-hidden">
            {/* 배경 장식 */}
            <div className="absolute top-6 left-8 animate-bounce" style={{ animationDuration: "3s" }}>
              <svg className="w-6 h-6 text-pink-200" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            <div className="absolute top-12 right-12 animate-pulse" style={{ animationDelay: "0.5s" }}>
              <svg className="w-5 h-5 text-rose-200" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <div className="absolute bottom-10 left-16 animate-bounce" style={{ animationDuration: "2.5s", animationDelay: "1s" }}>
              <svg className="w-4 h-4 text-violet-200" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <div className="absolute bottom-8 right-10 animate-pulse" style={{ animationDelay: "0.3s" }}>
              <svg className="w-5 h-5 text-pink-200" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>

            <div className="relative z-10 px-4">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-pink-100 to-rose-200 rounded-full flex items-center justify-center shadow-lg">
                <svg
                  className="w-12 h-12 text-pink-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-700 mb-2">
                아직 즐겨찾기한 항목이 없어요
              </h2>
              <p className="text-sm text-gray-400 mb-8 max-w-sm mx-auto">
                가차샵이나 가차의 하트 아이콘을 눌러 즐겨찾기에 추가해보세요!
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/gachashops" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto bg-gradient-to-r from-rose-400 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white rounded-full px-8 py-3 font-medium shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95 flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    가차샵 둘러보기
                  </button>
                </Link>
                <Link href="/gachas" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto border-2 border-violet-200 text-violet-500 bg-white hover:bg-violet-50 hover:border-violet-300 rounded-full px-8 py-3 font-medium transition-all hover:scale-105 flex items-center justify-center gap-2">
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
        ) : (
          <>
            {/* 탭 */}
            <div className="flex gap-2 mb-8 p-1 bg-white rounded-2xl shadow-sm border border-pink-100 w-fit">
              <button
                onClick={() => setActiveTab("shops")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all ${
                  activeTab === "shops"
                    ? "bg-gradient-to-r from-rose-400 to-rose-500 text-white shadow-md"
                    : "text-gray-500 hover:text-rose-500 hover:bg-rose-50"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                가차샵 ({favoriteShops.length})
              </button>
              <button
                onClick={() => setActiveTab("gachas")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all ${
                  activeTab === "gachas"
                    ? "bg-gradient-to-r from-violet-400 to-violet-500 text-white shadow-md"
                    : "text-gray-500 hover:text-violet-500 hover:bg-violet-50"
                }`}
              >
                <svg viewBox="0 0 24 32" className="w-3.5 h-4">
                  <path d="M12 2 C5 2 2 8 2 12 L22 12 C22 8 19 2 12 2 Z" fill={activeTab === "gachas" ? "#DDD6FE" : "#EDE9FE"} stroke={activeTab === "gachas" ? "#E9D5FF" : "#C4B5FD"} strokeWidth="1" />
                  <path d="M2 16 C2 22 5 28 12 28 C19 28 22 22 22 16 L2 16 Z" fill={activeTab === "gachas" ? "#C4B5FD" : "#C4B5FD"} stroke={activeTab === "gachas" ? "#DDD6FE" : "#A78BFA"} strokeWidth="1" />
                  <rect x="2" y="12" width="20" height="4" fill={activeTab === "gachas" ? "#DDD6FE" : "#A78BFA"} />
                </svg>
                가차 ({favoriteGachas.length})
              </button>
            </div>

            {/* 가차샵 탭 */}
            {activeTab === "shops" && (
              <>
                {favoriteShops.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favoriteShops.map((shop) => (
                      <GachashopCard key={shop.id} gachashop={shop} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white rounded-3xl border border-rose-100 shadow-sm">
                    <div className="w-16 h-16 mx-auto mb-4 bg-rose-50 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-rose-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <p className="text-gray-500 mb-2">
                      즐겨찾기한 가차샵이 없습니다.
                    </p>
                    <Link href="/gachashops" className="text-sm text-rose-500 hover:text-rose-600 underline">
                      가차샵 둘러보기
                    </Link>
                  </div>
                )}
              </>
            )}

            {/* 가차 탭 */}
            {activeTab === "gachas" && (
              <>
                {favoriteGachas.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {favoriteGachas.map((gacha) => (
                      <GachaCard key={gacha.id} gacha={gacha} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white rounded-3xl border border-violet-100 shadow-sm">
                    <div className="w-16 h-16 mx-auto mb-4 bg-violet-50 rounded-full flex items-center justify-center">
                      <svg viewBox="0 0 40 48" className="w-8 h-10 opacity-60">
                        <path d="M20 4 C8 4 4 14 4 22 L36 22 C36 14 32 4 20 4 Z" fill="#EDE9FE" stroke="#DDD6FE" strokeWidth="2" />
                        <path d="M4 26 C4 34 8 44 20 44 C32 44 36 34 36 26 L4 26 Z" fill="#DDD6FE" stroke="#C4B5FD" strokeWidth="2" />
                        <rect x="4" y="22" width="32" height="4" fill="#C4B5FD" />
                        <ellipse cx="14" cy="14" rx="4" ry="3" fill="white" opacity="0.6" />
                      </svg>
                    </div>
                    <p className="text-gray-500 mb-2">
                      즐겨찾기한 가차가 없습니다.
                    </p>
                    <Link href="/gachas" className="text-sm text-violet-500 hover:text-violet-600 underline">
                      가차 둘러보기
                    </Link>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
