# 알림 시스템 & PDF 내보내기 상세 구현 계획서

**작성일:** 2026-01-20
**버전:** 1.0
**예상 구현 범위:** 2개 주요 기능

---

## 목차
1. [알림 시스템 구현 계획](#1-알림-시스템-구현-계획)
2. [PDF 내보내기 구현 계획](#2-pdf-내보내기-구현-계획)
3. [구현 순서 및 의존성](#3-구현-순서-및-의존성)
4. [테스트 계획](#4-테스트-계획)

---

## 1. 알림 시스템 구현 계획

### 1.1 기능 개요

사용자가 설정한 키워드 또는 관심 회사에 대한 뉴스/인사이동이 발생하면 실시간 알림을 제공하는 시스템

**핵심 기능:**
- 키워드 기반 알림 (예: "IPO", "인수합병", "대표이사")
- 관심 회사 뉴스 알림
- 인사이동 발생 알림
- 인앱 알림 센터
- 알림 읽음/삭제 처리

---

### 1.2 데이터베이스 스키마

```prisma
// prisma/schema.prisma에 추가

// 알림 (Notification)
model Notification {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  type        NotificationType
  title       String
  message     String

  // 관련 엔티티 링크
  linkType    LinkType?        // NEWS, PERSONNEL, COMPANY
  linkId      String?          // 해당 엔티티의 ID

  isRead      Boolean  @default(false)
  createdAt   DateTime @default(now())

  @@index([userId])
  @@index([isRead])
  @@index([createdAt])
  @@map("notifications")
}

enum NotificationType {
  KEYWORD_MATCH      // 키워드 매칭
  COMPANY_NEWS       // 관심 회사 뉴스
  PERSONNEL_CHANGE   // 인사이동
  WEEKLY_REPORT      // 주간 리포트 발행
  SYSTEM             // 시스템 알림
}

enum LinkType {
  NEWS
  PERSONNEL
  COMPANY
  REPORT
}

// 회사 알림 설정 (기존 UserFavorite 활용 또는 별도 모델)
model CompanyAlert {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  companyId   String
  company     SecuritiesCompany @relation(fields: [companyId], references: [id], onDelete: Cascade)

  alertOnNews      Boolean @default(true)   // 뉴스 알림
  alertOnPersonnel Boolean @default(true)   // 인사이동 알림

  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())

  @@unique([userId, companyId])
  @@map("company_alerts")
}

// User 모델에 관계 추가
model User {
  // ... 기존 필드
  notifications  Notification[]
  companyAlerts  CompanyAlert[]
}
```

---

### 1.3 API 엔드포인트

#### A. 알림 조회 및 관리

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/alerts` | 사용자 알림 목록 조회 |
| PATCH | `/api/alerts/[id]/read` | 알림 읽음 처리 |
| PATCH | `/api/alerts/read-all` | 모든 알림 읽음 처리 |
| DELETE | `/api/alerts/[id]` | 알림 삭제 |
| GET | `/api/alerts/unread-count` | 읽지 않은 알림 개수 |

#### B. 알림 설정

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/alerts/settings` | 알림 설정 조회 |
| POST | `/api/alerts/settings/keywords` | 키워드 알림 추가 |
| DELETE | `/api/alerts/settings/keywords/[id]` | 키워드 알림 삭제 |
| POST | `/api/alerts/settings/companies` | 회사 알림 추가 |
| PATCH | `/api/alerts/settings/companies/[id]` | 회사 알림 수정 |
| DELETE | `/api/alerts/settings/companies/[id]` | 회사 알림 삭제 |

---

### 1.4 파일 구조

```
src/
├── app/
│   └── api/
│       └── alerts/
│           ├── route.ts                    # GET: 알림 목록
│           ├── unread-count/
│           │   └── route.ts                # GET: 읽지 않은 개수
│           ├── read-all/
│           │   └── route.ts                # PATCH: 전체 읽음
│           ├── [id]/
│           │   ├── route.ts                # DELETE: 알림 삭제
│           │   └── read/
│           │       └── route.ts            # PATCH: 읽음 처리
│           └── settings/
│               ├── route.ts                # GET: 설정 조회
│               ├── keywords/
│               │   ├── route.ts            # POST: 키워드 추가
│               │   └── [id]/
│               │       └── route.ts        # DELETE: 키워드 삭제
│               └── companies/
│                   ├── route.ts            # POST: 회사 알림 추가
│                   └── [id]/
│                       └── route.ts        # PATCH, DELETE
│
├── components/
│   └── features/
│       └── alerts/
│           ├── AlertBell.tsx               # 헤더 알림 벨 아이콘
│           ├── AlertDropdown.tsx           # 알림 드롭다운 목록
│           ├── AlertItem.tsx               # 개별 알림 아이템
│           ├── AlertSettingsDialog.tsx     # 알림 설정 다이얼로그
│           ├── KeywordAlertForm.tsx        # 키워드 알림 추가 폼
│           └── CompanyAlertList.tsx        # 회사 알림 목록
│
├── hooks/
│   └── use-alerts.ts                       # 알림 관련 React Query 훅
│
├── services/
│   └── api.ts                              # alertsApi 추가
│
├── lib/
│   └── notification-service.ts             # 알림 생성 서비스
│
└── types/
    └── alerts.ts                           # 알림 타입 정의
```

---

### 1.5 주요 컴포넌트 상세

#### A. AlertBell.tsx (헤더 알림 버튼)

```typescript
// 기능:
// - 읽지 않은 알림 개수 뱃지 표시
// - 클릭 시 드롭다운 토글
// - 5분마다 자동 폴링으로 새 알림 확인

interface AlertBellProps {
  className?: string;
}

// 사용 위치: Header 컴포넌트
```

#### B. AlertDropdown.tsx (알림 드롭다운)

```typescript
// 기능:
// - 최근 알림 10개 표시
// - 무한 스크롤 또는 "더보기" 버튼
// - 전체 읽음 처리 버튼
// - 알림 설정 버튼

interface AlertDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}
```

#### C. AlertItem.tsx (개별 알림)

```typescript
// 기능:
// - 알림 타입별 아이콘 표시
// - 읽음/안읽음 상태 시각화
// - 클릭 시 해당 페이지로 이동
// - 삭제 버튼

interface AlertItemProps {
  notification: Notification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
}
```

---

### 1.6 알림 트리거 로직

```typescript
// lib/notification-service.ts

export class NotificationService {

  // 뉴스 크롤링 후 알림 생성
  async processNewsNotifications(news: News): Promise<void> {
    // 1. 키워드 알림 체크
    const matchedKeywords = await this.findMatchingKeywords(news);
    for (const alert of matchedKeywords) {
      await this.createNotification({
        userId: alert.userId,
        type: 'KEYWORD_MATCH',
        title: `키워드 "${alert.keyword.name}" 매칭`,
        message: news.title,
        linkType: 'NEWS',
        linkId: news.id,
      });
    }

    // 2. 회사 알림 체크
    const companyAlerts = await this.findCompanyAlerts(news.companyId);
    for (const alert of companyAlerts) {
      if (alert.alertOnNews) {
        await this.createNotification({
          userId: alert.userId,
          type: 'COMPANY_NEWS',
          title: `${news.company.name} 새 뉴스`,
          message: news.title,
          linkType: 'NEWS',
          linkId: news.id,
        });
      }
    }
  }

  // 인사이동 알림 생성
  async processPersonnelNotifications(personnel: PersonnelChange): Promise<void> {
    const companyAlerts = await this.findCompanyAlerts(personnel.companyId);
    for (const alert of companyAlerts) {
      if (alert.alertOnPersonnel) {
        await this.createNotification({
          userId: alert.userId,
          type: 'PERSONNEL_CHANGE',
          title: `${personnel.company.name} 인사이동`,
          message: `${personnel.personName} ${personnel.position} ${this.getChangeTypeLabel(personnel.changeType)}`,
          linkType: 'PERSONNEL',
          linkId: personnel.id,
        });
      }
    }
  }
}
```

---

### 1.7 React Query 훅

```typescript
// hooks/use-alerts.ts

// 알림 목록 조회
export function useAlerts(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['alerts', params],
    queryFn: () => alertsApi.getAll(params),
    staleTime: 1000 * 60, // 1분
  });
}

// 읽지 않은 알림 개수
export function useUnreadCount() {
  return useQuery({
    queryKey: ['alerts', 'unread-count'],
    queryFn: () => alertsApi.getUnreadCount(),
    refetchInterval: 1000 * 60 * 5, // 5분마다 폴링
  });
}

// 알림 읽음 처리
export function useMarkAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => alertsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
}

// 전체 읽음 처리
export function useMarkAllAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => alertsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
}

// 알림 설정 조회
export function useAlertSettings() {
  return useQuery({
    queryKey: ['alerts', 'settings'],
    queryFn: () => alertsApi.getSettings(),
  });
}

// 키워드 알림 추가
export function useAddKeywordAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (keyword: string) => alertsApi.addKeywordAlert(keyword),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts', 'settings'] });
    },
  });
}
```

---

## 2. PDF 내보내기 구현 계획

### 2.1 기능 개요

주간 리포트 및 회사별 뉴스를 PDF 형식으로 내보내는 기능

**핵심 기능:**
- 주간 리포트 PDF 다운로드
- 회사별 뉴스 리포트 PDF 생성
- 커스텀 날짜 범위 리포트 PDF
- 브랜딩 적용 (KOSCOM 로고, 헤더/푸터)

---

### 2.2 기술 스택 선택

#### 옵션 비교

| 라이브러리 | 장점 | 단점 | 선택 |
|-----------|------|------|------|
| **@react-pdf/renderer** | React 컴포넌트로 PDF 작성, 스타일링 용이 | 서버사이드 생성 복잡 | ⭐ 선택 |
| jsPDF | 가볍고 클라이언트 사이드 | 복잡한 레이아웃 어려움 | - |
| Puppeteer + HTML | 완벽한 렌더링 | 무겁고 서버 리소스 사용 | - |
| pdfkit | Node.js 네이티브 | 스타일링 복잡 | - |

**선택: `@react-pdf/renderer`**
- React 컴포넌트 방식으로 직관적인 PDF 작성
- Tailwind 유사 스타일링
- 클라이언트/서버 양쪽 지원

---

### 2.3 파일 구조

```
src/
├── app/
│   └── api/
│       └── reports/
│           └── export/
│               ├── route.ts                # POST: PDF 생성 (서버사이드)
│               └── weekly/
│                   └── route.ts            # GET: 주간 리포트 PDF
│
├── components/
│   └── pdf/
│       ├── PDFDocument.tsx                 # 기본 PDF 문서 래퍼
│       ├── PDFHeader.tsx                   # KOSCOM 브랜드 헤더
│       ├── PDFFooter.tsx                   # 페이지 번호 푸터
│       ├── WeeklyReportPDF.tsx             # 주간 리포트 PDF 레이아웃
│       ├── CompanyNewsPDF.tsx              # 회사별 뉴스 PDF 레이아웃
│       └── styles.ts                       # PDF 공통 스타일
│
├── lib/
│   └── pdf-generator.ts                    # PDF 생성 유틸리티
│
└── types/
    └── pdf.ts                              # PDF 관련 타입
```

---

### 2.4 PDF 컴포넌트 상세

#### A. 기본 문서 구조 (PDFDocument.tsx)

```typescript
import { Document, Page, StyleSheet } from '@react-pdf/renderer';
import { PDFHeader } from './PDFHeader';
import { PDFFooter } from './PDFFooter';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    paddingBottom: 60,
    fontFamily: 'NotoSansKR', // 한글 폰트
    fontSize: 10,
    lineHeight: 1.6,
  },
});

interface PDFDocumentProps {
  title: string;
  children: React.ReactNode;
}

export function PDFDocument({ title, children }: PDFDocumentProps) {
  return (
    <Document title={title} author="KOSCOM 금융영업부">
      <Page size="A4" style={styles.page}>
        <PDFHeader />
        {children}
        <PDFFooter />
      </Page>
    </Document>
  );
}
```

#### B. 주간 리포트 PDF (WeeklyReportPDF.tsx)

```typescript
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { PDFDocument } from './PDFDocument';

interface WeeklyReportPDFProps {
  report: WeeklyReport;
}

export function WeeklyReportPDF({ report }: WeeklyReportPDFProps) {
  return (
    <PDFDocument title={`주간 증권사 동향 리포트`}>
      {/* 리포트 기간 */}
      <View style={styles.dateRange}>
        <Text>{formatDate(report.weekStart)} ~ {formatDate(report.weekEnd)}</Text>
      </View>

      {/* 핵심 요약 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 주간 핵심 요약</Text>
        <Text style={styles.content}>{report.executiveSummary}</Text>
      </View>

      {/* 통계 박스 */}
      <View style={styles.statsBox}>
        <Text>총 {report.totalNewsCount}건의 뉴스 분석</Text>
      </View>

      {/* 카테고리별 요약 */}
      {report.businessSummary && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💼 실적/사업 동향</Text>
          <Text style={styles.content}>{report.businessSummary}</Text>
        </View>
      )}

      {report.personnelSummary && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👥 인사 동향</Text>
          <Text style={styles.content}>{report.personnelSummary}</Text>
        </View>
      )}

      {/* ... 나머지 카테고리 */}

      {/* 주요 증권사 */}
      {report.companyMentions && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏢 이번 주 주요 증권사</Text>
          <View style={styles.companyList}>
            {Object.entries(report.companyMentions)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 10)
              .map(([name, count]) => (
                <Text key={name} style={styles.companyItem}>
                  • {name}: {count}건
                </Text>
              ))}
          </View>
        </View>
      )}

      {/* 다음 주 전망 */}
      {report.closingRemarks && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔮 다음 주 전망</Text>
          <Text style={styles.content}>{report.closingRemarks}</Text>
        </View>
      )}
    </PDFDocument>
  );
}
```

#### C. 회사별 뉴스 PDF (CompanyNewsPDF.tsx)

```typescript
interface CompanyNewsPDFProps {
  company: SecuritiesCompany;
  news: News[];
  dateRange: { start: Date; end: Date };
}

export function CompanyNewsPDF({ company, news, dateRange }: CompanyNewsPDFProps) {
  return (
    <PDFDocument title={`${company.name} 뉴스 리포트`}>
      {/* 회사 정보 */}
      <View style={styles.companyHeader}>
        <Text style={styles.companyName}>{company.name}</Text>
        <Text style={styles.dateRange}>
          {formatDate(dateRange.start)} ~ {formatDate(dateRange.end)}
        </Text>
      </View>

      {/* 요약 통계 */}
      <View style={styles.statsBox}>
        <Text>총 {news.length}건의 뉴스</Text>
        <Text>
          인사 관련: {news.filter(n => n.isPersonnel).length}건
        </Text>
      </View>

      {/* 뉴스 목록 */}
      {news.map((item, index) => (
        <View key={item.id} style={styles.newsItem}>
          <Text style={styles.newsIndex}>{index + 1}</Text>
          <View style={styles.newsContent}>
            <Text style={styles.newsTitle}>{item.title}</Text>
            <Text style={styles.newsMeta}>
              {formatDate(item.publishedAt)} | {item.sourceName}
            </Text>
            {item.summary && (
              <Text style={styles.newsSummary}>{item.summary}</Text>
            )}
          </View>
        </View>
      ))}
    </PDFDocument>
  );
}
```

---

### 2.5 API 엔드포인트

#### A. 주간 리포트 PDF 다운로드

```typescript
// app/api/reports/export/weekly/route.ts

import { renderToBuffer } from '@react-pdf/renderer';
import { WeeklyReportPDF } from '@/components/pdf/WeeklyReportPDF';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reportId = searchParams.get('id');

  // 리포트 조회
  const report = reportId
    ? await getReportById(reportId)
    : await getLatestReport();

  if (!report) {
    return NextResponse.json(
      { error: '리포트를 찾을 수 없습니다.' },
      { status: 404 }
    );
  }

  // PDF 생성
  const pdfBuffer = await renderToBuffer(
    <WeeklyReportPDF report={report} />
  );

  // 파일명 생성
  const filename = `주간리포트_${format(new Date(report.weekStart), 'yyyyMMdd')}.pdf`;

  return new Response(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
    },
  });
}
```

#### B. 회사별 뉴스 PDF

```typescript
// app/api/reports/export/company/route.ts

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  // 데이터 조회
  const company = await getCompanyById(companyId);
  const news = await getNewsByCompany(companyId, { startDate, endDate });

  // PDF 생성
  const pdfBuffer = await renderToBuffer(
    <CompanyNewsPDF
      company={company}
      news={news}
      dateRange={{ start: new Date(startDate), end: new Date(endDate) }}
    />
  );

  const filename = `${company.name}_뉴스리포트_${format(new Date(), 'yyyyMMdd')}.pdf`;

  return new Response(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
    },
  });
}
```

---

### 2.6 UI 컴포넌트

#### A. PDF 다운로드 버튼 (주간 리포트 페이지)

```typescript
// components/features/reports/PDFDownloadButton.tsx

interface PDFDownloadButtonProps {
  reportId?: string;
  variant?: 'primary' | 'secondary';
}

export function PDFDownloadButton({ reportId, variant = 'primary' }: PDFDownloadButtonProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setDownloading(true);

      const url = reportId
        ? `/api/reports/export/weekly?id=${reportId}`
        : '/api/reports/export/weekly';

      const response = await fetch(url);
      const blob = await response.blob();

      // 다운로드 트리거
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `주간리포트.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

    } catch (error) {
      console.error('PDF 다운로드 실패:', error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
        variant === 'primary'
          ? "bg-red-600 text-white hover:bg-red-700"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      )}
    >
      {downloading ? (
        <>
          <RefreshCw className="w-4 h-4 animate-spin" />
          다운로드 중...
        </>
      ) : (
        <>
          <FileDown className="w-4 h-4" />
          PDF 다운로드
        </>
      )}
    </button>
  );
}
```

---

### 2.7 한글 폰트 설정

```typescript
// lib/pdf-fonts.ts

import { Font } from '@react-pdf/renderer';

// 한글 폰트 등록 (Google Fonts CDN 또는 로컬)
Font.register({
  family: 'NotoSansKR',
  fonts: [
    {
      src: '/fonts/NotoSansKR-Regular.ttf',
      fontWeight: 'normal',
    },
    {
      src: '/fonts/NotoSansKR-Bold.ttf',
      fontWeight: 'bold',
    },
  ],
});

// 또는 CDN 사용
Font.register({
  family: 'NotoSansKR',
  src: 'https://fonts.gstatic.com/s/notosanskr/v36/PbyxFmXiEBPT4ITbgNA5Cgms3VYcOA-vvnIzzuoyeLGq.woff2',
});
```

---

## 3. 구현 순서 및 의존성

### 3.1 구현 순서

```
Week 1: 알림 시스템 기반
├── Day 1-2: DB 스키마 추가 및 마이그레이션
├── Day 3-4: 알림 API 구현 (CRUD)
└── Day 5: 알림 서비스 로직 구현

Week 2: 알림 시스템 UI
├── Day 1-2: AlertBell, AlertDropdown 컴포넌트
├── Day 3-4: 알림 설정 UI
└── Day 5: 통합 테스트 및 버그 수정

Week 3: PDF 내보내기
├── Day 1: @react-pdf/renderer 설정, 폰트 등록
├── Day 2-3: 주간 리포트 PDF 컴포넌트
├── Day 4: 회사별 뉴스 PDF 컴포넌트
└── Day 5: API 엔드포인트 및 다운로드 UI
```

### 3.2 의존성 다이어그램

```
[Prisma Schema]
      │
      ▼
[Notification Service] ◄── [News Crawler]
      │                    [Personnel Crawler]
      ▼
[Alerts API]
      │
      ▼
[use-alerts.ts Hook]
      │
      ▼
[Alert Components]
      │
      ▼
[Header Integration]

---

[PDF Components] ──► [@react-pdf/renderer]
      │                    [한글 폰트]
      ▼
[PDF Export API]
      │
      ▼
[Download Button]
      │
      ▼
[Reports Page Integration]
```

---

## 4. 테스트 계획

### 4.1 알림 시스템 테스트

```typescript
// __tests__/api/alerts.test.ts

describe('Alerts API', () => {
  it('사용자 알림 목록을 조회할 수 있다', async () => {});
  it('알림을 읽음 처리할 수 있다', async () => {});
  it('모든 알림을 읽음 처리할 수 있다', async () => {});
  it('알림을 삭제할 수 있다', async () => {});
  it('읽지 않은 알림 개수를 조회할 수 있다', async () => {});
});

describe('Notification Service', () => {
  it('뉴스가 키워드와 매칭되면 알림이 생성된다', async () => {});
  it('관심 회사 뉴스가 발생하면 알림이 생성된다', async () => {});
  it('인사이동이 발생하면 알림이 생성된다', async () => {});
});
```

### 4.2 PDF 내보내기 테스트

```typescript
// __tests__/api/pdf-export.test.ts

describe('PDF Export API', () => {
  it('주간 리포트 PDF를 생성할 수 있다', async () => {});
  it('회사별 뉴스 PDF를 생성할 수 있다', async () => {});
  it('한글이 올바르게 렌더링된다', async () => {});
  it('리포트가 없으면 404를 반환한다', async () => {});
});
```

---

## 5. 필요 패키지

```bash
# 알림 시스템
# (기존 패키지로 충분)

# PDF 내보내기
npm install @react-pdf/renderer

# 한글 폰트 (선택)
# public/fonts/NotoSansKR-*.ttf 다운로드
```

---

## 6. 예상 결과물

### 6.1 알림 시스템
- 헤더에 알림 벨 아이콘 (읽지 않은 개수 뱃지)
- 클릭 시 드롭다운으로 최근 알림 표시
- 알림 설정 페이지 (키워드, 회사 알림 관리)
- 뉴스/인사이동 발생 시 자동 알림 생성

### 6.2 PDF 내보내기
- 주간 리포트 페이지에 "PDF 다운로드" 버튼
- 회사 상세 페이지에 "뉴스 리포트 PDF" 버튼
- KOSCOM 브랜딩이 적용된 깔끔한 PDF 문서

---

**문서 끝**
