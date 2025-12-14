import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import FavoriteButton from "@/components/common/FavoriteButton";
import { Gacha } from "@/types";

interface GachaCardProps {
  gacha: Gacha;
}

export default function GachaCard({ gacha }: GachaCardProps) {
  const isNew = gacha.releaseDate
    ? new Date(gacha.releaseDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    : false;

  return (
    <Link href={`/gachas/${gacha.id}`}>
      <Card className="group overflow-hidden hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border-0 bg-white shadow-sm rounded-2xl">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {gacha.imageUrl ? (
            <Image
              src={gacha.imageUrl}
              alt={gacha.nameKo || gacha.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-50 via-rose-50 to-sky-50">
              <svg viewBox="0 0 40 48" className="w-14 h-16 opacity-60 drop-shadow-md">
                <path d="M20 4 C8 4 4 14 4 22 L36 22 C36 14 32 4 20 4 Z" fill="#FFF1F2" stroke="#FECDD3" strokeWidth="2" />
                <path d="M4 26 C4 34 8 44 20 44 C32 44 36 34 36 26 L4 26 Z" fill="#FECDD3" stroke="#FDA4AF" strokeWidth="2" />
                <rect x="4" y="22" width="32" height="4" fill="#FDA4AF" />
                <ellipse cx="14" cy="14" rx="4" ry="3" fill="white" opacity="0.6" />
              </svg>
            </div>
          )}
          {/* 호버 시 나타나는 그라데이션 오버레이 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* 즐겨찾기 버튼 */}
          <div className="absolute top-2 right-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
            <FavoriteButton type="gacha" id={gacha.id} />
          </div>

          {/* NEW 뱃지 */}
          {isNew && (
            <Badge className="absolute top-2 left-2 bg-gradient-to-r from-rose-400 to-pink-500 text-white text-xs shadow-md border-0">
              <svg className="w-3 h-3 mr-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              NEW
            </Badge>
          )}

          {/* 호버 시 나타나는 보기 버튼 */}
          <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <span className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full shadow-lg">
              <svg viewBox="0 0 24 32" className="w-3 h-4">
                <path d="M12 2 C5 2 2 8 2 12 L22 12 C22 8 19 2 12 2 Z" fill="#EDE9FE" stroke="#C4B5FD" strokeWidth="1" />
                <path d="M2 16 C2 22 5 28 12 28 C19 28 22 22 22 16 L2 16 Z" fill="#C4B5FD" stroke="#A78BFA" strokeWidth="1" />
                <rect x="2" y="12" width="20" height="4" fill="#A78BFA" />
              </svg>
              자세히 보기
            </span>
          </div>
        </div>
        <CardContent className="p-3">
          <h3 className="font-semibold text-sm text-foreground group-hover:text-rose-500 transition-colors line-clamp-2 mb-1">
            {gacha.nameKo || gacha.name}
          </h3>
          {gacha.nameKo && (
            <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
              {gacha.name}
            </p>
          )}
          <div className="flex items-center justify-between">
            <span className="text-xs text-violet-500 font-medium bg-violet-50 px-2 py-0.5 rounded-full">{gacha.brand}</span>
            <span className="text-sm font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">{gacha.price.toLocaleString()}원</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
