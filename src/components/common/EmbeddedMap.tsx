"use client";

import { useEffect, useRef, useState } from "react";
import { loadKakaoMapSDK, createCapsuleMarkerElement } from "@/lib/kakaoMap";

interface EmbeddedMapProps {
  latitude: number;
  longitude: number;
}

export default function EmbeddedMap({ latitude, longitude }: EmbeddedMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<kakao.maps.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    let isMounted = true;

    const initMap = async () => {
      try {
        await loadKakaoMapSDK();

        if (!isMounted || !mapContainerRef.current) return;
        if (mapRef.current) return;

        const options = {
          center: new window.kakao.maps.LatLng(latitude, longitude),
          level: 3,
        };

        const map = new window.kakao.maps.Map(mapContainerRef.current, options);
        mapRef.current = map;

        // 마커 생성
        const position = new window.kakao.maps.LatLng(latitude, longitude);
        const element = createCapsuleMarkerElement("embedded", true, true, () => {});

        new window.kakao.maps.CustomOverlay({
          content: element,
          position: position,
          map: map,
          yAnchor: 1,
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
      if (mapRef.current) {
        mapRef.current = null;
      }
      // 지도 컨테이너 내부 DOM 정리
      if (mapContainerRef.current) {
        mapContainerRef.current.innerHTML = '';
      }
    };
  }, [latitude, longitude]);

  return (
    <div className="rounded-xl overflow-hidden border border-rose-100">
      {/* 지도 영역 */}
      <div className="relative h-48 md:h-64 bg-gray-100">
        <div
          ref={mapContainerRef}
          className="absolute inset-0 bg-gray-100"
          style={{ width: "100%", height: "100%" }}
        />

        {/* 로딩 상태 */}
        {!mapLoaded && !mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-sky-50 to-rose-50 z-10">
            <div className="text-center">
              <div className="w-8 h-8 border-3 border-rose-300 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">지도 로딩 중...</p>
            </div>
          </div>
        )}

        {/* 에러 상태 */}
        {mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-sky-50 to-rose-50 z-10">
            <p className="text-sm text-muted-foreground">{mapError}</p>
          </div>
        )}
      </div>
    </div>
  );
}
