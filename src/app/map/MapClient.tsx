"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Gachashop } from "@/types";

interface MapClientProps {
  gachashops: Gachashop[];
}

export default function MapClient({ gachashops }: MapClientProps) {
  const [selectedShop, setSelectedShop] = useState<string | null>(null);
  const [openedCapsule, setOpenedCapsule] = useState<string | null>(null);

  const handleMarkerClick = (shopId: string) => {
    if (openedCapsule === shopId) {
      setOpenedCapsule(null);
      setSelectedShop(null);
    } else {
      setOpenedCapsule(shopId);
      setSelectedShop(shopId);
    }
  };

  const selectedShopData = selectedShop
    ? gachashops.find((s) => s.id === selectedShop)
    : null;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* 지도 영역 */}
      <div className="flex-1 relative bg-gradient-to-br from-sky-50 to-rose-50 min-h-[500px] lg:min-h-screen">
        {/* 지도 플레이스홀더 */}
        <div className="absolute inset-0 flex items-center justify-center opacity-30">
          <div className="text-center">
            <svg
              className="w-16 h-16 mx-auto text-muted-foreground/50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
            <p className="text-sm text-muted-foreground mt-2">
              카카오맵 API 연동 예정
            </p>
          </div>
        </div>

        {/* 캡슐 마커들 */}
        {gachashops.slice(0, 9).map((shop, index) => {
          const isOpened = openedCapsule === shop.id;
          const isSelected = selectedShop === shop.id;

          return (
            <button
              key={shop.id}
              onClick={() => handleMarkerClick(shop.id)}
              className={`absolute transform -translate-x-1/2 transition-all duration-300 ${
                isSelected ? "z-20 scale-110" : "z-10 hover:scale-105"
              }`}
              style={{
                left: `${15 + (index % 3) * 30 + (index % 2) * 5}%`,
                top: `${20 + Math.floor(index / 3) * 28}%`,
              }}
            >
              <div className="relative" style={{ overflow: "visible" }}>
                {/* 캡슐 마커 */}
                <svg
                  viewBox="0 -20 48 84"
                  className={`w-14 h-20 drop-shadow-lg transition-all duration-300 ${
                    isOpened ? "filter brightness-110" : ""
                  }`}
                  style={{ overflow: "visible" }}
                >
                  {/* 캡슐 상단 (뚜껑) - 열릴 때 위로 올라감 */}
                  <g
                    className="transition-transform duration-500"
                    style={{
                      transform: isOpened
                        ? "translateY(-16px) rotate(-20deg)"
                        : "translateY(0) rotate(0)",
                      transformOrigin: "24px 24px",
                    }}
                  >
                    <path
                      d="M24 4 C10 4 6 14 6 24 L42 24 C42 14 38 4 24 4 Z"
                      fill={isSelected ? "#FEF3C7" : "#FFF1F2"}
                      stroke={isSelected ? "#F59E0B" : "#FDA4AF"}
                      strokeWidth="2"
                    />
                    <ellipse
                      cx="16"
                      cy="14"
                      rx="5"
                      ry="4"
                      fill="white"
                      opacity="0.6"
                    />
                  </g>

                  {/* 열렸을 때 안에서 나오는 미니 피규어 */}
                  {isOpened && (
                    <g className="animate-bounce">
                      <circle cx="24" cy="8" r="8" fill="#FCD34D" stroke="#F59E0B" strokeWidth="2" />
                      <text
                        x="24"
                        y="13"
                        textAnchor="middle"
                        fontSize="12"
                        fill="#92400E"
                      >
                        ★
                      </text>
                    </g>
                  )}

                  {/* 캡슐 하단 (몸통) */}
                  <path
                    d="M6 28 C6 38 10 48 24 48 C38 48 42 38 42 28 L6 28 Z"
                    fill={isSelected ? "#FBBF24" : "#FB7185"}
                    stroke={isSelected ? "#F59E0B" : "#E11D48"}
                    strokeWidth="2"
                  />

                  {/* 중간 라인 */}
                  <rect
                    x="6"
                    y="24"
                    width="36"
                    height="4"
                    fill={isSelected ? "#F59E0B" : "#E11D48"}
                  />

                  {/* 마커 꼬리 */}
                  <path
                    d="M18 48 L24 60 L30 48"
                    fill={isSelected ? "#FBBF24" : "#FB7185"}
                  />
                </svg>

                {/* 선택 시 가챠샵 이름 표시 */}
                {isSelected && (
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <span className="bg-foreground text-background text-xs px-2 py-1 rounded-full shadow-lg">
                      {shop.name.length > 10
                        ? shop.name.slice(0, 10) + "..."
                        : shop.name}
                    </span>
                  </div>
                )}
              </div>
            </button>
          );
        })}

      </div>

      {/* 선택된 가챠샵 팝업 카드 - 모바일에서는 하단 고정 시트로 표시 */}
      {selectedShopData && (
        <div className="fixed lg:absolute bottom-0 lg:bottom-4 left-0 lg:left-4 right-0 lg:right-auto lg:w-80 z-40 animate-in slide-in-from-bottom duration-300">
          <Card className="shadow-xl border-0 overflow-hidden rounded-t-2xl lg:rounded-2xl">
            <CardContent className="p-0">
              {/* 모바일 드래그 핸들 */}
              <div className="lg:hidden flex justify-center py-2 bg-white">
                <div className="w-10 h-1 bg-gray-300 rounded-full" />
              </div>

              {/* 모바일에서는 컴팩트하게, 데스크톱에서는 이미지 포함 */}
              <div className="hidden lg:block relative h-32 bg-muted">
                {selectedShopData.imageUrl ? (
                  <Image
                    src={selectedShopData.imageUrl}
                    alt={selectedShopData.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20" />
                )}
              </div>

              {/* 닫기 버튼 */}
              <button
                onClick={() => {
                  setSelectedShop(null);
                  setOpenedCapsule(null);
                }}
                className="absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors z-10"
              >
                ×
              </button>

              {/* 정보 */}
              <div className="p-4">
                <div className="flex items-start gap-3">
                  {/* 모바일용 작은 썸네일 */}
                  <div className="lg:hidden w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0 relative">
                    {selectedShopData.imageUrl ? (
                      <Image
                        src={selectedShopData.imageUrl}
                        alt={selectedShopData.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-foreground mb-1 line-clamp-1">
                      {selectedShopData.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                      {selectedShopData.address}
                    </p>
                    {selectedShopData.openingHours && (
                      <Badge
                        variant="secondary"
                        className="bg-secondary/20"
                      >
                        {selectedShopData.openingHours}
                      </Badge>
                    )}
                  </div>
                </div>

                <Link href={`/gachashops/${selectedShopData.id}`}>
                  <Button className="w-full mt-4 bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white rounded-full shadow-lg transition-all hover:scale-105 active:scale-95">
                    상세보기
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 사이드바 */}
      <div className="w-full lg:w-80 bg-white border-t lg:border-t-0 lg:border-l border-border overflow-y-auto max-h-[40vh] lg:max-h-screen">
        <div className="p-4 border-b border-border bg-background sticky top-0 z-10">
          <h2 className="text-lg font-bold text-foreground">가차샵</h2>
          <p className="text-sm text-muted-foreground">
            마커를 클릭해서 캡슐을 열어보세요! ({gachashops.length}개)
          </p>
        </div>

        <div className="divide-y divide-border">
          {gachashops.map((shop) => (
            <button
              key={shop.id}
              onClick={() => handleMarkerClick(shop.id)}
              className={`w-full text-left transition-colors ${
                selectedShop === shop.id
                  ? "bg-primary/10"
                  : "hover:bg-muted/50"
              }`}
            >
              <div className="p-4">
                <h3 className="font-medium text-foreground mb-1">
                  {shop.name}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {shop.address}
                </p>
                {shop.openingHours && (
                  <Badge
                    variant="outline"
                    className="mt-2 text-xs border-border"
                  >
                    {shop.openingHours}
                  </Badge>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
