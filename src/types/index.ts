// 가챠샵 타입
export interface Gachashop {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  openingHours?: string;
  imageUrl?: string;
  // SNS 링크
  instagramUrl?: string;
  twitterUrl?: string;
  // 인기도 정보
  reviewCount?: number;
  rating?: number;
  naverPlaceId?: string;
  createdAt: string;
  updatedAt: string;
}

// 가챠 상품 타입
export interface Gacha {
  id: string;
  name: string;
  nameKo?: string;
  brand: string;
  price: number;
  imageUrl: string;
  releaseDate?: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

// 가챠샵-가챠 연결 타입
export interface GachashopGacha {
  id: string;
  gachashopId: string;
  gachaId: string;
  createdAt: string;
}

// 사용자 제보 타입
export interface GachaReport {
  id: string;
  gachashopId: string;
  gachaId: string;
  userId?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

// 즐겨찾기 타입
export interface Favorites {
  gachashops: string[];
  gachas: string[];
}

// 검색 결과 타입
export interface SearchResult {
  gachashops: Gachashop[];
  gachas: Gacha[];
}
