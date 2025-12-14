"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { loadKakaoMapSDK, createCapsuleMarkerElement, updateCapsuleMarkerElement } from "@/lib/kakaoMap";
import type { Gachashop } from "@/types";

// 바텀시트 높이 상수 (vh 기준)
const SHEET_MIN_HEIGHT = 15; // 최소 높이 (%)
const SHEET_MID_HEIGHT = 40; // 중간 높이 (%)
const SHEET_MAX_HEIGHT = 85; // 최대 높이 (%)

interface MapClientProps {
  gachashops: Gachashop[];
  filterGacha?: { id: string; name: string; imageUrl?: string };
}

interface OverlayData {
  overlay: kakao.maps.CustomOverlay;
  element: HTMLDivElement;
}

// 주소에서 지역 추출
function extractRegion(address: string): string {
  const firstWord = address.split(" ")[0];
  // 특별자치도 등 긴 이름 정규화
  if (firstWord.includes("특별자치")) {
    return firstWord.replace("특별자치도", "").replace("특별자치시", "");
  }
  return firstWord;
}

// 지역 정렬 순서
const REGION_ORDER = ["서울", "경기", "인천", "부산", "대구", "대전", "광주", "울산", "세종", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"];

export default function MapClient({ gachashops, filterGacha }: MapClientProps) {
  const [selectedShop, setSelectedShop] = useState<string | null>(null);
  const [openedCapsule, setOpenedCapsule] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  // 바텀시트 상태
  const [sheetHeight, setSheetHeight] = useState(SHEET_MID_HEIGHT);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<kakao.maps.Map | null>(null);
  const overlaysRef = useRef<Map<string, OverlayData>>(new Map());
  const sheetRef = useRef<HTMLDivElement>(null);

  // 상태를 ref로도 유지하여 이벤트 핸들러에서 접근 가능하게
  const selectedShopRef = useRef<string | null>(null);
  const openedCapsuleRef = useRef<string | null>(null);

  // 바텀시트 드래그 핸들러
  const handleDragStart = useCallback((clientY: number) => {
    setIsDragging(true);
    dragStartY.current = clientY;
    dragStartHeight.current = sheetHeight;
  }, [sheetHeight]);

  const handleDragMove = useCallback((clientY: number) => {
    if (!isDragging) return;

    const deltaY = dragStartY.current - clientY;
    const deltaPercent = (deltaY / window.innerHeight) * 100;
    const newHeight = Math.min(SHEET_MAX_HEIGHT, Math.max(SHEET_MIN_HEIGHT, dragStartHeight.current + deltaPercent));
    setSheetHeight(newHeight);
  }, [isDragging]);

  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    // 스냅 포인트로 이동
    if (sheetHeight < (SHEET_MIN_HEIGHT + SHEET_MID_HEIGHT) / 2) {
      setSheetHeight(SHEET_MIN_HEIGHT);
    } else if (sheetHeight < (SHEET_MID_HEIGHT + SHEET_MAX_HEIGHT) / 2) {
      setSheetHeight(SHEET_MID_HEIGHT);
    } else {
      setSheetHeight(SHEET_MAX_HEIGHT);
    }
  }, [isDragging, sheetHeight]);

  // 터치 이벤트 핸들러
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientY);
  }, [handleDragStart]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientY);
  }, [handleDragMove]);

  const handleTouchEnd = useCallback(() => {
    handleDragEnd();
  }, [handleDragEnd]);

  // 마우스 이벤트 (데스크탑 테스트용)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      handleDragMove(e.clientY);
    };
    const handleMouseUp = () => {
      handleDragEnd();
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  // 지역 목록 추출
  const regions = useMemo(() => {
    const regionSet = new Set<string>();
    gachashops.forEach((shop) => {
      if (shop.address) {
        regionSet.add(extractRegion(shop.address));
      }
    });
    return Array.from(regionSet).sort((a, b) => {
      const aIndex = REGION_ORDER.indexOf(a);
      const bIndex = REGION_ORDER.indexOf(b);
      if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
  }, [gachashops]);

  // 지역으로 필터링된 가챠샵
  const filteredShops = useMemo(() => {
    if (!selectedRegion) return gachashops;
    return gachashops.filter((shop) => extractRegion(shop.address) === selectedRegion);
  }, [gachashops, selectedRegion]);

  // 지역별 가챠샵 수
  const regionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    gachashops.forEach((shop) => {
      const region = extractRegion(shop.address);
      counts[region] = (counts[region] || 0) + 1;
    });
    return counts;
  }, [gachashops]);

  // 마커 클릭 핸들러
  const handleMarkerClick = (shopId: string) => {
    const currentOpened = openedCapsuleRef.current;

    if (currentOpened === shopId) {
      // 같은 마커 다시 클릭 - 닫기
      setOpenedCapsule(null);
      setSelectedShop(null);
      openedCapsuleRef.current = null;
      selectedShopRef.current = null;

      // 축소 (원래 레벨로)
      if (mapRef.current) {
        mapRef.current.setLevel(8);
      }
    } else {
      // 다른 마커 클릭 - 열기
      setOpenedCapsule(shopId);
      setSelectedShop(shopId);
      openedCapsuleRef.current = shopId;
      selectedShopRef.current = shopId;

      // 선택된 가챠샵으로 지도 이동 및 확대
      const shop = gachashops.find((s) => s.id === shopId);
      if (shop && mapRef.current && shop.latitude && shop.longitude) {
        const position = new window.kakao.maps.LatLng(shop.latitude, shop.longitude);
        mapRef.current.setLevel(3); // 확대
        mapRef.current.panTo(position);
      }
    }

    // 모든 오버레이 업데이트
    updateAllOverlays(shopId === currentOpened ? null : shopId);
  };

  // 모든 오버레이 시각적 상태 업데이트
  const updateAllOverlays = (newSelectedId: string | null) => {
    overlaysRef.current.forEach((data, shopId) => {
      const isSelected = shopId === newSelectedId;
      const isOpened = shopId === newSelectedId;
      updateCapsuleMarkerElement(data.element, isSelected, isOpened);
    });
  };

  // 지역 선택 시 마커 표시/숨김 및 지도 이동
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    const validShops = gachashops.filter((shop) => shop.latitude && shop.longitude);

    // 마커 표시/숨김
    overlaysRef.current.forEach((data, shopId) => {
      const shop = gachashops.find((s) => s.id === shopId);
      if (!shop) return;

      const isInRegion = !selectedRegion || extractRegion(shop.address) === selectedRegion;
      data.overlay.setMap(isInRegion ? mapRef.current : null);
    });

    // 필터링된 가챠샵으로 bounds 조정
    const shopsToShow = selectedRegion
      ? validShops.filter((shop) => extractRegion(shop.address) === selectedRegion)
      : validShops;

    if (shopsToShow.length > 0 && mapRef.current) {
      if (shopsToShow.length === 1) {
        const shop = shopsToShow[0];
        const position = new window.kakao.maps.LatLng(shop.latitude, shop.longitude);
        mapRef.current.setLevel(5);
        mapRef.current.panTo(position);
      } else {
        const bounds = new window.kakao.maps.LatLngBounds();
        shopsToShow.forEach((shop) => {
          bounds.extend(new window.kakao.maps.LatLng(shop.latitude, shop.longitude));
        });
        mapRef.current.setBounds(bounds, 50, 50, 50, 50);
      }
    }

    // 선택 초기화
    setSelectedShop(null);
    setOpenedCapsule(null);
    selectedShopRef.current = null;
    openedCapsuleRef.current = null;
    updateAllOverlays(null);
  }, [selectedRegion, mapLoaded, gachashops]);

  // 지도 초기화
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // 이미 초기화되었으면 스킵
    if (mapRef.current) return;

    let isMounted = true;

    const initMap = async () => {
      try {
        await loadKakaoMapSDK();

        if (!isMounted || !mapContainerRef.current) return;

        // 다시 한번 체크 (비동기 로딩 중 중복 방지)
        if (mapRef.current) return;

        // 유효한 좌표가 있는 가챠샵 필터링
        const validShops = gachashops.filter(
          (shop) => shop.latitude && shop.longitude
        );

        // 기본 중심 좌표 (서울 시청)
        let centerLat = 37.5665;
        let centerLng = 126.978;

        if (validShops.length > 0) {
          centerLat = validShops[0].latitude;
          centerLng = validShops[0].longitude;
        }

        const options = {
          center: new window.kakao.maps.LatLng(centerLat, centerLng),
          level: 8,
        };

        const map = new window.kakao.maps.Map(mapContainerRef.current, options);
        mapRef.current = map;

        // 모든 마커가 보이도록 bounds 설정
        if (validShops.length > 1) {
          const bounds = new window.kakao.maps.LatLngBounds();
          validShops.forEach((shop) => {
            bounds.extend(new window.kakao.maps.LatLng(shop.latitude, shop.longitude));
          });
          map.setBounds(bounds, 50, 50, 50, 50);
        }

        // 커스텀 오버레이 생성
        validShops.forEach((shop) => {
          const position = new window.kakao.maps.LatLng(shop.latitude, shop.longitude);

          // DOM 요소 생성 (클릭 핸들러 포함)
          const element = createCapsuleMarkerElement(
            shop.id,
            false,
            false,
            handleMarkerClick
          );

          const overlay = new window.kakao.maps.CustomOverlay({
            content: element,
            position: position,
            map: map,
            yAnchor: 1,
          });

          overlaysRef.current.set(shop.id, { overlay, element });
        });

        setMapLoaded(true);
      } catch (error) {
        console.error("지도 초기화 오류:", error);
        if (isMounted) {
          setMapError("지도를 불러오는데 실패했습니다.");
        }
      }
    };

    initMap();

    return () => {
      isMounted = false;
      // cleanup 시에만 지도 정리
      if (mapRef.current) {
        overlaysRef.current.forEach((data) => data.overlay.setMap(null));
        overlaysRef.current.clear();
        mapRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gachashops]);

  // 사이드바에서 클릭 시 지도 이동 및 마커 선택
  const handleSidebarClick = (shopId: string) => {
    handleMarkerClick(shopId);
  };

  const selectedShopData = selectedShop
    ? gachashops.find((s) => s.id === selectedShop)
    : null;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* 지도 영역 */}
      <div className="flex-1 relative min-h-[500px] lg:min-h-screen">
        {/* 카카오맵 컨테이너 */}
        <div
          ref={mapContainerRef}
          className="absolute inset-0"
          style={{ width: "100%", height: "100%" }}
        />

        {/* 로딩 상태 */}
        {!mapLoaded && !mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-sky-50 to-rose-50 z-10">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">지도를 불러오는 중...</p>
            </div>
          </div>
        )}

        {/* 에러 상태 */}
        {mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-sky-50 to-rose-50 z-10">
            <div className="text-center">
              <svg
                className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <p className="text-muted-foreground">{mapError}</p>
            </div>
          </div>
        )}
      </div>

      {/* 선택된 가챠샵 모달 */}
      {selectedShopData && (
        <>
          {/* 배경 오버레이 */}
          <div
            className="fixed inset-0 bg-black/40 z-40 animate-in fade-in duration-200"
            onClick={() => {
              setSelectedShop(null);
              setOpenedCapsule(null);
              selectedShopRef.current = null;
              openedCapsuleRef.current = null;
              updateAllOverlays(null);
              if (mapRef.current) {
                mapRef.current.setLevel(8);
              }
            }}
          />
          {/* 중앙 모달 */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            <Card className="shadow-2xl border-0 overflow-hidden rounded-2xl w-full max-w-sm pointer-events-auto animate-in zoom-in-95 fade-in duration-200">
              <CardContent className="p-0">
                {/* 이미지 */}
                <div className="relative h-40 bg-muted">
                  {selectedShopData.imageUrl ? (
                    <Image
                      src={selectedShopData.imageUrl}
                      alt={selectedShopData.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-rose-100 to-rose-200" />
                  )}
                  {/* 닫기 버튼 */}
                  <button
                    onClick={() => {
                      setSelectedShop(null);
                      setOpenedCapsule(null);
                      selectedShopRef.current = null;
                      openedCapsuleRef.current = null;
                      updateAllOverlays(null);
                      if (mapRef.current) {
                        mapRef.current.setLevel(8);
                      }
                    }}
                    className="absolute top-3 right-3 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* 정보 */}
                <div className="p-5">
                  <h3 className="font-bold text-xl text-foreground mb-2">
                    {selectedShopData.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {selectedShopData.address}
                  </p>
                  {selectedShopData.openingHours && (
                    <Badge
                      variant="secondary"
                      className="bg-rose-50 text-rose-600 mb-4"
                    >
                      {selectedShopData.openingHours}
                    </Badge>
                  )}

                  <Link href={`/gachashops/${selectedShopData.id}`}>
                    <Button className="w-full bg-rose-300 hover:bg-rose-400 text-white rounded-full shadow-sm transition-all hover:scale-105 active:scale-95">
                      상세보기
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* 사이드바 (데스크탑) / 바텀시트 (모바일) */}
      <div
        ref={sheetRef}
        className={`
          fixed lg:relative bottom-0 left-0 right-0
          lg:w-80 lg:h-screen bg-white border-t lg:border-t-0 lg:border-l border-border
          rounded-t-3xl lg:rounded-none shadow-[0_-4px_20px_rgba(0,0,0,0.1)] lg:shadow-none
          z-30 lg:z-auto flex flex-col
          ${isDragging ? "" : "transition-all duration-300 ease-out"}
        `}
        style={{
          height: `${sheetHeight}vh`,
        }}
      >
        {/* 드래그 가능한 헤더 영역 (모바일) */}
        <div
          className="shrink-0 lg:cursor-default"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={(e) => handleDragStart(e.clientY)}
          style={{ touchAction: 'none' }}
        >
          {/* 드래그 핸들 바 */}
          <div className="lg:hidden flex justify-center py-3 cursor-grab active:cursor-grabbing">
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>

          {/* 헤더 콘텐츠 */}
          <div className="p-4 border-b border-border bg-background">
          {/* 필터링된 가차 정보 */}
          {filterGacha && (
            <div className="mb-3 p-3 bg-rose-50 rounded-xl border border-rose-100">
              <div className="flex items-start gap-3">
                {/* 가차 이미지 */}
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-white shrink-0 relative">
                  {filterGacha.imageUrl ? (
                    <Image
                      src={filterGacha.imageUrl}
                      alt={filterGacha.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-100 to-rose-200">
                      <svg className="w-6 h-6 text-rose-300" fill="currentColor" viewBox="0 0 24 24">
                        <ellipse cx="12" cy="12" rx="10" ry="11" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-medium text-rose-600 line-clamp-2">{filterGacha.name}</span>
                    <Link
                      href="/map"
                      className="text-xs text-rose-400 hover:text-rose-500 whitespace-nowrap shrink-0"
                    >
                      전체보기
                    </Link>
                  </div>
                  <p className="text-xs text-rose-400 mt-1">이 가차를 판매하는 가차샵</p>
                </div>
              </div>
            </div>
          )}

          <h2 className="text-lg font-bold text-foreground">가차샵</h2>
          <p className="text-sm text-muted-foreground mb-3">
            {selectedRegion ? `${selectedRegion} 지역` : "전체"} ({filteredShops.length}개)
          </p>

          {/* 지역 필터 - 셀렉트 박스 */}
          <select
            value={selectedRegion || ""}
            onChange={(e) => setSelectedRegion(e.target.value || null)}
            className="w-full px-4 py-2.5 text-sm font-medium rounded-xl border border-rose-200 bg-white text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns%3d%22http%3a%2f%2fwww.w3.org%2f2000%2fsvg%22%20viewBox%3d%220%200%2024%2024%22%20fill%3d%22none%22%20stroke%3d%22%23f9a8d4%22%20stroke-width%3d%222%22%20stroke-linecap%3d%22round%22%20stroke-linejoin%3d%22round%22%3e%3cpath%20d%3d%22M6%209l6%206%206-6%22%2f%3e%3c%2fsvg%3e')] bg-[length:20px] bg-[right_12px_center] bg-no-repeat"
          >
            <option value="">전체 지역 ({gachashops.length})</option>
            {regions.map((region) => (
              <option key={region} value={region}>
                {region} ({regionCounts[region] || 0})
              </option>
            ))}
          </select>
          </div>
        </div>

        {/* 스크롤 가능한 목록 영역 */}
        <div className="overflow-y-auto flex-1">
        {filteredShops.length > 0 ? (
          <div className="divide-y divide-border">
            {filteredShops.map((shop) => (
              <button
                key={shop.id}
                onClick={() => handleSidebarClick(shop.id)}
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
        ) : (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-rose-50 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-rose-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-muted-foreground text-sm">
              {filterGacha ? "이 가차를 판매하는 가차샵이 없습니다." : "가차샵이 없습니다."}
            </p>
            {filterGacha && (
              <Link
                href="/map"
                className="inline-block mt-3 text-sm text-rose-500 hover:text-rose-600 underline"
              >
                전체 가차샵 보기
              </Link>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
