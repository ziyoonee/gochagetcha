# Gacha Getcha (가챠게챠) - 설계 문서

## 프로젝트 개요

**목적**: 한국의 가챠(캡슐토이) 정보와 가챠샵 위치를 한눈에 확인할 수 있는 반응형 웹사이트

**사이트명**: Gacha Getcha (가챠게챠) - "가챠를 얻었다"는 의미

### 기술 스택

| 영역 | 기술 |
|------|------|
| 프론트엔드 | Next.js 14 (App Router) |
| 스타일링 | Tailwind CSS + shadcn/ui |
| 백엔드/DB | Supabase (PostgreSQL) |
| 지도 | 카카오맵 API + 카카오 로컬 API |
| 배포 | Vercel |

### MVP 핵심 기능

1. 가챠샵 목록 조회 및 상세 정보
2. 가챠 상품 목록 조회 및 상세 정보
3. 지도에서 가챠샵 위치 확인 (캡슐 모양 마커)
4. 통합 검색 기능
5. 로컬스토리지 기반 즐겨찾기

### 디자인 컨셉

밝고 귀여운 파스텔 톤, 캡슐/가챠 테마

---

## 페이지 구조

```
/ (홈)
├── /gachashops          # 가챠샵 목록
│   └── /[id]            # 가챠샵 상세 (지도 + 보유 가챠 목록)
├── /gachas              # 가챠 상품 목록
│   └── /[id]            # 가챠 상세 (판매 가챠샵 지도 + 정보)
├── /map                 # 전체 지도 (모든 가챠샵 표시)
├── /search              # 통합 검색 결과
└── /favorites           # 즐겨찾기 목록
```

### 각 페이지 역할

| 페이지 | 설명 |
|--------|------|
| 홈 `/` | 검색창 + 인기 가챠샵/신상 가챠 미리보기 |
| 가챠샵 목록 | 카드 그리드, 필터/정렬 |
| 가챠샵 상세 | 카카오맵 + 주소/영업시간 + 보유 가챠 목록 |
| 가챠 목록 | 카드 그리드, 카테고리 필터 |
| 가챠 상세 | 상품 정보 + 판매 가챠샵 지도 |
| 전체 지도 | 전국 가챠샵 한눈에 (캡슐 마커) |
| 검색 결과 | 가챠샵 + 가챠 통합 검색 |
| 즐겨찾기 | 로컬스토리지에 저장된 항목 표시 |

---

## 데이터베이스 구조

### Supabase 테이블 설계

**gachashops (가챠샵)**
```sql
id              UUID PRIMARY KEY
name            VARCHAR         -- 가챠샵 이름
address         VARCHAR         -- 주소
latitude        DECIMAL         -- 위도
longitude       DECIMAL         -- 경도
phone           VARCHAR         -- 전화번호 (nullable)
opening_hours   VARCHAR         -- 영업시간 (nullable)
image_url       VARCHAR         -- 대표 이미지 (nullable)
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

**gachas (가챠 상품)**
```sql
id              UUID PRIMARY KEY
name            VARCHAR         -- 상품명
brand           VARCHAR         -- 브랜드 (반다이 등)
price           INTEGER         -- 1회 가격 (원)
image_url       VARCHAR         -- 상품 이미지
release_date    DATE            -- 출시일 (nullable)
category        VARCHAR         -- 카테고리 (캐릭터, 동물 등)
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

**gachashop_gachas (가챠샵-가챠 연결)**
```sql
id              UUID PRIMARY KEY
gachashop_id    UUID REFERENCES gachashops(id)
gacha_id        UUID REFERENCES gachas(id)
created_at      TIMESTAMP
```

---

## 컴포넌트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # 공통 레이아웃 (헤더, 푸터)
│   ├── page.tsx            # 홈
│   ├── gachashops/
│   ├── gachas/
│   ├── map/
│   ├── search/
│   └── favorites/
├── components/
│   ├── ui/                 # shadcn/ui 컴포넌트
│   ├── layout/
│   │   ├── Header.tsx      # 로고 + 검색창 + 네비게이션
│   │   └── Footer.tsx
│   ├── map/
│   │   ├── KakaoMap.tsx    # 카카오맵 래퍼
│   │   └── CapsuleMarker.tsx  # 캡슐 모양 커스텀 마커
│   ├── cards/
│   │   ├── GachashopCard.tsx  # 가챠샵 카드
│   │   └── GachaCard.tsx      # 가챠 카드
│   └── common/
│       ├── SearchBar.tsx   # 통합 검색창
│       └── FavoriteButton.tsx  # 즐겨찾기 버튼
├── lib/
│   ├── supabase.ts         # Supabase 클라이언트
│   ├── kakao.ts            # 카카오 API 유틸
│   └── favorites.ts        # 로컬스토리지 즐겨찾기 유틸
└── types/
    └── index.ts            # TypeScript 타입 정의
```

---

## API 및 데이터 흐름

### Next.js API Routes

```
src/app/api/
├── gachashops/
│   ├── route.ts            # GET: 가챠샵 목록
│   └── [id]/route.ts       # GET: 가챠샵 상세
├── gachas/
│   ├── route.ts            # GET: 가챠 목록
│   └── [id]/route.ts       # GET: 가챠 상세
└── search/
    └── route.ts            # GET: 통합 검색
```

### 데이터 흐름

**가챠샵 목록 조회**
```
클라이언트 → API Route → Supabase → 응답
```

**지도 표시**
```
페이지 로드 → Supabase에서 좌표 조회 → 카카오맵에 마커 렌더링
```

**즐겨찾기**
```
클라이언트 로컬스토리지에 저장/조회 (서버 불필요)
```

### 외부 API 사용

| API | 용도 |
|-----|------|
| 카카오맵 JavaScript API | 지도 렌더링 |
| 카카오 로컬 API | 가챠샵 장소 검색 (시드 데이터) |
| 반다이 크롤링 | 가챠 상품 정보 (시드 데이터) |

---

## 반응형 UI 디자인

### 브레이크포인트 (Tailwind 기본값)

| 화면 | 크기 | 레이아웃 |
|------|------|----------|
| 모바일 | < 640px | 1열 카드, 햄버거 메뉴 |
| 태블릿 | 640px ~ 1024px | 2열 카드 그리드 |
| 데스크톱 | > 1024px | 3~4열 카드 그리드 |

### 컬러 팔레트 (파스텔 톤)

| 용도 | 색상 | 코드 |
|------|------|------|
| Primary | 연분홍 | #FFB6C1 |
| Secondary | 하늘색 | #87CEEB |
| Background | 크림핑크 | #FFF9FB |
| Card | 흰색 | #FFFFFF |
| Text | 다크그레이 | #4A4A4A |
| Accent | 노랑 | #FFD93D |

### 주요 UI 요소

- **헤더**: 고정, 로고(캡슐 아이콘) + 검색창 + 네비게이션
- **카드**: 둥근 모서리, 그림자, 호버 시 살짝 올라오는 효과
- **마커**: 캡슐 모양 커스텀 아이콘 (SVG)
- **버튼**: 둥글고 부드러운 느낌, 파스텔 그라데이션

---

## 시드 데이터 수집

### 가챠 상품 데이터 (반다이 크롤링)

**크롤링 대상**: 반다이 가샤폰 공식 사이트
```
https://gashapon.jp/
```

**수집 항목**:
- 상품명
- 이미지 URL
- 가격
- 출시일
- 카테고리

**크롤링 도구**: Node.js 스크립트 (Puppeteer 또는 Cheerio)

### 가챠샵 데이터 (카카오 로컬 API)

**검색 키워드**:
- "가챠샵", "캡슐토이", "가샤폰", "뽑기샵"

**수집 항목**:
- 장소명, 주소, 좌표(위도/경도), 전화번호

### 스크립트 구조

```
scripts/
└── seed/
    ├── crawl-bandai.ts    # 반다이 크롤링
    ├── fetch-gachashops.ts # 카카오 API로 가챠샵 검색
    └── seed-database.ts    # Supabase에 데이터 삽입
```

### 실행 흐름

```bash
npm run seed:crawl    # 반다이 크롤링
npm run seed:shops    # 카카오 API 가챠샵 검색
npm run seed:db       # Supabase에 삽입
```

---

## 즐겨찾기 (로컬스토리지)

```typescript
// lib/favorites.ts
const FAVORITES_KEY = 'gacha-favorites';

interface Favorites {
  gachashops: string[];
  gachas: string[];
}

// 즐겨찾기 조회
export function getFavorites(): Favorites

// 즐겨찾기 추가/제거
export function toggleFavorite(type: 'gachashop' | 'gacha', id: string): void

// 즐겨찾기 여부 확인
export function isFavorite(type: 'gachashop' | 'gacha', id: string): boolean
```

**참고**: 클라이언트 전용이므로 `'use client'` 컴포넌트에서만 접근

---

## 향후 확장 (MVP 이후)

- 게시판 (비밀번호 기반 삭제)
- 가챠샵/가챠 제보 기능 (관리자 검토)
- 신상 정보 페이지
- 주/월별 최저가 랭킹
- 다크 모드 지원
