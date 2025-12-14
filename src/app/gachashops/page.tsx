import GachashopCard from "@/components/cards/GachashopCard";
import { getGachashops } from "@/lib/db";

export const revalidate = 60; // 60초마다 재검증

export default async function GachashopsPage() {
  const gachashops = await getGachashops();

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">가차샵</h1>
          <p className="text-muted-foreground">
            전국의 가차샵을 찾아보세요. 총 {gachashops.length}개의 가차샵이
            있습니다.
          </p>
        </div>

        {/* 가챠샵 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {gachashops.map((shop) => (
            <GachashopCard key={shop.id} gachashop={shop} />
          ))}
        </div>
      </div>
    </div>
  );
}
