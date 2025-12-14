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
      <Card className="group overflow-hidden hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border-0 bg-white shadow-sm">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {gacha.imageUrl ? (
            <Image
              src={gacha.imageUrl}
              alt={gacha.nameKo || gacha.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-50 to-sky-50">
              <svg viewBox="0 0 40 48" className="w-12 h-14 opacity-40">
                <path d="M20 4 C8 4 4 14 4 22 L36 22 C36 14 32 4 20 4 Z" fill="#FDA4AF" />
                <path d="M4 26 C4 34 8 44 20 44 C32 44 36 34 36 26 L4 26 Z" fill="#FB7185" />
                <rect x="4" y="22" width="32" height="4" fill="#E11D48" />
              </svg>
            </div>
          )}
          {/* 호버 시 나타나는 오버레이 */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <FavoriteButton type="gacha" id={gacha.id} />
          </div>
          {isNew && (
            <Badge className="absolute top-2 left-2 bg-rose-500 text-white text-xs">
              NEW
            </Badge>
          )}
        </div>
        <CardContent className="p-3">
          <h3 className="font-medium text-sm text-foreground group-hover:text-rose-500 transition-colors line-clamp-2 mb-1">
            {gacha.nameKo || gacha.name}
          </h3>
          {gacha.nameKo && (
            <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
              {gacha.name}
            </p>
          )}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{gacha.brand}</span>
            <span className="text-sm font-bold text-foreground">{gacha.price.toLocaleString()}원</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
