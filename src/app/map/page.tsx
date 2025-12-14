import { getGachashops, getGachashopsByGachaId, getGachaById } from "@/lib/db";
import MapClient from "./MapClient";

export const revalidate = 60;

interface MapPageProps {
  searchParams: Promise<{ gacha?: string }>;
}

export default async function MapPage({ searchParams }: MapPageProps) {
  const { gacha: gachaId } = await searchParams;

  let gachashops;
  let gachaInfo = null;

  if (gachaId) {
    // 특정 가차를 판매하는 가차샵만 조회
    gachashops = await getGachashopsByGachaId(gachaId);
    gachaInfo = await getGachaById(gachaId);
  } else {
    // 전체 가차샵 조회
    gachashops = await getGachashops();
  }

  return (
    <MapClient
      gachashops={gachashops}
      filterGacha={gachaInfo ? {
        id: gachaInfo.id,
        name: gachaInfo.nameKo || gachaInfo.name,
        imageUrl: gachaInfo.imageUrl
      } : undefined}
    />
  );
}
