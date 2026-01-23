# 시스템 아키텍처

## 시스템 구조도

```
┌──────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                          │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                   Next.js App Router                         │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │ │
│  │  │   Pages     │  │ Components  │  │     Hooks/State     │  │ │
│  │  │ (SSR/CSR)   │  │ (React 19)  │  │ (Zustand/TanStack)  │  │ │
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────┐
│                      API Routes (Serverless)                      │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐ │
│  │   /auth    │  │   /news    │  │ /contracts │  │  /alerts   │ │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘ │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐ │
│  │ /companies │  │ /personnel │  │  /reports  │  │  /search   │ │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘ │
└──────────────────────────────────────────────────────────────────┘
                                 │
                    ┌────────────┼────────────┐
                    ▼            ▼            ▼
           ┌──────────────┐ ┌────────┐ ┌──────────────┐
           │  PostgreSQL  │ │ Claude │ │    Naver     │
           │   (Prisma)   │ │   AI   │ │  News API    │
           └──────────────┘ └────────┘ └──────────────┘
```

## 폴더 구조

```
securities-intelligence-hub/
├── prisma/                     # 데이터베이스 설정
│   ├── schema.prisma           # Prisma 스키마 정의
│   ├── migrations/             # 마이그레이션 파일
│   └── seed.ts                 # 초기 데이터 시드
│
├── scripts/                    # 독립 실행 스크립트
│   ├── crawlers/               # 뉴스 크롤러
│   │   ├── enhanced-crawler.ts # 향상된 크롤러
│   │   └── final-crawler.ts    # 최종 크롤러
│   ├── scheduler.ts            # cron 스케줄러
│   └── add-small-securities.ts # 데이터 추가 스크립트
│
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API 라우트
│   │   │   ├── auth/           # 인증 API
│   │   │   ├── news/           # 뉴스 API
│   │   │   ├── contracts/      # 계약 API
│   │   │   ├── personnel/      # 인사 API
│   │   │   ├── alerts/         # 알림 API
│   │   │   ├── companies/      # 증권사 API
│   │   │   ├── reports/        # 리포트 API
│   │   │   ├── search/         # 검색 API
│   │   │   ├── admin/          # 관리자 API
│   │   │   └── crawl/          # 크롤링 트리거
│   │   │
│   │   ├── admin/              # 관리자 페이지
│   │   │   ├── page.tsx        # 관리자 대시보드
│   │   │   ├── users/          # 사용자 관리
│   │   │   └── layout.tsx      # 관리자 레이아웃
│   │   │
│   │   ├── dashboard/          # 대시보드 페이지
│   │   │   ├── page.tsx        # 메인 대시보드 (뉴스)
│   │   │   ├── contracts/      # 계약 현황
│   │   │   ├── companies/      # 증권사 정보
│   │   │   ├── personnel/      # 인사 동향
│   │   │   ├── reports/        # 주간 리포트
│   │   │   ├── settings/       # 설정
│   │   │   └── layout.tsx      # 대시보드 레이아웃
│   │   │
│   │   ├── login/              # 로그인 페이지
│   │   ├── register/           # 회원가입 페이지
│   │   ├── pending/            # 승인 대기 페이지
│   │   ├── layout.tsx          # 루트 레이아웃
│   │   ├── page.tsx            # 홈 (리다이렉트)
│   │   └── globals.css         # 전역 스타일
│   │
│   ├── components/             # React 컴포넌트
│   │   ├── features/           # 기능별 컴포넌트
│   │   │   ├── news/           # 뉴스 컴포넌트
│   │   │   ├── contracts/      # 계약 컴포넌트
│   │   │   ├── personnel/      # 인사 컴포넌트
│   │   │   └── alerts/         # 알림 컴포넌트
│   │   ├── layout/             # 레이아웃 컴포넌트
│   │   │   ├── header.tsx      # 헤더
│   │   │   └── sidebar.tsx     # 사이드바
│   │   ├── charts/             # 차트 컴포넌트
│   │   ├── pdf/                # PDF 렌더링
│   │   ├── ui/                 # 공통 UI (shadcn/ui)
│   │   └── providers.tsx       # Context Providers
│   │
│   ├── lib/                    # 유틸리티/서비스
│   │   ├── prisma.ts           # Prisma 클라이언트
│   │   ├── auth.ts             # NextAuth 설정
│   │   ├── query-client.ts     # React Query 설정
│   │   ├── utils.ts            # 유틸리티 함수
│   │   ├── ai-summarizer.ts    # AI 요약 서비스
│   │   ├── crawler-service.ts  # 크롤링 서비스
│   │   ├── notification-service.ts # 알림 서비스
│   │   ├── weekly-report-service.ts # 리포트 서비스
│   │   └── serverless-crawler.ts # 서버리스 크롤러
│   │
│   ├── services/               # API 클라이언트
│   │   └── api.ts              # API 호출 함수
│   │
│   ├── stores/                 # Zustand 스토어
│   │   └── filter-store.ts     # 필터 상태 관리
│   │
│   └── types/                  # TypeScript 타입
│       └── index.ts            # 공통 타입 정의
│
├── public/                     # 정적 파일
│   └── logos/                  # 증권사 로고
│
├── docs/                       # 프로젝트 문서
│
├── docker-compose.yml          # Docker 설정
├── next.config.ts              # Next.js 설정
├── tailwind.config.ts          # Tailwind 설정
├── tsconfig.json               # TypeScript 설정
└── package.json                # 의존성 관리
```

## 주요 컴포넌트 관계

```
┌─────────────────────────────────────────────────────────────────┐
│                          Layout                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                        Header                                ││
│  │  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐  ││
│  │  │    Logo     │  │   Search     │  │  AlertBell + User  │  ││
│  │  └─────────────┘  └──────────────┘  └────────────────────┘  ││
│  └─────────────────────────────────────────────────────────────┘│
│  ┌────────────┐  ┌─────────────────────────────────────────────┐│
│  │            │  │                  Main Content                ││
│  │            │  │  ┌─────────────────────────────────────────┐ ││
│  │  Sidebar   │  │  │              Page Content                │ ││
│  │            │  │  │  (News/Contracts/Personnel/Reports)      │ ││
│  │  - 뉴스    │  │  │                                          │ ││
│  │  - 계약    │  │  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  │ ││
│  │  - 인사    │  │  │  │ Filter  │  │  List   │  │ Detail  │  │ ││
│  │  - 리포트  │  │  │  └─────────┘  └─────────┘  └─────────┘  │ ││
│  │  - 설정    │  │  └─────────────────────────────────────────┘ ││
│  │            │  └─────────────────────────────────────────────┘│
│  └────────────┘                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 뉴스 페이지 컴포넌트

```
DashboardPage (page.tsx)
├── MobileFilter (mobile-filter.tsx)
├── UpdateStatus (update-status.tsx)
└── NewsList (news-list.tsx)
    └── NewsCard (news-card.tsx)
        ├── Badge (category)
        └── CompanyInfo
```

### 계약 페이지 컴포넌트

```
ContractsPage (page.tsx)
├── InsightCard (insight-card.tsx)
├── ChartCard
│   ├── RevenueBarChart (revenue-bar-chart.tsx)
│   └── ServiceTreemap (service-treemap.tsx)
├── OpportunityTable (opportunity-table.tsx)
├── RiskAlert (risk-alert.tsx)
└── ActionItems (action-items.tsx)
```

## 데이터 흐름

### 사용자 요청 처리 흐름

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│   Browser   │────▶│  Next.js    │────▶│  API Route  │────▶│  PostgreSQL  │
│   (React)   │     │  App Router │     │  (Handler)  │     │   (Prisma)   │
└─────────────┘     └─────────────┘     └─────────────┘     └──────────────┘
       ▲                                       │
       │                                       │
       └───────────────────────────────────────┘
                    JSON Response
```

### 상세 흐름

1. **클라이언트 요청**
   ```
   User Action → React Component → API Service → fetch('/api/...')
   ```

2. **서버 처리**
   ```
   API Route → Prisma Query → PostgreSQL → Response
   ```

3. **상태 업데이트**
   ```
   Response → React Query Cache → Component Re-render
   ```

### 뉴스 데이터 흐름 예시

```
┌──────────────┐
│  NewsList    │ ──── useQuery('news', fetchNews)
└──────────────┘
        │
        ▼
┌──────────────┐
│ API Service  │ ──── fetch('/api/news?page=1&limit=20')
└──────────────┘
        │
        ▼
┌──────────────┐
│  API Route   │ ──── prisma.news.findMany({ ... })
│ /api/news    │
└──────────────┘
        │
        ▼
┌──────────────┐
│  PostgreSQL  │ ──── SELECT * FROM news ...
└──────────────┘
```

## 인증 플로우

### 로그인 흐름

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Login Form  │────▶│  NextAuth   │────▶│  Credentials│────▶│   Prisma    │
│             │     │  signIn()   │     │  Provider   │     │  User.find  │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                            │                                      │
                            │         ┌─────────────┐              │
                            │         │   bcrypt    │◀─────────────┘
                            │         │  compare()  │
                            │         └─────────────┘
                            │                │
                            ▼                ▼
                    ┌─────────────┐   Success/Fail
                    │ JWT Session │
                    │   Cookie    │
                    └─────────────┘
```

### 회원가입 흐름

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ Register Form│────▶│ /api/auth/   │────▶│  Create User │
│              │     │   register   │     │ (PENDING)    │
└──────────────┘     └──────────────┘     └──────────────┘
                                                 │
                    ┌──────────────┐              │
                    │  Notify      │◀─────────────┘
                    │  Admins      │
                    └──────────────┘
                           │
                           ▼
┌──────────────┐     ┌──────────────┐
│ Admin Review │────▶│ Approve/     │
│              │     │ Reject       │
└──────────────┘     └──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ User Status  │
                    │ Updated      │
                    └──────────────┘
```

### 세션 확인 미들웨어

```
Request → Check Session → Validate Status → Route Handler
              │                 │
              │                 ├── PENDING → /pending
              │                 ├── REJECTED → /login
              │                 └── SUSPENDED → /login
              │
              └── No Session → /login
```

## 크롤러 아키텍처

### 스케줄러 기반 크롤링

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  node-cron   │────▶│   Puppeteer  │────▶│ Naver Search │
│ (07:00,13:00,│     │   Browser    │     │   Results    │
│  19:00)      │     │              │     │              │
└──────────────┘     └──────────────┘     └──────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │ Parse & Save │
                    │  to Database │
                    └──────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │  CrawlLog    │
                    │   Update     │
                    └──────────────┘
```

### 서버리스 크롤링 (Vercel)

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ Vercel Cron  │────▶│ /api/crawl   │────▶│  Serverless  │
│   Trigger    │     │   Route      │     │   Crawler    │
└──────────────┘     └──────────────┘     └──────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │   Cheerio    │ (Puppeteer 대신)
                    │   Parser     │
                    └──────────────┘
```

## 외부 서비스 연동

| 서비스 | 용도 | 연동 방식 |
|--------|------|----------|
| PostgreSQL | 데이터 저장 | Prisma ORM |
| Naver Search | 뉴스 크롤링 | Puppeteer/Cheerio |
| Claude AI | 뉴스 요약 | Anthropic SDK |
| Vercel | 호스팅 | Git 배포 |

## 보안 아키텍처

```
┌─────────────────────────────────────────────────────────────────┐
│                        Security Layers                           │
├─────────────────────────────────────────────────────────────────┤
│  1. HTTPS (Vercel 자동)                                          │
│  2. NextAuth Session (JWT, 24시간 만료)                          │
│  3. Role-based Access Control (USER/ADMIN/SUPER_ADMIN)          │
│  4. bcrypt Password Hashing (12 rounds)                         │
│  5. Input Validation (Zod/Prisma)                               │
│  6. Environment Variables (Secrets)                              │
└─────────────────────────────────────────────────────────────────┘
```

## 성능 최적화

### 데이터베이스
- Connection Pooling (Prisma)
- 인덱스 최적화 (주요 조회 컬럼)
- 페이지네이션

### 프론트엔드
- React Query 캐싱
- 이미지 최적화 (next/image)
- 코드 스플리팅 (App Router)

### 서버
- Edge Functions (Vercel)
- Static Generation (가능한 경우)
- API Response Caching
