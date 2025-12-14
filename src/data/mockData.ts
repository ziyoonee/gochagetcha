import { Gacha, Gachashop, GachashopGacha } from "@/types";

// 목업 가차샵 데이터
export const mockGachashops: Gachashop[] = [
  {
    id: "shop-1",
    name: "가차파라다이스 홍대점",
    address: "서울특별시 마포구 홍익로 20",
    latitude: 37.5563,
    longitude: 126.9233,
    phone: "02-1234-5678",
    openingHours: "11:00 - 22:00",
    imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "shop-2",
    name: "캡슐토이월드 강남점",
    address: "서울특별시 강남구 강남대로 456",
    latitude: 37.4979,
    longitude: 127.0276,
    phone: "02-9876-5432",
    openingHours: "10:00 - 21:00",
    imageUrl: "https://images.unsplash.com/photo-1569863959165-56dae551d4fc?w=400",
    createdAt: "2024-01-02",
    updatedAt: "2024-01-02",
  },
  {
    id: "shop-3",
    name: "토이캡슐 신촌점",
    address: "서울특별시 서대문구 신촌로 123",
    latitude: 37.5596,
    longitude: 126.9426,
    phone: "02-5555-1234",
    openingHours: "12:00 - 21:00",
    imageUrl: "https://images.unsplash.com/photo-1558877385-81a1c7e67d72?w=400",
    createdAt: "2024-01-03",
    updatedAt: "2024-01-03",
  },
  {
    id: "shop-4",
    name: "가샤폰스테이션 건대점",
    address: "서울특별시 광진구 아차산로 200",
    latitude: 37.5404,
    longitude: 127.0696,
    phone: "02-7777-8888",
    openingHours: "11:00 - 22:00",
    imageUrl: "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400",
    createdAt: "2024-01-04",
    updatedAt: "2024-01-04",
  },
  {
    id: "shop-5",
    name: "캡슐랜드 잠실점",
    address: "서울특별시 송파구 올림픽로 300",
    latitude: 37.5133,
    longitude: 127.1001,
    phone: "02-3333-4444",
    openingHours: "10:00 - 22:00",
    imageUrl: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400",
    createdAt: "2024-01-05",
    updatedAt: "2024-01-05",
  },
  {
    id: "shop-6",
    name: "가차왕국 이태원점",
    address: "서울특별시 용산구 이태원로 150",
    latitude: 37.5345,
    longitude: 126.9940,
    phone: "02-6666-7777",
    openingHours: "13:00 - 23:00",
    imageUrl: "https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=400",
    createdAt: "2024-01-06",
    updatedAt: "2024-01-06",
  },
];

// 목업 가차 상품 데이터
export const mockGachas: Gacha[] = [
  {
    id: "gacha-1",
    name: "포켓몬스터 잠만보 컬렉션",
    brand: "반다이",
    price: 500,
    imageUrl: "https://images.unsplash.com/photo-1609372332255-611485350f25?w=400",
    releaseDate: "2024-12-01",
    category: "캐릭터",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "gacha-2",
    name: "산리오 시나모롤 미니피규어",
    brand: "반다이",
    price: 500,
    imageUrl: "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400",
    releaseDate: "2024-11-15",
    category: "캐릭터",
    createdAt: "2024-01-02",
    updatedAt: "2024-01-02",
  },
  {
    id: "gacha-3",
    name: "귀여운 고양이 피규어",
    brand: "타카라토미",
    price: 400,
    imageUrl: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=400",
    releaseDate: "2024-10-20",
    category: "동물",
    createdAt: "2024-01-03",
    updatedAt: "2024-01-03",
  },
  {
    id: "gacha-4",
    name: "스파이패밀리 아크릴스탠드",
    brand: "반다이",
    price: 600,
    imageUrl: "https://images.unsplash.com/photo-1608889175123-8ee362201f81?w=400",
    releaseDate: "2024-12-10",
    category: "애니메이션",
    createdAt: "2024-01-04",
    updatedAt: "2024-01-04",
  },
  {
    id: "gacha-5",
    name: "미니어처 음식 컬렉션",
    brand: "리멘트",
    price: 700,
    imageUrl: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400",
    releaseDate: "2024-09-01",
    category: "미니어처",
    createdAt: "2024-01-05",
    updatedAt: "2024-01-05",
  },
  {
    id: "gacha-6",
    name: "주술회전 치비피규어",
    brand: "반다이",
    price: 500,
    imageUrl: "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=400",
    releaseDate: "2024-11-25",
    category: "애니메이션",
    createdAt: "2024-01-06",
    updatedAt: "2024-01-06",
  },
  {
    id: "gacha-7",
    name: "레트로 게임기 미니어처",
    brand: "타카라토미",
    price: 800,
    imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400",
    releaseDate: "2024-08-15",
    category: "미니어처",
    createdAt: "2024-01-07",
    updatedAt: "2024-01-07",
  },
  {
    id: "gacha-8",
    name: "귀여운 공룡 시리즈",
    brand: "반다이",
    price: 400,
    imageUrl: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400",
    releaseDate: "2024-07-01",
    category: "동물",
    createdAt: "2024-01-08",
    updatedAt: "2024-01-08",
  },
];

// 가차샵-가차 연결 데이터
export const mockGachashopGachas: GachashopGacha[] = [
  { id: "sg-1", gachashopId: "shop-1", gachaId: "gacha-1", createdAt: "2024-01-01" },
  { id: "sg-2", gachashopId: "shop-1", gachaId: "gacha-2", createdAt: "2024-01-01" },
  { id: "sg-3", gachashopId: "shop-1", gachaId: "gacha-3", createdAt: "2024-01-01" },
  { id: "sg-4", gachashopId: "shop-1", gachaId: "gacha-4", createdAt: "2024-01-01" },
  { id: "sg-5", gachashopId: "shop-2", gachaId: "gacha-1", createdAt: "2024-01-01" },
  { id: "sg-6", gachashopId: "shop-2", gachaId: "gacha-5", createdAt: "2024-01-01" },
  { id: "sg-7", gachashopId: "shop-2", gachaId: "gacha-6", createdAt: "2024-01-01" },
  { id: "sg-8", gachashopId: "shop-3", gachaId: "gacha-2", createdAt: "2024-01-01" },
  { id: "sg-9", gachashopId: "shop-3", gachaId: "gacha-3", createdAt: "2024-01-01" },
  { id: "sg-10", gachashopId: "shop-3", gachaId: "gacha-7", createdAt: "2024-01-01" },
  { id: "sg-11", gachashopId: "shop-4", gachaId: "gacha-4", createdAt: "2024-01-01" },
  { id: "sg-12", gachashopId: "shop-4", gachaId: "gacha-5", createdAt: "2024-01-01" },
  { id: "sg-13", gachashopId: "shop-4", gachaId: "gacha-8", createdAt: "2024-01-01" },
  { id: "sg-14", gachashopId: "shop-5", gachaId: "gacha-1", createdAt: "2024-01-01" },
  { id: "sg-15", gachashopId: "shop-5", gachaId: "gacha-6", createdAt: "2024-01-01" },
  { id: "sg-16", gachashopId: "shop-5", gachaId: "gacha-7", createdAt: "2024-01-01" },
  { id: "sg-17", gachashopId: "shop-6", gachaId: "gacha-2", createdAt: "2024-01-01" },
  { id: "sg-18", gachashopId: "shop-6", gachaId: "gacha-8", createdAt: "2024-01-01" },
];

// 헬퍼 함수들
export function getGachashopById(id: string): Gachashop | undefined {
  return mockGachashops.find((shop) => shop.id === id);
}

export function getGachaById(id: string): Gacha | undefined {
  return mockGachas.find((gacha) => gacha.id === id);
}

export function getGachasByGachashopId(gachashopId: string): Gacha[] {
  const gachaIds = mockGachashopGachas
    .filter((sg) => sg.gachashopId === gachashopId)
    .map((sg) => sg.gachaId);
  return mockGachas.filter((gacha) => gachaIds.includes(gacha.id));
}

export function getGachashopsByGachaId(gachaId: string): Gachashop[] {
  const shopIds = mockGachashopGachas
    .filter((sg) => sg.gachaId === gachaId)
    .map((sg) => sg.gachashopId);
  return mockGachashops.filter((shop) => shopIds.includes(shop.id));
}

export function searchAll(query: string): { gachashops: Gachashop[]; gachas: Gacha[] } {
  const lowerQuery = query.toLowerCase();
  return {
    gachashops: mockGachashops.filter(
      (shop) =>
        shop.name.toLowerCase().includes(lowerQuery) ||
        shop.address.toLowerCase().includes(lowerQuery)
    ),
    gachas: mockGachas.filter(
      (gacha) =>
        gacha.name.toLowerCase().includes(lowerQuery) ||
        gacha.brand.toLowerCase().includes(lowerQuery) ||
        gacha.category.toLowerCase().includes(lowerQuery)
    ),
  };
}

// 카테고리 목록
export const categories = ["캐릭터", "동물", "애니메이션", "미니어처"];

// 브랜드 목록
export const brands = ["반다이", "타카라토미", "리멘트"];
