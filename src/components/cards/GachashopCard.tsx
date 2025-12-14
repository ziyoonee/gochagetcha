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
  return (
    <Link href={`/gachashops/${gachashop.id}`}>
      <Card className="group overflow-hidden hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border-0 bg-white shadow-sm">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {gachashop.imageUrl ? (
            <Image
              src={gachashop.imageUrl}
              alt={gachashop.name}
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute top-2 right-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
            <FavoriteButton type="gachashop" id={gachashop.id} />
          </div>
          {/* 호버 시 나타나는 "보러가기" 버튼 */}
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <span className="inline-block bg-white text-foreground text-xs font-medium px-3 py-1.5 rounded-full shadow-lg">
              상세보기 →
            </span>
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-foreground group-hover:text-rose-500 transition-colors line-clamp-1">
            {gachashop.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
            {gachashop.address}
          </p>
          {gachashop.openingHours && (
            <Badge variant="outline" className="mt-2 text-xs border-border">
              {gachashop.openingHours}
            </Badge>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
