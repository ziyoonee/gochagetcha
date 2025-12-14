import { Favorites } from "@/types";

const FAVORITES_KEY = "gacha-favorites";

// 기본 즐겨찾기 값
const defaultFavorites: Favorites = {
  gachashops: [],
  gachas: [],
};

// 즐겨찾기 조회
export function getFavorites(): Favorites {
  if (typeof window === "undefined") return defaultFavorites;

  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (!stored) return defaultFavorites;
    return JSON.parse(stored) as Favorites;
  } catch {
    return defaultFavorites;
  }
}

// 즐겨찾기 저장
function saveFavorites(favorites: Favorites): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

// 즐겨찾기 토글
export function toggleFavorite(type: "gachashop" | "gacha", id: string): boolean {
  const favorites = getFavorites();
  const key = type === "gachashop" ? "gachashops" : "gachas";

  const index = favorites[key].indexOf(id);
  if (index === -1) {
    favorites[key].push(id);
  } else {
    favorites[key].splice(index, 1);
  }

  saveFavorites(favorites);
  return index === -1; // true면 추가됨, false면 제거됨
}

// 즐겨찾기 여부 확인
export function isFavorite(type: "gachashop" | "gacha", id: string): boolean {
  const favorites = getFavorites();
  const key = type === "gachashop" ? "gachashops" : "gachas";
  return favorites[key].includes(id);
}
