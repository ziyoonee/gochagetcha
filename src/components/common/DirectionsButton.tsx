"use client";

import { openNaverDirections } from "@/lib/naverMap";

interface DirectionsButtonProps {
  latitude: number;
  longitude: number;
  name: string;
  className?: string;
}

export default function DirectionsButton({ latitude, longitude, name, className = "" }: DirectionsButtonProps) {
  const handleClick = () => {
    openNaverDirections(latitude, longitude, name);
  };

  return (
    <button
      onClick={handleClick}
      className={`bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-full px-8 py-3 font-medium shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95 flex items-center justify-center gap-2 ${className}`}
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
          d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      길찾기
    </button>
  );
}
