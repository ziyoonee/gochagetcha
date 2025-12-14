import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import GachashopCard from "@/components/cards/GachashopCard";
import FavoriteButton from "@/components/common/FavoriteButton";
import { getGachaById, getGachashopsByGachaId } from "@/lib/db";

export const revalidate = 60;

interface GachaDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function GachaDetailPage({ params }: GachaDetailPageProps) {
  const { id } = await params;
  const gacha = await getGachaById(id);

  if (!gacha) {
    notFound();
  }

  const gachashops = await getGachashopsByGachaId(id);

  const isNew = gacha.releaseDate
    ? new Date(gacha.releaseDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    : false;

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* 뒤로가기 */}
        <Link
          href="/gachas"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          가차 목록으로
        </Link>

        {/* 가차 정보 */}
        <div className="bg-white rounded-2xl shadow-sm border border-primary/10 overflow-hidden mb-8">
          <div className="grid md:grid-cols-2 gap-0">
            {/* 이미지 */}
            <div className="relative aspect-square md:aspect-auto md:min-h-[400px] bg-muted">
              {gacha.imageUrl ? (
                <Image
                  src={gacha.imageUrl}
                  alt={gacha.nameKo || gacha.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                  <svg
                    className="w-24 h-24 text-primary/40"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <ellipse cx="12" cy="12" rx="10" ry="11" />
                  </svg>
                </div>
              )}
              {isNew && (
                <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground text-sm px-3 py-1">
                  NEW
                </Badge>
              )}
            </div>

            {/* 정보 */}
            <div className="p-6 md:p-8">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                    {gacha.nameKo || gacha.name}
                  </h1>
                  {gacha.nameKo && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {gacha.name}
                    </p>
                  )}
                </div>
                <FavoriteButton type="gacha" id={gacha.id} className="shrink-0" />
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                <Badge variant="outline" className="border-primary/30">
                  {gacha.category}
                </Badge>
                <Badge variant="secondary" className="bg-secondary/20">
                  {gacha.brand}
                </Badge>
              </div>

              <div className="space-y-4">
                {/* 가격 */}
                <div className="flex items-center gap-3">
                  <svg
                    className="w-5 h-5 text-primary shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-2xl font-bold text-primary">
                    {gacha.price.toLocaleString()}원
                  </span>
                </div>

                {/* 출시일 */}
                {gacha.releaseDate && (
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5 text-primary shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-foreground">
                      출시일: {gacha.releaseDate}
                    </span>
                  </div>
                )}

                {/* 브랜드 */}
                <div className="flex items-center gap-3">
                  <svg
                    className="w-5 h-5 text-primary shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  <span className="text-foreground">제조사: {gacha.brand}</span>
                </div>
              </div>

              {/* 판매처 찾기 버튼 */}
              <div className="mt-8">
                <Link href={`/map?gacha=${id}`}>
                  <button className="w-full sm:w-auto bg-rose-300 hover:bg-rose-400 text-white rounded-full px-6 py-2.5 font-medium shadow-sm transition-all hover:scale-105 hover:shadow-md active:scale-95 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                      />
                    </svg>
                    판매처 지도에서 보기
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 판매 가차샵 목록 */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold text-foreground">판매 가차샵</h2>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {gachashops.length}곳
            </Badge>
          </div>

          {gachashops.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {gachashops.map((shop) => (
                <GachashopCard key={shop.id} gachashop={shop} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-primary/10">
              <p className="text-muted-foreground">
                판매 중인 가차샵 정보가 없습니다.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
