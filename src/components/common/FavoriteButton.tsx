"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { isFavorite, toggleFavorite } from "@/lib/favorites";

interface FavoriteButtonProps {
  type: "gachashop" | "gacha";
  id: string;
  className?: string;
}

export default function FavoriteButton({
  type,
  id,
  className = "",
}: FavoriteButtonProps) {
  const [isFav, setIsFav] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsFav(isFavorite(type, id));
  }, [type, id]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newState = toggleFavorite(type, id);
    setIsFav(newState);
  };

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={`text-muted-foreground ${className}`}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      className={`transition-all duration-200 bg-white/80 hover:bg-white shadow-sm hover:shadow-md hover:scale-110 ${className}`}
    >
      <svg
        className={`w-5 h-5 transition-colors ${
          isFav ? "text-amber-400" : "text-gray-400 hover:text-amber-300"
        }`}
        fill={isFav ? "currentColor" : "none"}
        viewBox="0 0 24 24"
        stroke={isFav ? "#F59E0B" : "currentColor"}
        strokeWidth={isFav ? 1 : 2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
        />
      </svg>
    </Button>
  );
}
