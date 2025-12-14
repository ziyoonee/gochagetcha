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
      <section className="relative bg-gradient-to-br from-rose-50 via-pink-50/50 to-violet-50 py-16 md:py-24 overflow-hidden">
        {/* 배경 장식 - 부드러운 원형 그라데이션 */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-rose-200/40 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-200/30 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-100/20 rounded-full blur-3xl" />
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
                  <button className="group w-full sm:w-auto bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white rounded-full px-8 py-3.5 font-medium shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95 flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 group-hover:animate-bounce" style={{ animationDuration: "0.5s" }} viewBox="0 0 24 24" fill="none">
                      <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M19 21h2m-2 0h-5m-9 0H3m2 0h5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M9 21v-5a1 1 0 011-1h4a1 1 0 011 1v5" fill="white" fillOpacity="0.3" stroke="currentColor" strokeWidth={1.5} />
                    </svg>
                    가차샵 둘러보기
                    <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </Link>
                <Link href="/map">
                  <button className="group w-full sm:w-auto border-2 border-rose-200 text-rose-500 bg-white hover:bg-rose-50 hover:border-rose-300 rounded-full px-8 py-3.5 font-medium transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-sm hover:shadow-md">
                    <svg className="w-5 h-5 group-hover:animate-pulse" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#FECDD3" stroke="#FDA4AF" strokeWidth="1.5"/>
                      <circle cx="12" cy="9" r="2" fill="white" stroke="#FDA4AF" strokeWidth="1"/>
                    </svg>
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
      <section className="py-12 md:py-16 relative overflow-hidden bg-white">

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-rose-200 to-rose-300 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                  <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16" stroke="#FB7185" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M19 21h2m-2 0h-5m-9 0H3m2 0h5" stroke="#FB7185" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  <rect x="9" y="7" width="2" height="2" fill="#FECDD3" rx="0.5" />
                  <rect x="9" y="11" width="2" height="2" fill="#FECDD3" rx="0.5" />
                  <rect x="13" y="7" width="2" height="2" fill="#FECDD3" rx="0.5" />
                  <rect x="13" y="11" width="2" height="2" fill="#FECDD3" rx="0.5" />
                  <path d="M9 21v-5a1 1 0 011-1h4a1 1 0 011 1v5" fill="#FFF1F2" stroke="#FB7185" strokeWidth={1.5} />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">신상 가차샵</h2>
                <p className="text-sm text-muted-foreground">새로 등록된 가차샵을 만나보세요</p>
              </div>
            </div>
            <Link
              href="/gachashops"
              className="group w-10 h-10 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-500 flex items-center justify-center transition-all hover:shadow-md hover:scale-110 active:scale-95"
              title="더보기"
            >
              <svg
                className="w-5 h-5 group-hover:translate-x-0.5 transition-transform"
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
      <section className="py-12 md:py-16 bg-white relative overflow-hidden">

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-200 to-violet-300 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300">
                {/* 캡슐 아이콘 */}
                <svg viewBox="0 0 24 32" className="w-6 h-7 drop-shadow-sm">
                  <path d="M12 2 C5 2 2 8 2 12 L22 12 C22 8 19 2 12 2 Z" fill="#EDE9FE" stroke="#C4B5FD" strokeWidth="1" />
                  <path d="M2 16 C2 22 5 28 12 28 C19 28 22 22 22 16 L2 16 Z" fill="#C4B5FD" stroke="#A78BFA" strokeWidth="1" />
                  <rect x="2" y="12" width="20" height="4" fill="#A78BFA" />
                  <ellipse cx="8" cy="7" rx="3" ry="2" fill="white" opacity="0.5" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent">신상 가차</h2>
                <p className="text-sm text-muted-foreground">따끈따끈한 신상품을 확인하세요</p>
              </div>
            </div>
            <Link
              href="/gachas"
              className="group w-10 h-10 rounded-full bg-violet-50 hover:bg-violet-100 text-violet-500 flex items-center justify-center transition-all hover:shadow-md hover:scale-110 active:scale-95"
              title="더보기"
            >
              <svg
                className="w-5 h-5 group-hover:translate-x-0.5 transition-transform"
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
      <section className="py-12 md:py-16 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="bg-gradient-to-br from-rose-50 via-pink-50 to-violet-50 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden shadow-lg border border-rose-100/50">
            {/* 배경 패턴 */}
            <div className="absolute inset-0 opacity-40">
              <div className="absolute top-0 left-0 w-full h-full" style={{
                backgroundImage: `radial-gradient(circle at 20% 30%, rgba(251, 113, 133, 0.3) 0%, transparent 40%),
                                  radial-gradient(circle at 80% 70%, rgba(196, 181, 253, 0.3) 0%, transparent 40%),
                                  radial-gradient(circle at 50% 50%, rgba(244, 114, 182, 0.2) 0%, transparent 40%)`
              }} />
            </div>

            {/* 떠다니는 하트와 별 장식 */}
            <div className="absolute top-6 left-8 animate-bounce" style={{ animationDuration: "2s" }}>
              <svg className="w-6 h-6 text-rose-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            <div className="absolute top-12 right-16 animate-pulse" style={{ animationDelay: "0.5s" }}>
              <svg className="w-5 h-5 text-violet-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <div className="absolute bottom-8 left-16 animate-bounce" style={{ animationDuration: "3s", animationDelay: "1s" }}>
              <svg className="w-4 h-4 text-sky-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <div className="absolute bottom-10 right-10 animate-pulse" style={{ animationDelay: "0.3s" }}>
              <svg className="w-5 h-5 text-rose-200" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>

            {/* 캡슐 장식 */}
            <div className="absolute top-1/2 left-6 -translate-y-1/2 opacity-40 animate-bounce" style={{ animationDuration: "3s" }}>
              <svg viewBox="0 0 30 40" className="w-8 h-10">
                <path d="M15 3 C6 3 3 10 3 16 L27 16 C27 10 24 3 15 3 Z" fill="#FECDD3" />
                <path d="M3 20 C3 26 6 34 15 34 C24 34 27 26 27 20 L3 20 Z" fill="#FDA4AF" />
                <rect x="3" y="16" width="24" height="4" fill="#F9A8D4" />
              </svg>
            </div>
            <div className="absolute top-1/2 right-8 -translate-y-1/2 opacity-40 animate-bounce" style={{ animationDuration: "2.5s", animationDelay: "0.5s" }}>
              <svg viewBox="0 0 30 40" className="w-6 h-8">
                <path d="M15 3 C6 3 3 10 3 16 L27 16 C27 10 24 3 15 3 Z" fill="#BAE6FD" />
                <path d="M3 20 C3 26 6 34 15 34 C24 34 27 26 27 20 L3 20 Z" fill="#7DD3FC" />
                <rect x="3" y="16" width="24" height="4" fill="#38BDF8" />
              </svg>
            </div>

            <div className="relative z-10">
              {/* 귀여운 핀 아이콘 */}
              <div className="w-16 h-16 mx-auto mb-4 bg-white/80 rounded-full flex items-center justify-center shadow-lg animate-bounce" style={{ animationDuration: "2s" }}>
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#FDA4AF" stroke="#FB7185" strokeWidth="1.5"/>
                  <circle cx="12" cy="9" r="2.5" fill="white"/>
                </svg>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                주변 가차샵을 찾고 있나요?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                지도에서 가까운 가차샵을 확인하고 원하는 가차를 찾아보세요!
              </p>
              <Link href="/map">
                <button className="group bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white rounded-full px-8 py-3.5 font-medium shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95 flex items-center gap-2 mx-auto">
                  <svg className="w-5 h-5 group-hover:animate-pulse" viewBox="0 0 24 24" fill="none">
                    <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7" fill="#FFF1F2" fillOpacity="0.3" />
                    <path d="M9 7l6-3v13l-6 3V7z" fill="white" fillOpacity="0.4" />
                    <path d="M15 4l4.553 2.276A1 1 0 0121 7.618v8.764a1 1 0 01-.553.894L15 20" fill="white" fillOpacity="0.2" />
                    <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  지도에서 찾기
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
