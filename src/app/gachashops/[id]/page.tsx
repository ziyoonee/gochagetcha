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

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* 뒤로가기 */}
        <Link
          href="/gachashops"
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
          가차샵 목록으로
        </Link>

        {/* 가차샵 정보 */}
        <div className="bg-white rounded-2xl shadow-sm border border-primary/10 overflow-hidden mb-8">
          <div className="grid md:grid-cols-2 gap-0">
            {/* 이미지 */}
            <div className="relative aspect-video md:aspect-auto md:min-h-[300px] bg-muted">
              {gachashop.imageUrl ? (
                <Image
                  src={gachashop.imageUrl}
                  alt={gachashop.name}
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
            </div>

            {/* 정보 */}
            <div className="p-6 md:p-8">
              <div className="flex items-start justify-between gap-4 mb-4">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  {gachashop.name}
                </h1>
                <FavoriteButton
                  type="gachashop"
                  id={gachashop.id}
                  className="shrink-0"
                />
              </div>

              <div className="space-y-4">
                {/* 주소 */}
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-primary shrink-0 mt-0.5"
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
                  <CopyableText text={gachashop.address} className="text-foreground" />
                </div>

                {/* 영업시간 */}
                {gachashop.openingHours && (
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-primary shrink-0 mt-0.5"
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
                    <span className="text-foreground">
                      {gachashop.openingHours}
                    </span>
                  </div>
                )}

                {/* 전화번호 */}
                {gachashop.phone && (
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-primary shrink-0 mt-0.5"
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
                    <CopyableText text={gachashop.phone} className="text-foreground" />
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* 지도 섹션 */}
        {gachashop.latitude && gachashop.longitude && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">위치</h2>
            <EmbeddedMap
              latitude={gachashop.latitude}
              longitude={gachashop.longitude}
            />
          </div>
        )}

        {/* 보유 가차 목록 */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold text-foreground">보유 가차</h2>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
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
            <div className="text-center py-12 bg-white rounded-2xl border border-primary/10">
              <p className="text-muted-foreground">
                등록된 가차 정보가 없습니다.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
