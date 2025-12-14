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
    <div className="min-h-screen py-8 bg-gradient-to-b from-white via-violet-50/30 to-white">
      {/* 배경 장식 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-rose-100/40 rounded-full blur-3xl" />
        <div className="absolute top-40 right-20 w-40 h-40 bg-violet-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-1/4 w-48 h-48 bg-sky-100/30 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* 뒤로가기 */}
        <Link
          href="/gachas"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-rose-500 mb-6 transition-colors group"
        >
          <div className="w-8 h-8 rounded-full bg-rose-50 group-hover:bg-rose-100 flex items-center justify-center transition-colors">
            <svg
              className="w-4 h-4"
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
          </div>
          가차 목록으로
        </Link>

        {/* 가차 정보 */}
        <div className="bg-white rounded-3xl shadow-lg border border-rose-100 overflow-hidden mb-8">
          <div className="grid md:grid-cols-2 gap-0">
            {/* 이미지 */}
            <div className="relative aspect-square md:aspect-auto md:min-h-[450px] bg-gradient-to-br from-violet-50 via-rose-50 to-sky-50">
              {gacha.imageUrl ? (
                <Image
                  src={gacha.imageUrl}
                  alt={gacha.nameKo || gacha.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center relative">
                  {/* 배경 장식 */}
                  <div className="absolute top-8 left-8 w-12 h-12 bg-rose-200/30 rounded-full animate-pulse" />
                  <div className="absolute bottom-12 right-12 w-8 h-8 bg-violet-200/30 rounded-full animate-pulse" style={{ animationDelay: "0.5s" }} />
                  <div className="absolute top-1/2 right-8 w-6 h-6 bg-sky-200/30 rounded-full animate-pulse" style={{ animationDelay: "1s" }} />
                  <svg
                    viewBox="0 0 40 48"
                    className="w-32 h-40 opacity-60 drop-shadow-lg"
                  >
                    <path d="M20 4 C8 4 4 14 4 22 L36 22 C36 14 32 4 20 4 Z" fill="#FFF1F2" stroke="#FECDD3" strokeWidth="2" />
                    <path d="M4 26 C4 34 8 44 20 44 C32 44 36 34 36 26 L4 26 Z" fill="#FECDD3" stroke="#FDA4AF" strokeWidth="2" />
                    <rect x="4" y="22" width="32" height="4" fill="#FDA4AF" />
                    <ellipse cx="14" cy="14" rx="4" ry="3" fill="white" opacity="0.6" />
                  </svg>
                </div>
              )}
              {isNew && (
                <Badge className="absolute top-4 left-4 bg-gradient-to-r from-rose-400 to-pink-500 text-white text-sm px-4 py-1.5 shadow-lg border-0">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  NEW
                </Badge>
              )}
            </div>

            {/* 정보 */}
            <div className="p-6 md:p-8 bg-gradient-to-br from-white to-rose-50/30">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
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
                <Badge className="bg-violet-100 text-violet-600 border-violet-200 px-3 py-1">
                  <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  {gacha.category}
                </Badge>
                <Badge className="bg-sky-100 text-sky-600 border-sky-200 px-3 py-1">
                  <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  {gacha.brand}
                </Badge>
              </div>

              <div className="space-y-4 bg-white/60 rounded-2xl p-5 border border-rose-100">
                {/* 가격 */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-100 to-rose-200 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-rose-600"
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
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">가격</p>
                    <span className="text-2xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
                      {gacha.price.toLocaleString()}원
                    </span>
                  </div>
                </div>

                {/* 출시일 */}
                {gacha.releaseDate && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-violet-200 flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-violet-600"
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
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">출시일</p>
                      <span className="text-foreground font-medium">
                        {gacha.releaseDate}
                      </span>
                    </div>
                  </div>
                )}

                {/* 브랜드 */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-100 to-sky-200 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-sky-600"
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
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">제조사</p>
                    <span className="text-foreground font-medium">{gacha.brand}</span>
                  </div>
                </div>
              </div>

              {/* 판매처 찾기 버튼 */}
              <div className="mt-8">
                <Link href={`/map?gacha=${id}`}>
                  <button className="w-full sm:w-auto bg-gradient-to-r from-rose-400 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white rounded-full px-8 py-3 font-medium shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95 flex items-center justify-center gap-2">
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
            <div className="w-10 h-10 bg-gradient-to-br from-rose-200 to-rose-300 rounded-xl flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">판매 가차샵</h2>
              <p className="text-sm text-muted-foreground">이 가차를 판매하는 가차샵</p>
            </div>
            <Badge className="bg-rose-100 text-rose-600 border-rose-200 ml-auto">
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
            <div className="text-center py-16 bg-white rounded-3xl border border-rose-100 shadow-sm">
              <div className="w-20 h-20 mx-auto mb-4 bg-rose-50 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-rose-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <p className="text-muted-foreground mb-2">
                판매 중인 가차샵 정보가 없습니다.
              </p>
              <p className="text-sm text-rose-400">
                곧 정보가 업데이트 될 예정이에요!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
