import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-primary/20 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 로고 & 설명 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-10 flex items-center justify-center">
                <svg viewBox="0 0 40 48" className="w-8 h-10">
                  {/* 캡슐 위쪽 */}
                  <path
                    d="M20 4 C8 4 4 14 4 22 L36 22 C36 14 32 4 20 4 Z"
                    fill="#FFE4E8"
                    stroke="#FFB6C1"
                    strokeWidth="2"
                  />
                  {/* 캡슐 아래쪽 */}
                  <path
                    d="M4 26 C4 34 8 44 20 44 C32 44 36 34 36 26 L4 26 Z"
                    fill="#FFB6C1"
                    stroke="#FFB6C1"
                    strokeWidth="2"
                  />
                  {/* 중간 라인 */}
                  <rect x="4" y="22" width="32" height="4" fill="#FF9AAB" />
                  {/* 하이라이트 */}
                  <ellipse cx="14" cy="14" rx="4" ry="3" fill="white" opacity="0.6" />
                </svg>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-rose-400 to-sky-400 bg-clip-text text-transparent">
                가차겟차
              </span>
            </div>
            <p className="text-muted-foreground text-sm">
              한국의 가차(캡슐토이) 정보와 가차샵 위치를 한눈에 확인하세요.
            </p>
          </div>

          {/* 바로가기 */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">바로가기</h3>
            <nav className="flex flex-col gap-2">
              <Link
                href="/gachashops"
                className="text-muted-foreground hover:text-primary transition-colors text-sm"
              >
                가차샵 목록
              </Link>
              <Link
                href="/gachas"
                className="text-muted-foreground hover:text-primary transition-colors text-sm"
              >
                가차 상품
              </Link>
              <Link
                href="/map"
                className="text-muted-foreground hover:text-primary transition-colors text-sm"
              >
                지도로 찾기
              </Link>
              <Link
                href="/favorites"
                className="text-muted-foreground hover:text-primary transition-colors text-sm"
              >
                즐겨찾기
              </Link>
            </nav>
          </div>

          {/* 정보 */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">정보</h3>
            <p className="text-muted-foreground text-sm">
              본 사이트의 정보는 참고용이며,
              <br />
              실제 정보와 다를 수 있습니다.
            </p>
          </div>
        </div>

        {/* 카피라이트 */}
        <div className="mt-8 pt-4 border-t border-primary/10 text-center">
          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} 가차겟차. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
