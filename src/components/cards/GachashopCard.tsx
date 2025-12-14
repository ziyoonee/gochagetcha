import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import FavoriteButton from "@/components/common/FavoriteButton";
import { Gachashop } from "@/types";

interface GachashopCardProps {
  gachashop: Gachashop;
}

export default function GachashopCard({ gachashop }: GachashopCardProps) {
  // 주소에서 지역 추출
  const region = gachashop.address?.split(" ")[0] || "";

  return (
    <Link href={`/gachashops/${gachashop.id}`}>
      <Card className="group overflow-hidden hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border-0 bg-white shadow-sm rounded-2xl">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {gachashop.imageUrl ? (
            <Image
              src={gachashop.imageUrl}
              alt={gachashop.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-50 via-pink-50 to-sky-50 relative overflow-hidden">
              {/* 배경 장식 */}
              <div className="absolute top-4 left-4 w-6 h-6 bg-rose-200/50 rounded-full" />
              <div className="absolute bottom-6 right-6 w-4 h-4 bg-sky-200/50 rounded-full" />
              <div className="absolute top-1/2 right-4 w-3 h-3 bg-violet-200/50 rounded-full" />
              <svg viewBox="0 0 40 48" className="w-14 h-16 opacity-60 drop-shadow-md relative z-10">
                <path d="M20 4 C8 4 4 14 4 22 L36 22 C36 14 32 4 20 4 Z" fill="#FFF1F2" stroke="#FECDD3" strokeWidth="2" />
                <path d="M4 26 C4 34 8 44 20 44 C32 44 36 34 36 26 L4 26 Z" fill="#FECDD3" stroke="#FDA4AF" strokeWidth="2" />
                <rect x="4" y="22" width="32" height="4" fill="#FDA4AF" />
                <ellipse cx="14" cy="14" rx="4" ry="3" fill="white" opacity="0.6" />
              </svg>
            </div>
          )}
          {/* 호버 시 나타나는 그라데이션 오버레이 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* 즐겨찾기 버튼 */}
          <div className="absolute top-2 right-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
            <FavoriteButton type="gachashop" id={gachashop.id} />
          </div>

          {/* 지역 뱃지 */}
          {region && (
            <Badge className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-rose-500 text-xs shadow-sm border-0">
              <svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {region}
            </Badge>
          )}

          {/* 호버 시 나타나는 "보러가기" 버튼 */}
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <span className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium px-4 py-2 rounded-full shadow-lg">
              <svg className="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              가차샵 보러가기
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-bold text-foreground group-hover:text-rose-500 transition-colors line-clamp-1 mb-1">
            {gachashop.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-1 flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-rose-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {gachashop.address}
          </p>
          {gachashop.openingHours && (
            <Badge variant="outline" className="mt-2 text-xs border-sky-200 text-sky-600 bg-sky-50">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {gachashop.openingHours}
            </Badge>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
