import Link from "next/link";
import { Button } from "@/components/ui/button";
import GachashopCard from "@/components/cards/GachashopCard";
import GachaCard from "@/components/cards/GachaCard";
import HeroGachaMachine from "@/components/home/HeroGachaMachine";
import { getGachashops, getGachas } from "@/lib/db";

export const revalidate = 60;

export default async function Home() {
  const [gachashops, gachas] = await Promise.all([
    getGachashops(),
    getGachas(),
  ]);

  // 신상 가차샵 (최근 등록순 3개)
  const newGachashops = [...gachashops]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  // 신상 가챠 (최근 출시일 기준 정렬 후 4개)
  const newGachas = [...gachas]
    .sort((a, b) => {
      if (!a.releaseDate) return 1;
      if (!b.releaseDate) return -1;
      return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
    })
    .slice(0, 4);

  return (
    <div className="min-h-screen">
      {/* 히어로 섹션 */}
      <section className="relative bg-gradient-to-b from-rose-50 via-background to-sky-50 py-16 md:py-24 overflow-hidden">
        {/* 배경 장식 - 부드러운 원형 그라데이션 */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        </div>

        {/* 떠다니는 캡슐 장식들 - 파스텔 톤 */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* 왼쪽 위 캡슐 - 파스텔 핑크 */}
          <div className="absolute top-16 left-[10%] animate-bounce" style={{ animationDuration: "3s" }}>
            <svg viewBox="0 0 40 52" className="w-10 h-13 opacity-70 drop-shadow-md">
              <path d="M20 4 C10 4 6 12 6 20 L34 20 C34 12 30 4 20 4 Z" fill="#FFF1F2" stroke="#FECDD3" strokeWidth="2" />
              <path d="M6 24 C6 32 10 40 20 40 C30 40 34 32 34 24 L6 24 Z" fill="#FECDD3" stroke="#FDA4AF" strokeWidth="2" />
              <rect x="6" y="20" width="28" height="4" fill="#FDA4AF" />
              <ellipse cx="14" cy="12" rx="4" ry="3" fill="white" fillOpacity="0.5" />
            </svg>
          </div>
          {/* 오른쪽 위 캡슐 - 파스텔 스카이블루 */}
          <div className="absolute top-24 right-[15%] animate-bounce" style={{ animationDuration: "2.5s", animationDelay: "0.5s" }}>
            <svg viewBox="0 0 40 52" className="w-8 h-10 opacity-60 drop-shadow-md rotate-12">
              <path d="M20 4 C10 4 6 12 6 20 L34 20 C34 12 30 4 20 4 Z" fill="#F0F9FF" stroke="#BAE6FD" strokeWidth="2" />
              <path d="M6 24 C6 32 10 40 20 40 C30 40 34 32 34 24 L6 24 Z" fill="#BAE6FD" stroke="#7DD3FC" strokeWidth="2" />
              <rect x="6" y="20" width="28" height="4" fill="#7DD3FC" />
              <ellipse cx="14" cy="12" rx="3" ry="2" fill="white" fillOpacity="0.5" />
            </svg>
          </div>
          {/* 왼쪽 아래 캡슐 - 파스텔 민트 */}
          <div className="absolute bottom-32 left-[8%] animate-bounce" style={{ animationDuration: "3.5s", animationDelay: "1s" }}>
            <svg viewBox="0 0 40 52" className="w-12 h-15 opacity-50 drop-shadow-md -rotate-12">
              <path d="M20 4 C10 4 6 12 6 20 L34 20 C34 12 30 4 20 4 Z" fill="#ECFDF5" stroke="#A7F3D0" strokeWidth="2" />
              <path d="M6 24 C6 32 10 40 20 40 C30 40 34 32 34 24 L6 24 Z" fill="#A7F3D0" stroke="#6EE7B7" strokeWidth="2" />
              <rect x="6" y="20" width="28" height="4" fill="#6EE7B7" />
              <ellipse cx="14" cy="12" rx="4" ry="3" fill="white" fillOpacity="0.5" />
            </svg>
          </div>
          {/* 오른쪽 아래 캡슐 - 파스텔 라벤더 */}
          <div className="absolute bottom-20 right-[12%] animate-bounce" style={{ animationDuration: "2.8s", animationDelay: "0.3s" }}>
            <svg viewBox="0 0 40 52" className="w-9 h-11 opacity-60 drop-shadow-md rotate-6">
              <path d="M20 4 C10 4 6 12 6 20 L34 20 C34 12 30 4 20 4 Z" fill="#F5F3FF" stroke="#DDD6FE" strokeWidth="2" />
              <path d="M6 24 C6 32 10 40 20 40 C30 40 34 32 34 24 L6 24 Z" fill="#DDD6FE" stroke="#C4B5FD" strokeWidth="2" />
              <rect x="6" y="20" width="28" height="4" fill="#C4B5FD" />
              <ellipse cx="14" cy="12" rx="3" ry="2" fill="white" fillOpacity="0.5" />
            </svg>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
            {/* 왼쪽 텍스트 영역 */}
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight">
                <span className="bg-gradient-to-r from-rose-400 via-pink-500 to-sky-400 bg-clip-text text-transparent">
                  가차겟차
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-foreground/80 mb-4 font-medium">
                전국 가차샵과 캡슐토이 정보를 한눈에
              </p>
              <p className="text-base text-muted-foreground mb-8 max-w-lg mx-auto lg:mx-0">
                가까운 가차샵을 찾고, 신상 가차를 확인하고, 나만의 컬렉션을 만들어보세요.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/gachashops">
                  <button className="w-full sm:w-auto bg-rose-300 hover:bg-rose-400 text-white rounded-full px-8 py-3 font-medium shadow-sm transition-all hover:scale-105 hover:shadow-md active:scale-95">
                    가차샵 둘러보기
                  </button>
                </Link>
                <Link href="/map">
                  <button className="w-full sm:w-auto border border-rose-200 text-rose-400 bg-white hover:bg-rose-50 hover:border-rose-300 rounded-full px-8 py-3 font-medium transition-all hover:scale-105 active:scale-95">
                    지도에서 찾기
                  </button>
                </Link>
              </div>
            </div>

            {/* 오른쪽 인터랙티브 가차 머신 */}
            <div className="flex-1 flex justify-center items-center">
              <HeroGachaMachine />
            </div>
          </div>
        </div>
      </section>

      {/* 신상 가차샵 섹션 */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">신상 가차샵</h2>
            <Link
              href="/gachashops"
              className="text-primary hover:text-primary/80 font-medium flex items-center gap-1"
            >
              더보기
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {newGachashops.map((shop) => (
              <GachashopCard key={shop.id} gachashop={shop} />
            ))}
          </div>
        </div>
      </section>

      {/* 신상 가챠 섹션 */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">신상 가차</h2>
            <Link
              href="/gachas"
              className="text-primary hover:text-primary/80 font-medium flex items-center gap-1"
            >
              더보기
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {newGachas.map((gacha) => (
              <GachaCard key={gacha.id} gacha={gacha} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-gradient-to-r from-rose-100 to-sky-100 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
            {/* 배경 캡슐 장식 */}
            <div className="absolute top-4 left-8 opacity-30 animate-bounce" style={{ animationDuration: "3s" }}>
              <svg viewBox="0 0 30 40" className="w-8 h-10">
                <path d="M15 3 C6 3 3 10 3 16 L27 16 C27 10 24 3 15 3 Z" fill="#FECDD3" />
                <path d="M3 20 C3 26 6 34 15 34 C24 34 27 26 27 20 L3 20 Z" fill="#FDA4AF" />
                <rect x="3" y="16" width="24" height="4" fill="#F9A8D4" />
              </svg>
            </div>
            <div className="absolute bottom-6 right-12 opacity-30 animate-bounce" style={{ animationDuration: "2.5s", animationDelay: "0.5s" }}>
              <svg viewBox="0 0 30 40" className="w-6 h-8">
                <path d="M15 3 C6 3 3 10 3 16 L27 16 C27 10 24 3 15 3 Z" fill="#BAE6FD" />
                <path d="M3 20 C3 26 6 34 15 34 C24 34 27 26 27 20 L3 20 Z" fill="#7DD3FC" />
                <rect x="3" y="16" width="24" height="4" fill="#38BDF8" />
              </svg>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 relative z-10">
              주변 가차샵을 찾고 있나요?
            </h2>
            <p className="text-muted-foreground mb-6 relative z-10">
              지도에서 가까운 가차샵을 확인하고 원하는 가차를 찾아보세요!
            </p>
            <Link href="/map">
              <Button
                size="lg"
                className="bg-rose-300 hover:bg-rose-400 text-white rounded-full px-8 shadow-sm transition-all hover:scale-105 hover:shadow-md active:scale-95 relative z-10"
              >
                지도에서 찾기
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
