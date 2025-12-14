"use client";

import { useState, useEffect } from "react";

export default function HeroGachaMachine() {
  const [rotation, setRotation] = useState(0);
  const [showCapsule, setShowCapsule] = useState(false);
  const [capsuleColor, setCapsuleColor] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const fullText = "Gacha Getcha♥";

  // 캡슐 색상 (상단 밝은색, 하단 진한색)
  const capsuleColors = [
    { top: "#FFF1F2", topStroke: "#FECDD3", bottom: "#FDA4AF", bottomStroke: "#FB7185", line: "#FB7185" }, // 핑크
    { top: "#E0F2FE", topStroke: "#BAE6FD", bottom: "#7DD3FC", bottomStroke: "#38BDF8", line: "#38BDF8" }, // 하늘
    { top: "#FEF9C3", topStroke: "#FDE68A", bottom: "#FCD34D", bottomStroke: "#FBBF24", line: "#FBBF24" }, // 노랑
    { top: "#ECFDF5", topStroke: "#A7F3D0", bottom: "#6EE7B7", bottomStroke: "#34D399", line: "#34D399" }, // 민트
    { top: "#EDE9FE", topStroke: "#DDD6FE", bottom: "#C4B5FD", bottomStroke: "#A78BFA", line: "#A78BFA" }, // 보라
    { top: "#FFEDD5", topStroke: "#FED7AA", bottom: "#FDBA74", bottomStroke: "#FB923C", line: "#FB923C" }, // 오렌지
  ];

  // 자동 재생
  useEffect(() => {
    const playAnimation = () => {
      setRotation((prev) => prev + 360);
      setCapsuleColor(Math.floor(Math.random() * capsuleColors.length));

      setTimeout(() => {
        setShowCapsule(true);
      }, 500);

      setTimeout(() => {
        setShowCapsule(false);
      }, 2500);
    };

    const initialDelay = setTimeout(playAnimation, 1000);
    const interval = setInterval(playAnimation, 3500);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, []);

  // 타이핑 효과
  useEffect(() => {
    let index = 0;
    const typeText = () => {
      if (index <= fullText.length) {
        setDisplayText(fullText.slice(0, index));
        index++;
      } else {
        // 잠시 후 다시 시작
        setTimeout(() => {
          index = 0;
          setDisplayText("");
        }, 2000);
      }
    };

    const typingInterval = setInterval(typeText, 200);
    return () => clearInterval(typingInterval);
  }, []);

  return (
    <div className="relative flex flex-col items-center">
      {/* 가차 기계 */}
      <svg viewBox="0 0 180 280" className="w-48 h-72 md:w-56 md:h-80 drop-shadow-2xl">
        {/* 기계 본체 - 흰색 */}
        <rect x="10" y="10" width="160" height="260" rx="8" fill="#F9FAFB" stroke="#E5E7EB" strokeWidth="2" />

        {/* 상단 */}
        <rect x="10" y="10" width="160" height="25" rx="8" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="2" />
        <rect x="10" y="25" width="160" height="10" fill="#FFFFFF" />

        {/* 캡슐 보관소 - 유리창 효과 */}
        <defs>
          {/* 기본 그라데이션 - 부드러운 파스텔 */}
          <linearGradient id="machineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF0F3" />
            <stop offset="30%" stopColor="#FCE7F3" />
            <stop offset="70%" stopColor="#F5D0FE" />
            <stop offset="100%" stopColor="#EDE9FE" />
          </linearGradient>
          {/* 유리 반사 그라데이션 */}
          <linearGradient id="glassShine" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="white" stopOpacity="0.6" />
            <stop offset="30%" stopColor="white" stopOpacity="0.2" />
            <stop offset="50%" stopColor="white" stopOpacity="0" />
            <stop offset="70%" stopColor="white" stopOpacity="0.1" />
            <stop offset="100%" stopColor="white" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        {/* 베이스 배경 */}
        <rect x="15" y="40" width="150" height="100" rx="6" fill="url(#machineGradient)" stroke="#F9A8D4" strokeWidth="2" />
        {/* 유리 반사 오버레이 */}
        <rect x="15" y="40" width="150" height="100" rx="6" fill="url(#glassShine)" />
      
        <path d="M20 45 L50 45 L20 75 Z" fill="white" fillOpacity="0.15" />
        <path d="M155 130 L160 115 L160 130 Z" fill="white" fillOpacity="0.1" />

        {/* 타이핑 문구 */}
        <text x="90" y="92" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#F472B6" style={{ filter: "drop-shadow(0 1px 3px rgba(255,255,255,0.9))" }}>
          {displayText}
          <tspan fill="#FDA4AF" style={{ animation: "blink 0.8s infinite" }}>|</tspan>
        </text>

        {/* 다이얼 영역 - 10% 축소 */}
        <g transform="translate(90, 195) scale(0.9) translate(-90, -195)">
          {/* 다이얼 외곽 - 파스텔 핑크 */}
          <circle cx="90" cy="195" r="34" fill="#FBCFE8" />

          {/* 다이얼 파스텔 테두리 */}
          <circle cx="90" cy="195" r="30" fill="#F9A8D4" />

          {/* 파스텔 노란색 얇은 안쪽 링 */}
          <circle cx="90" cy="195" r="24" fill="none" stroke="#FDE68A" strokeWidth="2" />

          {/* 다이얼 안쪽 크림색 영역 */}
          <circle cx="90" cy="195" r="22" fill="#FFF7ED" />

          {/* 회전하는 부분 */}
          <g
            style={{
              transform: `rotate(${rotation}deg)`,
              transformOrigin: "90px 195px",
              transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
            }}
          >
           
            {/* 튀어나온 손잡이 - 크림/베이지 톤 */}
            {/* 손잡이 그림자 */}
            <ellipse cx="90" cy="200" rx="18" ry="4" fill="#D4A373" fillOpacity="0.3" />

            {/* 가로 막대 손잡이 */}
            {/* 막대 아래쪽 (입체감) */}
            <rect x="68" y="191" width="44" height="12" rx="6" fill="#E9D5C9" />
            {/* 막대 윗면 */}
            <rect x="68" y="189" width="44" height="10" rx="5" fill="#F5EBE0" />
            {/* 막대 상단 하이라이트 */}
            <rect x="70" y="190" width="40" height="4" rx="2" fill="#FAF6F3" />
            {/* 막대 중앙 라인 */}
            <line x1="75" y1="194" x2="105" y2="194" stroke="#D5C4A1" strokeWidth="0.5" />
          </g>
        </g>

        {/* 캡슐 출구 */}
        <rect x="55" y="235" width="70" height="30" rx="4" fill="#E5E7EB" stroke="#D1D5DB" strokeWidth="1" />
        <rect x="65" y="245" width="50" height="15" rx="3" fill="#1F2937" fillOpacity="0.8" />
      </svg>

      {/* 나온 캡슐 (2단 캡슐) */}
      {showCapsule && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-10 z-10">
          <div
            style={{
              animation: "dropBounce 0.6s ease-out"
            }}
          >
            <svg viewBox="0 0 30 40" className="w-10 h-14 drop-shadow-xl">
              {/* 캡슐 상단 */}
              <path
                d="M15 3 C6 3 3 10 3 16 L27 16 C27 10 24 3 15 3 Z"
                fill={capsuleColors[capsuleColor].top}
                stroke={capsuleColors[capsuleColor].topStroke}
                strokeWidth="2"
              />
              {/* 캡슐 하단 */}
              <path
                d="M3 20 C3 26 6 34 15 34 C24 34 27 26 27 20 L3 20 Z"
                fill={capsuleColors[capsuleColor].bottom}
                stroke={capsuleColors[capsuleColor].bottomStroke}
                strokeWidth="2"
              />
              {/* 중간 라인 */}
              <rect x="3" y="16" width="24" height="4" fill={capsuleColors[capsuleColor].line} />
              {/* 하이라이트 */}
              <ellipse cx="10" cy="10" rx="4" ry="3" fill="white" fillOpacity="0.5" />
            </svg>
          </div>

          {/* 파티클 효과 */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-amber-400 text-xl animate-ping">✦</div>
          <div className="absolute top-2 -left-4 text-rose-400 text-sm animate-ping" style={{ animationDelay: "0.1s" }}>✦</div>
          <div className="absolute top-2 -right-4 text-sky-400 text-sm animate-ping" style={{ animationDelay: "0.2s" }}>✦</div>
        </div>
      )}

      {/* 반짝이 효과 */}
      <div className="absolute -top-4 -right-4 text-rose-300 text-lg animate-pulse">✦</div>
      <div className="absolute top-20 -right-6 text-sky-300 text-sm animate-pulse" style={{ animationDelay: "0.3s" }}>✦</div>
      <div className="absolute top-16 -left-6 text-amber-300 text-sm animate-pulse" style={{ animationDelay: "0.6s" }}>✦</div>

      <style jsx>{`
        @keyframes dropBounce {
          0% {
            transform: translateY(-30px);
            opacity: 0;
          }
          50% {
            transform: translateY(5px);
            opacity: 1;
          }
          70% {
            transform: translateY(-3px);
          }
          100% {
            transform: translateY(0);
          }
        }
        @keyframes blink {
          0%, 50% {
            opacity: 1;
          }
          51%, 100% {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
