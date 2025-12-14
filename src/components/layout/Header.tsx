"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navLinks = [
    {
      href: "/gachashops",
      label: "가차샵",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
          <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16" stroke="#FDA4AF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          <path d="M19 21h2m-2 0h-5m-9 0H3m2 0h5" stroke="#FDA4AF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          <rect x="9" y="7" width="2" height="2" fill="#FECDD3" rx="0.5" />
          <rect x="9" y="11" width="2" height="2" fill="#FECDD3" rx="0.5" />
          <rect x="13" y="7" width="2" height="2" fill="#FECDD3" rx="0.5" />
          <rect x="13" y="11" width="2" height="2" fill="#FECDD3" rx="0.5" />
          <path d="M9 21v-5a1 1 0 011-1h4a1 1 0 011 1v5" fill="#FFF1F2" stroke="#FDA4AF" strokeWidth={1.5} />
        </svg>
      ),
      color: "rose"
    },
    {
      href: "/gachas",
      label: "가차",
      icon: (
        <svg viewBox="0 0 24 32" className="w-4 h-5">
          <path d="M12 2 C5 2 2 8 2 12 L22 12 C22 8 19 2 12 2 Z" fill="#EDE9FE" stroke="#C4B5FD" strokeWidth="1" />
          <path d="M2 16 C2 22 5 28 12 28 C19 28 22 22 22 16 L2 16 Z" fill="#C4B5FD" stroke="#A78BFA" strokeWidth="1" />
          <rect x="2" y="12" width="20" height="4" fill="#A78BFA" />
        </svg>
      ),
      color: "violet"
    },
    {
      href: "/map",
      label: "지도",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
          <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7" fill="#E0F2FE" />
          <path d="M9 7l6-3v13l-6 3V7z" fill="#BAE6FD" />
          <path d="M15 4l4.553 2.276A1 1 0 0121 7.618v8.764a1 1 0 01-.553.894L15 20" fill="#7DD3FC" />
          <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" stroke="#38BDF8" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      color: "sky"
    },
    {
      href: "/favorites",
      label: "즐겨찾기",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#FBCFE8" stroke="#F9A8D4" strokeWidth="1"/>
        </svg>
      ),
      color: "pink"
    },
  ];

  const getNavColorClasses = (color: string, isActive: boolean) => {
    if (isActive) {
      switch (color) {
        case "rose": return "bg-rose-100 text-rose-600 border-rose-200";
        case "violet": return "bg-violet-100 text-violet-600 border-violet-200";
        case "sky": return "bg-sky-100 text-sky-600 border-sky-200";
        case "pink": return "bg-pink-100 text-pink-600 border-pink-200";
        default: return "bg-rose-100 text-rose-600 border-rose-200";
      }
    }
    switch (color) {
      case "rose": return "text-gray-600 hover:bg-rose-50 hover:text-rose-500 border-transparent";
      case "violet": return "text-gray-600 hover:bg-violet-50 hover:text-violet-500 border-transparent";
      case "sky": return "text-gray-600 hover:bg-sky-50 hover:text-sky-500 border-transparent";
      case "pink": return "text-gray-600 hover:bg-pink-50 hover:text-pink-500 border-transparent";
      default: return "text-gray-600 hover:bg-rose-50 hover:text-rose-500 border-transparent";
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-white/90 via-rose-50/50 to-white/90 backdrop-blur-md border-b border-rose-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* 로고 */}
          <Link href="/" className="flex items-center gap-1.5 shrink-0 group">
            <div className="w-8 h-10 sm:w-10 sm:h-12 flex items-center justify-center transition-transform group-hover:scale-110 group-active:scale-95">
              <svg
                viewBox="0 0 40 48"
                className="w-full h-full drop-shadow-md"
              >
                {/* 캡슐 위쪽 (투명/밝은색) */}
                <path
                  d="M20 4 C8 4 4 14 4 22 L36 22 C36 14 32 4 20 4 Z"
                  fill="#FFF1F2"
                  stroke="#FECDD3"
                  strokeWidth="2"
                />
                {/* 캡슐 아래쪽 (색상) */}
                <path
                  d="M4 26 C4 34 8 44 20 44 C32 44 36 34 36 26 L4 26 Z"
                  fill="#FECDD3"
                  stroke="#FDA4AF"
                  strokeWidth="2"
                />
                {/* 중간 라인 */}
                <rect x="4" y="22" width="32" height="4" fill="#FDA4AF" />
                {/* 하이라이트 */}
                <ellipse cx="14" cy="14" rx="4" ry="3" fill="white" opacity="0.6" />
              </svg>
            </div>
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-rose-400 to-sky-400 bg-clip-text text-transparent">
              가차겟차
            </span>
          </Link>

          {/* 검색창 - 데스크톱 */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-md"
          >
            <div className="relative w-full group">
              <div className="absolute inset-0 bg-gradient-to-r from-rose-200 to-sky-200 rounded-full blur opacity-0 group-hover:opacity-50 transition-opacity" />
              <Input
                type="text"
                placeholder="가차샵이나 가차를 검색하세요..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="relative w-full pl-4 pr-12 py-2 rounded-full border-rose-200 focus:border-rose-300 focus:ring-rose-200 bg-white/80"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-rose-300 hover:bg-rose-400 text-white p-1.5 rounded-full transition-all hover:scale-105"
              >
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
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </div>
          </form>

          {/* 네비게이션 - 데스크톱 */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full border font-medium transition-all duration-200 hover:scale-105 ${getNavColorClasses(link.color, isActive)}`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* 모바일 메뉴 버튼 */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-full"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </Button>
        </div>

        {/* 모바일 메뉴 */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-rose-100 pt-4">
            {/* 검색창 - 모바일 */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="가차샵이나 가차를 검색하세요..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-12 py-2.5 rounded-full border-rose-200 focus:border-rose-300 bg-white"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-rose-300 hover:bg-rose-400 text-white p-1.5 rounded-full transition-all"
                >
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
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </div>
            </form>

            {/* 네비게이션 링크 - 모바일 */}
            <nav className="grid grid-cols-2 gap-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-medium transition-all ${getNavColorClasses(link.color, isActive)}`}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
