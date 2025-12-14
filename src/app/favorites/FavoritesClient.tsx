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
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="h-6 bg-gray-100 rounded w-64"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">즐겨찾기</h1>
          <p className="text-muted-foreground">
            {totalFavorites > 0
              ? `총 ${totalFavorites}개의 즐겨찾기`
              : "즐겨찾기한 항목이 없습니다."}
          </p>
        </div>

        {totalFavorites === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-16 h-16 mx-auto mb-4 bg-amber-50 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-amber-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </div>
            <p className="text-gray-600 mb-4">
              아직 즐겨찾기한 항목이 없어요.
            </p>
            <p className="text-sm text-gray-400 mb-6">
              가차샵이나 가차의 별 아이콘을 눌러 즐겨찾기에 추가해보세요!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/gachashops">
                <button className="bg-rose-300 hover:bg-rose-400 text-white rounded-full px-6 py-2.5 font-medium shadow-sm transition-all hover:shadow-md">
                  가차샵 둘러보기
                </button>
              </Link>
              <Link href="/gachas">
                <button className="border border-rose-200 text-rose-400 bg-white hover:bg-rose-50 hover:border-rose-300 rounded-full px-6 py-2.5 font-medium transition-all">
                  가차 둘러보기
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* 탭 */}
            <div className="flex gap-2 mb-8">
              <button
                onClick={() => setActiveTab("shops")}
                className={`px-5 py-2.5 rounded-full font-medium transition-all ${
                  activeTab === "shops"
                    ? "bg-rose-300 text-white shadow-sm"
                    : "bg-white border border-rose-200 text-rose-400 hover:bg-rose-50 hover:border-rose-300"
                }`}
              >
                가차샵 ({favoriteShops.length})
              </button>
              <button
                onClick={() => setActiveTab("gachas")}
                className={`px-5 py-2.5 rounded-full font-medium transition-all ${
                  activeTab === "gachas"
                    ? "bg-rose-300 text-white shadow-sm"
                    : "bg-white border border-rose-200 text-rose-400 hover:bg-rose-50 hover:border-rose-300"
                }`}
              >
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
                  <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                    <p className="text-gray-500">
                      즐겨찾기한 가차샵이 없습니다.
                    </p>
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
                  <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                    <p className="text-gray-500">
                      즐겨찾기한 가차가 없습니다.
                    </p>
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
