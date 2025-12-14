"use client";

import { useState, useEffect } from "react";
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

  useEffect(() => {
    setMounted(true);
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

  const totalFavorites = favoriteShops.length + favoriteGachas.length;

  if (!mounted) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-10 bg-muted rounded w-48 mb-4"></div>
            <div className="h-6 bg-muted rounded w-64"></div>
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
          <div className="text-center py-16 bg-white rounded-2xl border border-primary/10">
            <div className="w-16 h-16 mx-auto mb-4 bg-accent/20 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-accent"
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
            <p className="text-muted-foreground mb-4">
              아직 즐겨찾기한 항목이 없어요.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              가차샵이나 가차의 별 아이콘을 눌러 즐겨찾기에 추가해보세요!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/gachashops">
                <Button
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/10 rounded-full"
                >
                  가차샵 둘러보기
                </Button>
              </Link>
              <Link href="/gachas">
                <Button
                  variant="outline"
                  className="border-secondary text-secondary-foreground hover:bg-secondary/10 rounded-full"
                >
                  가차 둘러보기
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* 탭 */}
            <div className="flex gap-2 mb-8">
              <Button
                variant={activeTab === "shops" ? "default" : "outline"}
                onClick={() => setActiveTab("shops")}
                className={`rounded-full ${
                  activeTab === "shops"
                    ? "bg-primary text-primary-foreground"
                    : "border-primary/30 hover:bg-primary/10"
                }`}
              >
                가차샵 ({favoriteShops.length})
              </Button>
              <Button
                variant={activeTab === "gachas" ? "default" : "outline"}
                onClick={() => setActiveTab("gachas")}
                className={`rounded-full ${
                  activeTab === "gachas"
                    ? "bg-primary text-primary-foreground"
                    : "border-primary/30 hover:bg-primary/10"
                }`}
              >
                가차 ({favoriteGachas.length})
              </Button>
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
                  <div className="text-center py-12 bg-white rounded-2xl border border-primary/10">
                    <p className="text-muted-foreground">
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
                  <div className="text-center py-12 bg-white rounded-2xl border border-primary/10">
                    <p className="text-muted-foreground">
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
