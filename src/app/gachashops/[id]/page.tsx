import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import GachaCard from "@/components/cards/GachaCard";
import FavoriteButton from "@/components/common/FavoriteButton";
import EmbeddedMap from "@/components/common/EmbeddedMap";
import CopyableText from "@/components/common/CopyableText";
import { getGachashopById, getGachasByGachashopId } from "@/lib/db";

export const revalidate = 60;

interface GachashopDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function GachashopDetailPage({
  params,
}: GachashopDetailPageProps) {
  const { id } = await params;
  const gachashop = await getGachashopById(id);

  if (!gachashop) {
    notFound();
  }

  const gachas = await getGachasByGachashopId(id);

  // 주소에서 지역 추출
  const region = gachashop.address?.split(" ")[0] || "";

  return (
    <div className="min-h-screen py-8 bg-gradient-to-b from-white via-rose-50/30 to-white">
      {/* 배경 장식 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-10 w-32 h-32 bg-rose-100/40 rounded-full blur-3xl" />
        <div className="absolute top-60 left-20 w-40 h-40 bg-sky-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-40 right-1/4 w-48 h-48 bg-violet-100/30 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* 뒤로가기 */}
        <Link
          href="/gachashops"
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
          가차샵 목록으로
        </Link>

        {/* 가차샵 정보 */}
        <div className="bg-white rounded-3xl shadow-lg border border-rose-100 overflow-hidden mb-8">
          <div className="grid md:grid-cols-2 gap-0">
            {/* 이미지 */}
            <div className="relative aspect-video md:aspect-auto md:min-h-[350px] bg-gradient-to-br from-rose-50 via-pink-50 to-sky-50">
              {gachashop.imageUrl ? (
                <Image
                  src={gachashop.imageUrl}
                  alt={gachashop.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center relative">
                  {/* 배경 장식 */}
                  <div className="absolute top-8 left-8 w-12 h-12 bg-rose-200/30 rounded-full animate-pulse" />
                  <div className="absolute bottom-12 right-12 w-8 h-8 bg-sky-200/30 rounded-full animate-pulse" style={{ animationDelay: "0.5s" }} />
                  <div className="absolute top-1/2 right-8 w-6 h-6 bg-violet-200/30 rounded-full animate-pulse" style={{ animationDelay: "1s" }} />
                  <svg
                    viewBox="0 0 40 48"
                    className="w-28 h-36 opacity-60 drop-shadow-lg"
                  >
                    <path d="M20 4 C8 4 4 14 4 22 L36 22 C36 14 32 4 20 4 Z" fill="#FFF1F2" stroke="#FECDD3" strokeWidth="2" />
                    <path d="M4 26 C4 34 8 44 20 44 C32 44 36 34 36 26 L4 26 Z" fill="#FECDD3" stroke="#FDA4AF" strokeWidth="2" />
                    <rect x="4" y="22" width="32" height="4" fill="#FDA4AF" />
                    <ellipse cx="14" cy="14" rx="4" ry="3" fill="white" opacity="0.6" />
                  </svg>
                </div>
              )}
              {/* 지역 뱃지 */}
              {region && (
                <Badge className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-rose-500 shadow-md border-0">
                  <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {region}
                </Badge>
              )}
            </div>

            {/* 정보 */}
            <div className="p-6 md:p-8 bg-gradient-to-br from-white to-rose-50/30">
              <div className="flex items-start justify-between gap-4 mb-4">
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  {gachashop.name}
                </h1>
                <FavoriteButton
                  type="gachashop"
                  id={gachashop.id}
                  className="shrink-0"
                />
              </div>

              <div className="space-y-4 bg-white/60 rounded-2xl p-5 border border-rose-100">
                {/* 주소 */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-100 to-rose-200 flex items-center justify-center shrink-0">
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
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">주소</p>
                    <CopyableText text={gachashop.address} className="text-foreground font-medium" />
                  </div>
                </div>

                {/* 영업시간 */}
                {gachashop.openingHours && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-100 to-sky-200 flex items-center justify-center shrink-0">
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
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">영업시간</p>
                      <span className="text-foreground font-medium">
                        {gachashop.openingHours}
                      </span>
                    </div>
                  </div>
                )}

                {/* 전화번호 */}
                {gachashop.phone && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-violet-200 flex items-center justify-center shrink-0">
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
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">전화번호</p>
                      <CopyableText text={gachashop.phone} className="text-foreground font-medium" />
                    </div>
                  </div>
                )}

                {/* 인스타그램 */}
                {gachashop.instagramUrl && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center shrink-0">
                      <svg
                        className="w-5 h-5 text-pink-600"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">인스타그램</p>
                      <a
                        href={gachashop.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-pink-500 hover:text-pink-600 font-medium transition-colors flex items-center gap-1 group"
                      >
                        @{gachashop.instagramUrl.replace(/https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/$/, '')}
                        <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* 지도 바로가기 버튼 */}
              <div className="mt-6">
                <Link href={`/map`}>
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
                    지도에서 위치 보기
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 지도 섹션 */}
        {gachashop.latitude && gachashop.longitude && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-sky-200 to-sky-300 rounded-xl flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">위치</h2>
                <p className="text-sm text-muted-foreground">가차샵 위치를 확인하세요</p>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-lg border border-sky-100">
              <EmbeddedMap
                latitude={gachashop.latitude}
                longitude={gachashop.longitude}
              />
            </div>
          </div>
        )}

        {/* 보유 가차 목록 */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-200 to-violet-300 rounded-xl flex items-center justify-center shadow-sm">
              <svg viewBox="0 0 24 32" className="w-5 h-6 drop-shadow-sm">
                <path d="M12 2 C5 2 2 8 2 12 L22 12 C22 8 19 2 12 2 Z" fill="#EDE9FE" stroke="#C4B5FD" strokeWidth="1" />
                <path d="M2 16 C2 22 5 28 12 28 C19 28 22 22 22 16 L2 16 Z" fill="#C4B5FD" stroke="#A78BFA" strokeWidth="1" />
                <rect x="2" y="12" width="20" height="4" fill="#A78BFA" />
                <ellipse cx="8" cy="7" rx="3" ry="2" fill="white" opacity="0.5" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">보유 가차</h2>
              <p className="text-sm text-muted-foreground">이 가차샵에서 판매하는 가차</p>
            </div>
            <Badge className="bg-violet-100 text-violet-600 border-violet-200 ml-auto">
              {gachas.length}개
            </Badge>
          </div>

          {gachas.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {gachas.map((gacha) => (
                <GachaCard key={gacha.id} gacha={gacha} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border border-violet-100 shadow-sm">
              <div className="w-20 h-20 mx-auto mb-4 bg-violet-50 rounded-full flex items-center justify-center">
                <svg viewBox="0 0 40 48" className="w-10 h-12 opacity-60">
                  <path d="M20 4 C8 4 4 14 4 22 L36 22 C36 14 32 4 20 4 Z" fill="#EDE9FE" stroke="#DDD6FE" strokeWidth="2" />
                  <path d="M4 26 C4 34 8 44 20 44 C32 44 36 34 36 26 L4 26 Z" fill="#DDD6FE" stroke="#C4B5FD" strokeWidth="2" />
                  <rect x="4" y="22" width="32" height="4" fill="#C4B5FD" />
                  <ellipse cx="14" cy="14" rx="4" ry="3" fill="white" opacity="0.6" />
                </svg>
              </div>
              <p className="text-muted-foreground mb-2">
                등록된 가차 정보가 없습니다.
              </p>
              <p className="text-sm text-violet-400">
                곧 정보가 업데이트 될 예정이에요!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
