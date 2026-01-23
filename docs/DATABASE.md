# 데이터베이스 스키마

## ERD (Entity Relationship Diagram)

```
┌─────────────────────┐     ┌─────────────────────┐
│  SecuritiesCompany  │     │        User         │
├─────────────────────┤     ├─────────────────────┤
│ id (PK)             │     │ id (PK)             │
│ name                │     │ email               │
│ code                │     │ password            │
│ logoUrl             │     │ name                │
│ websiteUrl          │     │ role                │
│ newsroomUrl         │     │ status              │
│ isActive            │     │ department          │
│ isPowerbaseClient   │     │ position            │
│ createdAt           │     │ employeeId          │
│ updatedAt           │     │ createdAt           │
└──────────┬──────────┘     │ lastLoginAt         │
           │                └──────────┬──────────┘
           │                           │
    ┌──────┴──────┐             ┌──────┴──────┐
    │             │             │             │
    ▼             ▼             ▼             ▼
┌─────────┐ ┌──────────────┐ ┌───────────┐ ┌──────────────┐
│  News   │ │PersonnelChange│ │Notification│ │ KeywordAlert │
├─────────┤ ├──────────────┤ ├───────────┤ ├──────────────┤
│ id (PK) │ │ id (PK)       │ │ id (PK)   │ │ id (PK)      │
│companyId│ │ companyId(FK) │ │ userId    │ │ userId       │
│ title   │ │ personName    │ │ type      │ │ keywordId    │
│ content │ │ position      │ │ title     │ │ isActive     │
│ summary │ │ department    │ │ message   │ └──────────────┘
│sourceUrl│ │ changeType    │ │ isRead    │
│category │ │ effectiveDate │ └───────────┘
│publishedAt│ │ announcedAt  │
└─────────┘ └──────────────┘

┌─────────────────────┐     ┌─────────────────────┐
│  CustomerContract   │────▶│   ServiceContract   │
├─────────────────────┤     ├─────────────────────┤
│ id (PK)             │     │ id (PK)             │
│ companyId (FK)      │     │ contractId (FK)     │
│ orderNumber         │     │ serviceCode         │
│ category            │     │ serviceName         │
│ customerType        │     │ amount              │
│ currentRevenue      │     │ status              │
│ powerbaseRevenue    │     └─────────────────────┘
│ year2025Revenue     │
└─────────────────────┘

┌─────────────────────┐
│    WeeklyReport     │
├─────────────────────┤
│ id (PK)             │
│ weekStart           │
│ weekEnd             │
│ businessSummary     │
│ personnelSummary    │
│ productSummary      │
│ executiveSummary    │
│ status              │
└─────────────────────┘
```

## 테이블 상세

### SecuritiesCompany (증권사)

증권사 마스터 데이터를 저장합니다.

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| id | String | PK, CUID | 고유 식별자 |
| name | String | UNIQUE | 회사명 (예: 삼성증권) |
| code | String? | UNIQUE | 회사 코드 |
| logoUrl | String? | - | 로고 이미지 URL |
| websiteUrl | String? | - | 공식 홈페이지 URL |
| newsroomUrl | String? | - | 뉴스룸 페이지 URL |
| isActive | Boolean | DEFAULT true | 활성화 여부 |
| isPowerbaseClient | Boolean | DEFAULT false | Powerbase 고객사 여부 |
| createdAt | DateTime | DEFAULT now() | 생성 시각 |
| updatedAt | DateTime | @updatedAt | 수정 시각 |

**관계**:
- `news` → News[] (1:N)
- `personnel` → PersonnelChange[] (1:N)
- `contracts` → CustomerContract[] (1:N)
- `favorites` → UserFavorite[] (N:M via pivot)
- `companyAlerts` → CompanyAlert[] (N:M via pivot)

### News (뉴스/보도자료)

증권사 관련 뉴스 및 보도자료를 저장합니다.

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| id | String | PK, CUID | 고유 식별자 |
| companyId | String | FK | 증권사 ID |
| title | String | NOT NULL | 뉴스 제목 |
| content | String? | - | 본문 내용 |
| summary | String? | - | AI 요약 |
| sourceUrl | String | NOT NULL | 원문 링크 |
| sourceName | String? | - | 출처명 |
| imageUrl | String? | - | 대표 이미지 URL |
| category | String | DEFAULT 'GENERAL' | 카테고리 |
| isPersonnel | Boolean | DEFAULT false | 인사 관련 여부 |
| publishedAt | DateTime | NOT NULL | 기사 발행일 |
| crawledAt | DateTime | DEFAULT now() | 크롤링 시각 |
| createdAt | DateTime | DEFAULT now() | 생성 시각 |
| updatedAt | DateTime | @updatedAt | 수정 시각 |

**카테고리 값**:
- `GENERAL` - 일반
- `PERSONNEL` - 인사
- `BUSINESS` - 실적/사업
- `PRODUCT` - 상품/서비스
- `IR` - IR/공시
- `EVENT` - 이벤트

**인덱스**:
- `companyId`
- `publishedAt`
- `category`
- `isPersonnel`

### PersonnelChange (인사 변동)

증권사 임직원 인사 변동 정보를 저장합니다.

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| id | String | PK, CUID | 고유 식별자 |
| companyId | String | FK | 증권사 ID |
| personName | String | NOT NULL | 인물명 |
| position | String? | - | 직책 |
| department | String? | - | 부서 |
| changeType | String | NOT NULL | 변동 유형 |
| previousPosition | String? | - | 이전 직책 |
| sourceUrl | String? | - | 출처 링크 |
| effectiveDate | DateTime? | - | 발령일 |
| announcedAt | DateTime | NOT NULL | 발표일 |
| createdAt | DateTime | DEFAULT now() | 생성 시각 |
| updatedAt | DateTime | @updatedAt | 수정 시각 |

**changeType 값**:
- `APPOINTMENT` - 신규임명
- `PROMOTION` - 승진
- `TRANSFER` - 전보
- `RESIGNATION` - 사임
- `RETIREMENT` - 퇴임

**인덱스**:
- `companyId`
- `announcedAt`
- `changeType`

### User (사용자)

시스템 사용자 (KOSCOM 직원) 정보를 저장합니다.

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| id | String | PK, CUID | 고유 식별자 |
| email | String | UNIQUE | 이메일 |
| password | String? | - | 해시된 비밀번호 (bcrypt) |
| name | String? | - | 이름 |
| role | UserRole | DEFAULT USER | 역할 |
| status | UserStatus | DEFAULT PENDING | 상태 |
| approvedAt | DateTime? | - | 승인 시각 |
| approvedBy | String? | - | 승인자 ID |
| rejectedAt | DateTime? | - | 거절 시각 |
| rejectReason | String? | - | 거절 사유 |
| department | String? | - | 부서 |
| position | String? | - | 직책 |
| employeeId | String? | - | 사번 |
| createdAt | DateTime | DEFAULT now() | 생성 시각 |
| updatedAt | DateTime | @updatedAt | 수정 시각 |
| lastLoginAt | DateTime? | - | 마지막 로그인 시각 |

### CustomerContract (고객사 계약)

Powerbase 고객사의 계약 현황을 저장합니다.

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| id | String | PK, CUID | 고유 식별자 |
| companyId | String | FK | 증권사 ID |
| orderNumber | Int | NOT NULL | 순번 |
| category | String | NOT NULL | 구분 |
| customerType | String | NOT NULL | 고객 분류 |
| progressNotes | String? | - | 진행 사항 |
| currentRevenue | Decimal? | - | 당기 매출 (억원) |
| powerbaseRevenue | Decimal? | - | Powerbase 매출 (억원) |
| year2025Revenue | Decimal? | - | 2025년 매출 (억원) |
| contractYear | Int | DEFAULT 2025 | 계약 연도 |
| createdAt | DateTime | DEFAULT now() | 생성 시각 |
| updatedAt | DateTime | @updatedAt | 수정 시각 |

**category 값**:
- `DOMESTIC` - 국내
- `FOREIGN` - 해외
- `MIGRATED` - 이관

**customerType 값**:
- `SECURITIES` - 증권사
- `INSTITUTION` - 기관
- `ASSET_MGMT` - 자산운용사
- `FUTURES` - 선물사
- `MEDIA` - 미디어

**인덱스**:
- `companyId`
- `category`
- `customerType`

### ServiceContract (서비스 계약)

고객사별 Powerbase 서비스 계약 상세를 저장합니다.

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| id | String | PK, CUID | 고유 식별자 |
| contractId | String | FK | 계약 ID |
| serviceCode | String | NOT NULL | 서비스 코드 |
| serviceName | String | NOT NULL | 서비스명 |
| amount | Decimal? | - | 계약 금액 (억원) |
| status | String | NOT NULL | 계약 상태 |
| createdAt | DateTime | DEFAULT now() | 생성 시각 |

**status 값**:
- `CONTRACTED` - 계약 완료
- `NEGOTIATING` - 협상 중
- `PENDING` - 대기

**인덱스**:
- `contractId`
- `serviceCode`

### WeeklyReport (주간 리포트)

자동 생성된 주간 요약 리포트를 저장합니다.

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| id | String | PK, CUID | 고유 식별자 |
| weekStart | DateTime | NOT NULL | 주간 시작일 |
| weekEnd | DateTime | NOT NULL | 주간 종료일 |
| businessSummary | String? | - | 실적/사업 동향 |
| personnelSummary | String? | - | 인사 동향 |
| productSummary | String? | - | 상품/서비스 동향 |
| irSummary | String? | - | IR/공시 동향 |
| eventSummary | String? | - | 이벤트 동향 |
| generalSummary | String? | - | 일반 동향 |
| executiveSummary | String? | - | 주요 하이라이트 |
| closingRemarks | String? | - | 마무리 멘트 |
| totalNewsCount | Int | DEFAULT 0 | 총 뉴스 수 |
| companyMentions | String? | - | 증권사별 언급 횟수 (JSON) |
| status | String | DEFAULT 'DRAFT' | 상태 |
| createdAt | DateTime | DEFAULT now() | 생성 시각 |
| updatedAt | DateTime | @updatedAt | 수정 시각 |
| publishedAt | DateTime? | - | 발행 시각 |

**UNIQUE 제약**: `(weekStart, weekEnd)`

**인덱스**:
- `weekStart`
- `status`

### Notification (알림)

사용자별 알림을 저장합니다.

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| id | String | PK, CUID | 고유 식별자 |
| userId | String | FK | 사용자 ID |
| type | String | NOT NULL | 알림 유형 |
| title | String | NOT NULL | 알림 제목 |
| message | String | NOT NULL | 알림 메시지 |
| linkType | String? | - | 링크 유형 |
| linkId | String? | - | 링크 대상 ID |
| isRead | Boolean | DEFAULT false | 읽음 여부 |
| createdAt | DateTime | DEFAULT now() | 생성 시각 |

**type 값**:
- `KEYWORD_MATCH` - 키워드 매칭
- `COMPANY_NEWS` - 관심 증권사 뉴스
- `PERSONNEL_CHANGE` - 인사 변동
- `WEEKLY_REPORT` - 주간 리포트
- `SYSTEM` - 시스템 알림

**인덱스**:
- `userId`
- `isRead`
- `createdAt`

## Enum 타입

### UserRole

```prisma
enum UserRole {
  USER        // 일반 사용자
  ADMIN       // 관리자
  SUPER_ADMIN // 최고 관리자
}
```

### UserStatus

```prisma
enum UserStatus {
  PENDING   // 승인 대기
  APPROVED  // 승인됨
  REJECTED  // 거절됨
  SUSPENDED // 정지됨
}
```

## Prisma 명령어

### 스키마 관리

```bash
# 스키마 변경 사항 적용 (개발용, 데이터 손실 가능)
npm run db:push

# 마이그레이션 생성 및 적용 (프로덕션용)
npm run db:migrate

# 마이그레이션 파일만 생성
npx prisma migrate dev --create-only --name migration_name

# 프로덕션 마이그레이션 적용
npx prisma migrate deploy
```

### 데이터 조회/관리

```bash
# Prisma Studio 실행
npm run db:studio

# 시드 데이터 적용
npm run db:seed

# 스키마 검증
npx prisma validate

# 클라이언트 재생성
npx prisma generate
```

### 마이그레이션 이력

```bash
# 마이그레이션 상태 확인
npx prisma migrate status

# 마이그레이션 리셋 (개발 환경 전용)
npx prisma migrate reset
```

## 테이블 매핑

Prisma 모델명과 실제 테이블명 매핑:

| Prisma 모델 | PostgreSQL 테이블 |
|-------------|------------------|
| SecuritiesCompany | securities_companies |
| News | news |
| PersonnelChange | personnel_changes |
| Keyword | keywords |
| NewsKeyword | news_keywords |
| User | users |
| Account | accounts |
| Session | sessions |
| VerificationToken | verification_tokens |
| UserFavorite | user_favorites |
| KeywordAlert | keyword_alerts |
| CrawlLog | crawl_logs |
| ServiceMaster | service_masters |
| CustomerContract | customer_contracts |
| ServiceContract | service_contracts |
| WeeklyReport | weekly_reports |
| Notification | notifications |
| CompanyAlert | company_alerts |
