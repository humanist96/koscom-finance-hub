# Securities Intelligence Hub

KOSCOM 금융영업부를 위한 증권사 동향 모니터링 시스템

## 프로젝트 소개

Securities Intelligence Hub는 국내 증권사들의 뉴스, 인사 변동, 계약 현황을 통합 관리하고 분석하는 웹 애플리케이션입니다. KOSCOM 금융영업부에서 고객사인 증권사들의 동향을 효율적으로 파악하고 영업 활동에 활용할 수 있도록 설계되었습니다.

## 주요 기능

### 1. 뉴스 모니터링
- 증권사별 뉴스/보도자료 자동 수집
- 카테고리별 필터링 (실적/사업, 인사, 상품/서비스, IR, 이벤트)
- 키워드 검색 및 기간별 조회
- Powerbase 고객사 전용 필터

### 2. 인사 동향 추적
- 증권사 임직원 인사 변동 정보
- 변동 유형별 분류 (신규임명, 승진, 전보, 사임, 퇴임)
- 시간순 타임라인 뷰

### 3. 계약 관리
- 고객사별 계약 현황 조회
- 서비스별 매출 분석
- 국내/해외/이관 구분별 통계
- 연도별 매출 추이

### 4. 주간 리포트
- 자동 생성 주간 요약 리포트
- 카테고리별 동향 요약
- PDF 내보내기 기능

### 5. 알림 시스템
- 키워드 기반 알림 설정
- 관심 증권사 뉴스 알림
- 인사이동 알림

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4 |
| Backend | Next.js API Routes |
| Database | PostgreSQL 16, Prisma ORM |
| Authentication | NextAuth.js (Credentials) |
| State Management | Zustand, TanStack Query |
| Charts | Recharts, React Three Fiber |
| PDF | @react-pdf/renderer |
| 크롤링 | Cheerio, Puppeteer |
| AI | Anthropic Claude API (요약 생성) |

## 퀵 스타트

### 요구사항
- Node.js 20 이상
- npm 10 이상
- PostgreSQL 16 이상 (또는 Docker)

### 1. 프로젝트 클론 및 의존성 설치
```bash
git clone <repository-url>
cd securities-intelligence-hub
npm install
```

### 2. 환경 변수 설정
```bash
cp .env.example .env.local
```

`.env.local` 파일 편집:
```env
# 데이터베이스 (필수)
DATABASE_URL="postgresql://user:password@localhost:5432/securities_hub?schema=public"
DIRECT_URL="postgresql://user:password@localhost:5432/securities_hub?schema=public"

# 인증 (필수)
NEXTAUTH_SECRET="your-secret-key-at-least-32-characters"
NEXTAUTH_URL="http://localhost:3000"

# AI 요약 (선택)
ANTHROPIC_API_KEY="sk-ant-..."
```

### 3. 데이터베이스 설정
```bash
# Docker로 PostgreSQL 실행 (권장)
docker compose up -d postgres

# Prisma 스키마 적용
npm run db:push

# 초기 데이터 시드 (선택)
npm run db:seed
```

### 4. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 http://localhost:3000 접속

## 프로젝트 구조

```
securities-intelligence-hub/
├── prisma/
│   ├── schema.prisma       # 데이터베이스 스키마
│   └── seed.ts             # 초기 데이터
├── scripts/
│   ├── crawlers/           # 뉴스 크롤러
│   └── scheduler.ts        # 스케줄러
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── api/            # API 라우트
│   │   ├── admin/          # 관리자 페이지
│   │   ├── dashboard/      # 대시보드 페이지
│   │   └── login/          # 인증 페이지
│   ├── components/
│   │   ├── features/       # 기능별 컴포넌트
│   │   ├── layout/         # 레이아웃 컴포넌트
│   │   ├── pdf/            # PDF 렌더링
│   │   └── ui/             # 공통 UI 컴포넌트
│   ├── lib/                # 유틸리티/서비스
│   ├── services/           # API 클라이언트
│   ├── stores/             # Zustand 스토어
│   └── types/              # TypeScript 타입
├── docs/                   # 프로젝트 문서
└── public/                 # 정적 파일
```

## 관리자 계정

초기 관리자 계정 (시드 데이터):
- **이메일**: admin@koscom.co.kr
- **비밀번호**: admin1234!

> 첫 로그인 후 반드시 비밀번호를 변경하세요.

## npm 스크립트

```bash
# 개발
npm run dev             # 개발 서버 실행

# 빌드
npm run build           # 프로덕션 빌드
npm run start           # 프로덕션 서버 실행

# 데이터베이스
npm run db:push         # 스키마 적용 (개발)
npm run db:migrate      # 마이그레이션 실행
npm run db:seed         # 시드 데이터 적용
npm run db:studio       # Prisma Studio 실행

# 크롤러
npm run crawl           # 전체 크롤러 실행
npm run crawl:simple    # 간단 크롤러 실행
npm run scheduler       # 스케줄러 실행
```

## 문서 목록

### 기술 문서
- [ARCHITECTURE.md](./ARCHITECTURE.md) - 시스템 아키텍처
- [DATABASE.md](./DATABASE.md) - 데이터베이스 스키마
- [API.md](./API.md) - API 명세서
- [DEPLOYMENT.md](./DEPLOYMENT.md) - 배포 가이드
- [OPERATIONS.md](./OPERATIONS.md) - 운영 가이드
- [MAINTENANCE.md](./MAINTENANCE.md) - 유지보수 가이드

### 바이브 코딩 가이드 (금융영업팀)
- [MAINTENANCE_PLAN.md](./MAINTENANCE_PLAN.md) - 유지보수 계획안 (전체 계획)
- [VIBE_CODING_GUIDE.md](./VIBE_CODING_GUIDE.md) - 바이브 코딩 가이드 (Claude Code 활용법)
- [PROMPT_TEMPLATES.md](./PROMPT_TEMPLATES.md) - 프롬프트 템플릿 라이브러리

## 라이선스

이 프로젝트는 KOSCOM 내부 사용 목적으로 개발되었습니다.
