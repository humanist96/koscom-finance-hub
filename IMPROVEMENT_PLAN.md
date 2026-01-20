# KOSCOM 금융영업부 Hub - 개선 및 확장 계획서

**작성일:** 2026-01-20
**버전:** 1.0
**작성자:** Claude AI Assistant

---

## 1. 현재 시스템 분석 요약

### 1.1 기술 스택
- **Frontend:** Next.js 16, React 19, Tailwind CSS, Radix UI, Recharts, Three.js
- **Backend:** Next.js API Routes, Prisma ORM, PostgreSQL
- **AI/ML:** Anthropic Claude API, OpenAI API
- **배포:** Vercel (서버리스)

### 1.2 핵심 기능 현황
| 기능 | 상태 | 완성도 |
|------|------|--------|
| 뉴스 수집/분류 | ✅ 완료 | 90% |
| AI 요약 | ✅ 완료 | 85% |
| 인사이동 추적 | ✅ 완료 | 80% |
| 계약/매출 분석 | ✅ 완료 | 85% |
| 주간 리포트 | ✅ 완료 | 80% |
| 사용자 인증 | ⚠️ 기본 | 60% |
| 알림 시스템 | ❌ 미구현 | 0% |
| 테스트 코드 | ❌ 미구현 | 0% |

---

## 2. 우선순위별 개선 계획

### 🔴 Phase 1: 핵심 기능 보완 (High Priority)

#### 2.1 알림/알럿 시스템 구현
**현황:** `KeywordAlert` 모델이 존재하지만 실제 구현이 없음

**구현 범위:**
```
src/
├── app/api/alerts/
│   ├── route.ts              # 알림 CRUD API
│   ├── subscribe/route.ts    # 알림 구독 관리
│   └── trigger/route.ts      # 알림 트리거 처리
├── components/features/alerts/
│   ├── AlertSettings.tsx     # 알림 설정 UI
│   ├── AlertList.tsx         # 알림 목록
│   └── AlertBadge.tsx        # 헤더 알림 뱃지
├── hooks/
│   └── useAlerts.ts          # 알림 관련 훅
└── lib/
    └── notification-service.ts  # 알림 서비스
```

**기능 상세:**
- 키워드 기반 실시간 알림
- 특정 회사 뉴스 알림
- 인사이동 발생 시 알림
- 브라우저 Push Notification 지원
- 이메일 알림 옵션 (선택적)

---

#### 2.2 인증/보안 강화
**현황:** 기본적인 인증 스토어만 존재, 실제 보안 취약

**구현 범위:**
```
src/
├── app/api/auth/
│   ├── [...nextauth]/route.ts  # NextAuth.js 통합
│   ├── verify/route.ts         # 토큰 검증
│   └── refresh/route.ts        # 토큰 갱신
├── lib/
│   ├── auth.ts                 # 인증 유틸리티
│   └── middleware.ts           # API 미들웨어
└── middleware.ts               # Next.js 미들웨어 (라우트 보호)
```

**기능 상세:**
- NextAuth.js 또는 Clerk 통합
- JWT 기반 인증
- 역할 기반 접근 제어 (RBAC) 강화
- API Rate Limiting
- 감사 로그 (Audit Log)

---

#### 2.3 테스트 코드 작성
**현황:** 테스트 코드 전무

**구현 범위:**
```
__tests__/
├── unit/
│   ├── lib/
│   │   ├── ai-summarizer.test.ts
│   │   └── weekly-report-service.test.ts
│   ├── hooks/
│   │   ├── useNews.test.ts
│   │   └── useContracts.test.ts
│   └── components/
│       ├── NewsCard.test.tsx
│       └── ChartComponents.test.tsx
├── integration/
│   ├── api/
│   │   ├── news.test.ts
│   │   ├── companies.test.ts
│   │   └── contracts.test.ts
│   └── auth/
│       └── authentication.test.ts
└── e2e/
    ├── dashboard.spec.ts
    ├── login.spec.ts
    └── search.spec.ts
```

**도구:**
- Jest + React Testing Library (단위/통합 테스트)
- Playwright 또는 Cypress (E2E 테스트)
- MSW (API Mocking)

---

### 🟡 Phase 2: 기능 확장 (Medium Priority)

#### 2.4 고급 분석 기능
**구현 범위:**
```
src/
├── app/dashboard/analytics/
│   ├── page.tsx              # 고급 분석 대시보드
│   ├── trends/page.tsx       # 트렌드 분석
│   ├── sentiment/page.tsx    # 감성 분석
│   └── predictions/page.tsx  # 예측 분석
├── components/charts/
│   ├── TrendLineChart.tsx    # 시계열 트렌드
│   ├── SentimentGauge.tsx    # 감성 지표
│   ├── ComparisonMatrix.tsx  # 경쟁사 비교
│   └── PredictionChart.tsx   # 예측 차트
└── lib/
    ├── sentiment-analyzer.ts  # 감성 분석 서비스
    └── trend-analyzer.ts      # 트렌드 분석 서비스
```

**기능 상세:**
- **감성 분석:** 뉴스 기사 긍정/부정/중립 분류
- **트렌드 분석:** 시간대별 뉴스 볼륨, 키워드 트렌드
- **경쟁사 비교:** 회사별 뉴스 커버리지 비교
- **예측 분석:** AI 기반 향후 트렌드 예측

---

#### 2.5 리포트 기능 강화
**현황:** 기본 주간 리포트만 존재

**구현 범위:**
```
src/
├── app/api/reports/
│   ├── export/route.ts       # PDF/Excel 내보내기
│   ├── schedule/route.ts     # 예약 발송
│   └── templates/route.ts    # 템플릿 관리
├── app/dashboard/reports/
│   ├── templates/page.tsx    # 템플릿 관리 UI
│   ├── scheduled/page.tsx    # 예약 리포트 관리
│   └── [id]/edit/page.tsx    # 리포트 편집
└── lib/
    ├── pdf-generator.ts      # PDF 생성
    ├── excel-generator.ts    # Excel 생성
    └── email-scheduler.ts    # 이메일 예약 발송
```

**기능 상세:**
- PDF/Excel 내보내기
- 커스텀 리포트 템플릿
- 예약 발송 (일간/주간/월간)
- 수신자 그룹 관리
- 리포트 편집 기능

---

#### 2.6 외부 서비스 연동
**구현 범위:**
```
src/
├── app/api/integrations/
│   ├── slack/route.ts        # Slack 웹훅
│   ├── teams/route.ts        # MS Teams 연동
│   └── calendar/route.ts     # 캘린더 연동
├── app/dashboard/settings/
│   └── integrations/page.tsx # 연동 설정 UI
└── lib/integrations/
    ├── slack-service.ts
    ├── teams-service.ts
    └── calendar-service.ts
```

**기능 상세:**
- **Slack 연동:** 중요 뉴스/인사이동 알림 채널 전송
- **MS Teams 연동:** 팀 채널 알림
- **캘린더 연동:** IR 이벤트, 주총 일정 자동 등록

---

### 🟢 Phase 3: 고도화 (Lower Priority)

#### 2.7 성능 최적화
```
구현 사항:
├── Redis 캐싱 레이어 추가
├── 이미지 최적화 (Next.js Image + CDN)
├── API 응답 캐싱 (stale-while-revalidate)
├── 데이터베이스 인덱스 최적화
├── 무한 스크롤 최적화
└── Server Components 활용 극대화
```

#### 2.8 관리자 대시보드
```
src/app/admin/
├── page.tsx                  # 관리자 메인
├── users/page.tsx            # 사용자 관리
├── crawlers/page.tsx         # 크롤러 상태 모니터링
├── system/page.tsx           # 시스템 헬스 체크
└── logs/page.tsx             # 로그 뷰어
```

#### 2.9 PWA (Progressive Web App)
```
구현 사항:
├── Service Worker 구현
├── 오프라인 지원
├── 앱 설치 프롬프트
├── 푸시 알림 (Web Push API)
└── 백그라운드 동기화
```

#### 2.10 다국어 지원 (i18n)
```
src/
├── i18n/
│   ├── ko.json               # 한국어
│   ├── en.json               # 영어
│   └── config.ts             # i18n 설정
└── components/
    └── LanguageSwitcher.tsx  # 언어 변경 UI
```

---

## 3. 데이터베이스 스키마 확장 제안

```prisma
// 알림 관련
model Notification {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  type        NotificationType
  title       String
  message     String
  link        String?
  isRead      Boolean  @default(false)
  createdAt   DateTime @default(now())
}

enum NotificationType {
  NEWS_ALERT
  PERSONNEL_CHANGE
  KEYWORD_MATCH
  REPORT_READY
  SYSTEM
}

// 감사 로그
model AuditLog {
  id          String   @id @default(cuid())
  userId      String?
  user        User?    @relation(fields: [userId], references: [id])
  action      String
  entityType  String
  entityId    String?
  details     Json?
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime @default(now())
}

// 리포트 템플릿
model ReportTemplate {
  id          String   @id @default(cuid())
  name        String
  description String?
  sections    Json
  createdBy   String
  user        User     @relation(fields: [createdBy], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// 예약 리포트
model ScheduledReport {
  id          String   @id @default(cuid())
  templateId  String
  template    ReportTemplate @relation(fields: [templateId], references: [id])
  schedule    String   // cron expression
  recipients  Json     // email list
  isActive    Boolean  @default(true)
  lastRunAt   DateTime?
  nextRunAt   DateTime?
  createdAt   DateTime @default(now())
}

// 감성 분석 결과
model NewsSentiment {
  id          String   @id @default(cuid())
  newsId      String   @unique
  news        News     @relation(fields: [newsId], references: [id])
  sentiment   Sentiment
  score       Float
  confidence  Float
  analyzedAt  DateTime @default(now())
}

enum Sentiment {
  POSITIVE
  NEGATIVE
  NEUTRAL
}
```

---

## 4. API 확장 계획

### 신규 API 엔드포인트
| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/alerts` | 사용자 알림 목록 |
| POST | `/api/alerts/settings` | 알림 설정 저장 |
| PATCH | `/api/alerts/[id]/read` | 알림 읽음 처리 |
| GET | `/api/analytics/trends` | 트렌드 분석 데이터 |
| GET | `/api/analytics/sentiment` | 감성 분석 결과 |
| POST | `/api/reports/export/pdf` | PDF 내보내기 |
| POST | `/api/reports/export/excel` | Excel 내보내기 |
| GET | `/api/reports/templates` | 리포트 템플릿 목록 |
| POST | `/api/reports/schedule` | 리포트 예약 |
| POST | `/api/integrations/slack/webhook` | Slack 웹훅 설정 |
| GET | `/api/admin/system/health` | 시스템 헬스 체크 |
| GET | `/api/admin/crawlers/status` | 크롤러 상태 |

---

## 5. 기술적 부채 해결

### 5.1 현재 식별된 기술적 부채
1. **타입 안전성:** 일부 API 응답에 `any` 타입 사용
2. **에러 처리:** 일관되지 않은 에러 핸들링 패턴
3. **코드 중복:** 여러 컴포넌트에서 유사한 로직 반복
4. **환경 변수:** 일부 하드코딩된 설정값
5. **접근성:** ARIA 속성 부족

### 5.2 해결 방안
```typescript
// 1. 타입 안전성 강화
// types/api.ts
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  pagination?: {
    total: number;
    page: number;
    limit: number;
  };
}

// 2. 통합 에러 핸들링
// lib/api-error.ts
export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500
  ) {
    super(message);
  }
}

// 3. 공통 유틸리티 추출
// lib/utils/date.ts
// lib/utils/format.ts
// lib/utils/validation.ts
```

---

## 6. 구현 우선순위 및 의존성

```
Phase 1 (핵심)
├── 2.3 테스트 코드 ──────────────────┐
├── 2.2 인증/보안 강화 ───────────────┤
└── 2.1 알림 시스템 ──────────────────┘
                                      │
                                      ▼
Phase 2 (확장)
├── 2.4 고급 분석 (감성분석 등)
├── 2.5 리포트 강화 (PDF/Excel)
└── 2.6 외부 연동 (Slack/Teams)
                                      │
                                      ▼
Phase 3 (고도화)
├── 2.7 성능 최적화
├── 2.8 관리자 대시보드
├── 2.9 PWA
└── 2.10 다국어 지원
```

---

## 7. 권장 즉시 구현 항목

다음 항목들은 현재 시스템의 가치를 크게 높일 수 있어 **즉시 구현을 권장**합니다:

### 7.1 알림 시스템 (MVP)
- 키워드 매칭 시 인앱 알림
- 헤더에 알림 뱃지 표시
- 알림 목록 페이지

### 7.2 PDF 내보내기
- 주간 리포트 PDF 다운로드
- 회사별 뉴스 리포트 PDF

### 7.3 뉴스 감성 분석
- Claude API를 활용한 감성 분류
- 대시보드에 감성 지표 표시

---

## 8. 결론

KOSCOM 금융영업부 Hub는 이미 상당히 완성도 높은 시스템입니다. 위의 개선 계획을 통해:

1. **신뢰성 강화:** 테스트 코드 및 보안 강화로 안정성 확보
2. **사용자 경험 향상:** 알림 시스템, 리포트 내보내기로 실용성 증대
3. **인텔리전스 강화:** 감성 분석, 트렌드 분석으로 인사이트 품질 향상
4. **운영 효율화:** 관리자 도구, 외부 연동으로 업무 효율 증대

를 달성할 수 있습니다.

---

**문서 끝**
