# API 명세서

## 공통 사항

### 기본 URL

- 로컬: `http://localhost:3000/api`
- 프로덕션: `https://your-domain.vercel.app/api`

### 응답 형식

모든 API는 다음 형식으로 응답합니다:

```json
{
  "success": true,
  "data": { ... },
  "message": "선택적 메시지"
}
```

에러 응답:
```json
{
  "success": false,
  "error": "에러 메시지"
}
```

### 페이지네이션 응답

```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5,
      "hasMore": true
    }
  }
}
```

### 인증

대부분의 API는 NextAuth 세션 기반 인증이 필요합니다. 인증이 필요한 엔드포인트에서 세션이 없으면 401 에러를 반환합니다.

---

## 인증 API

### POST `/api/auth/register`

회원가입 신청

**Request Body:**
```json
{
  "email": "user@koscom.co.kr",
  "password": "password123",
  "name": "홍길동",
  "department": "금융영업부",
  "position": "과장",
  "employeeId": "K12345"
}
```

**필수 필드:** `email`, `password`, `name`

**Response:**
```json
{
  "success": true,
  "message": "회원가입 신청이 완료되었습니다. 관리자 승인 후 이용 가능합니다."
}
```

### POST `/api/auth/[...nextauth]`

NextAuth 인증 엔드포인트

- `GET /api/auth/session` - 현재 세션 조회
- `POST /api/auth/signin` - 로그인
- `POST /api/auth/signout` - 로그아웃

**로그인 Request:**
```json
{
  "email": "user@koscom.co.kr",
  "password": "password123"
}
```

---

## 뉴스 API

### GET `/api/news`

뉴스 목록 조회

**Query Parameters:**

| 파라미터 | 타입 | 기본값 | 설명 |
|---------|------|-------|------|
| page | number | 1 | 페이지 번호 |
| limit | number | 20 | 페이지당 항목 수 (최대 100) |
| companyIds | string | - | 쉼표로 구분된 증권사 ID |
| categories | string | - | 쉼표로 구분된 카테고리 |
| isPersonnel | boolean | - | 인사 뉴스만 필터 |
| isPowerbaseOnly | boolean | false | Powerbase 고객사만 |
| keyword | string | - | 검색 키워드 |
| dateRange | string | 1week | today, 3days, 1week, 1month, all |

**Example:**
```
GET /api/news?page=1&limit=20&categories=BUSINESS,PERSONNEL&dateRange=1week
```

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "cuid123",
        "title": "삼성증권, 1분기 실적 발표",
        "summary": "삼성증권이 1분기 영업이익...",
        "sourceUrl": "https://...",
        "sourceName": "연합뉴스",
        "category": "BUSINESS",
        "isPersonnel": false,
        "publishedAt": "2025-01-20T09:00:00Z",
        "company": {
          "id": "cuid456",
          "name": "삼성증권",
          "code": "SAMSUNG",
          "logoUrl": "/logos/samsung.png"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8,
      "hasMore": true
    }
  }
}
```

### GET `/api/news/[id]`

뉴스 상세 조회

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "cuid123",
    "title": "삼성증권, 1분기 실적 발표",
    "content": "전체 기사 내용...",
    "summary": "AI 요약...",
    "sourceUrl": "https://...",
    "sourceName": "연합뉴스",
    "imageUrl": "https://...",
    "category": "BUSINESS",
    "isPersonnel": false,
    "publishedAt": "2025-01-20T09:00:00Z",
    "crawledAt": "2025-01-20T10:00:00Z",
    "company": {
      "id": "cuid456",
      "name": "삼성증권"
    }
  }
}
```

---

## 계약 API

### GET `/api/contracts`

계약 목록 조회

**Query Parameters:**

| 파라미터 | 타입 | 기본값 | 설명 |
|---------|------|-------|------|
| page | number | 1 | 페이지 번호 |
| limit | number | 50 | 페이지당 항목 수 |
| category | string | - | DOMESTIC, FOREIGN, MIGRATED |
| customerType | string | - | SECURITIES, INSTITUTION, ASSET_MGMT, FUTURES, MEDIA |
| keyword | string | - | 회사명 검색 |
| sortBy | string | orderNumber | 정렬 기준 |
| sortOrder | string | asc | asc, desc |

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "cuid123",
        "orderNumber": 1,
        "category": "DOMESTIC",
        "customerType": "SECURITIES",
        "progressNotes": "계약 진행 중",
        "currentRevenue": 15.5,
        "powerbaseRevenue": 8.2,
        "year2025Revenue": 16.0,
        "contractYear": 2025,
        "company": {
          "id": "cuid456",
          "name": "삼성증권",
          "code": "SAMSUNG"
        },
        "services": [
          {
            "id": "cuid789",
            "serviceCode": "NXT",
            "serviceName": "차세대 시스템",
            "amount": 5.0,
            "status": "CONTRACTED"
          }
        ]
      }
    ],
    "pagination": { ... }
  }
}
```

### GET `/api/contracts/stats`

계약 통계 조회

**Response:**
```json
{
  "success": true,
  "data": {
    "totalContracts": 45,
    "totalRevenue": 250.5,
    "byCategory": {
      "DOMESTIC": { "count": 30, "revenue": 180.0 },
      "FOREIGN": { "count": 10, "revenue": 50.5 },
      "MIGRATED": { "count": 5, "revenue": 20.0 }
    },
    "byCustomerType": {
      "SECURITIES": { "count": 25, "revenue": 150.0 },
      "INSTITUTION": { "count": 10, "revenue": 60.0 }
    }
  }
}
```

### GET `/api/contracts/services`

서비스별 계약 분석

### GET `/api/contracts/insights`

계약 인사이트 조회

---

## 인사 API

### GET `/api/personnel`

인사 변동 목록 조회

**Query Parameters:**

| 파라미터 | 타입 | 기본값 | 설명 |
|---------|------|-------|------|
| page | number | 1 | 페이지 번호 |
| limit | number | 20 | 페이지당 항목 수 |
| companyId | string | - | 증권사 ID |
| changeType | string | - | APPOINTMENT, PROMOTION, TRANSFER, RESIGNATION, RETIREMENT |
| keyword | string | - | 이름/직책 검색 |

---

## 증권사 API

### GET `/api/companies`

증권사 목록 조회

**Query Parameters:**

| 파라미터 | 타입 | 기본값 | 설명 |
|---------|------|-------|------|
| withStats | boolean | false | 통계 포함 여부 |
| isActive | boolean | - | 활성 상태 필터 |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "cuid123",
      "name": "삼성증권",
      "code": "SAMSUNG",
      "logoUrl": "/logos/samsung.png",
      "websiteUrl": "https://www.samsungpop.com",
      "isActive": true,
      "isPowerbaseClient": true,
      "_count": {
        "news": 150,
        "personnel": 25
      }
    }
  ]
}
```

### GET `/api/companies/[id]`

증권사 상세 조회

---

## 알림 API

### GET `/api/alerts`

알림 목록 조회

**Query Parameters:**

| 파라미터 | 타입 | 기본값 | 설명 |
|---------|------|-------|------|
| userId | string | 필수 | 사용자 ID |
| page | number | 1 | 페이지 번호 |
| limit | number | 20 | 페이지당 항목 수 |
| unreadOnly | boolean | false | 읽지 않은 알림만 |

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "cuid123",
        "type": "COMPANY_NEWS",
        "title": "삼성증권 새 뉴스",
        "message": "삼성증권에 새로운 뉴스가 등록되었습니다.",
        "linkType": "NEWS",
        "linkId": "cuid456",
        "isRead": false,
        "createdAt": "2025-01-20T10:00:00Z"
      }
    ],
    "total": 50,
    "page": 1,
    "limit": 20,
    "hasMore": true
  }
}
```

### DELETE `/api/alerts`

모든 알림 삭제

**Query Parameters:**
- `userId` (필수)

### GET `/api/alerts/unread-count`

읽지 않은 알림 개수

### PATCH `/api/alerts/[id]/read`

알림 읽음 처리

### POST `/api/alerts/read-all`

모든 알림 읽음 처리

---

## 알림 설정 API

### GET `/api/alerts/settings`

알림 설정 조회

### GET/POST `/api/alerts/settings/keywords`

키워드 알림 설정 조회/추가

**POST Request:**
```json
{
  "userId": "user-id",
  "keyword": "삼성증권"
}
```

### DELETE `/api/alerts/settings/keywords/[id]`

키워드 알림 삭제

### GET/POST `/api/alerts/settings/companies`

회사 알림 설정 조회/추가

**POST Request:**
```json
{
  "userId": "user-id",
  "companyId": "company-id",
  "alertOnNews": true,
  "alertOnPersonnel": true
}
```

### DELETE `/api/alerts/settings/companies/[id]`

회사 알림 삭제

---

## 리포트 API

### GET `/api/reports`

주간 리포트 목록 조회

### POST `/api/reports`

새 리포트 생성

**Request Body:**
```json
{
  "weekStart": "2025-01-13",
  "weekEnd": "2025-01-19"
}
```

### GET `/api/reports/export/weekly`

주간 리포트 PDF 내보내기

---

## 검색 API

### GET `/api/search`

통합 검색

**Query Parameters:**

| 파라미터 | 타입 | 기본값 | 설명 |
|---------|------|-------|------|
| q | string | 필수 | 검색어 (2글자 이상) |
| type | string | all | all, news, personnel |
| limit | number | 10 | 결과 제한 (최대 50) |

**Response:**
```json
{
  "success": true,
  "data": {
    "news": [
      {
        "id": "cuid123",
        "title": "삼성증권 실적 발표",
        "summary": "...",
        "category": "BUSINESS",
        "publishedAt": "2025-01-20T09:00:00Z",
        "company": { "id": "cuid456", "name": "삼성증권" }
      }
    ],
    "personnel": [
      {
        "id": "cuid789",
        "personName": "김철수",
        "position": "대표이사",
        "changeType": "APPOINTMENT",
        "company": { "id": "cuid456", "name": "삼성증권" }
      }
    ],
    "companies": [
      {
        "id": "cuid456",
        "name": "삼성증권",
        "code": "SAMSUNG",
        "logoUrl": "/logos/samsung.png"
      }
    ]
  },
  "query": "삼성"
}
```

---

## 관리자 API

### GET `/api/admin/users`

사용자 목록 조회 (관리자 전용)

**권한:** ADMIN, SUPER_ADMIN

**Query Parameters:**

| 파라미터 | 타입 | 기본값 | 설명 |
|---------|------|-------|------|
| status | string | - | PENDING, APPROVED, REJECTED, SUSPENDED |
| page | number | 1 | 페이지 번호 |
| limit | number | 20 | 페이지당 항목 수 |

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "cuid123",
        "email": "user@koscom.co.kr",
        "name": "홍길동",
        "role": "USER",
        "status": "PENDING",
        "department": "금융영업부",
        "position": "과장",
        "createdAt": "2025-01-15T10:00:00Z"
      }
    ],
    "total": 50,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

### PATCH `/api/admin/users`

사용자 상태 변경 (관리자 전용)

**권한:** ADMIN, SUPER_ADMIN

**Request Body:**
```json
{
  "userId": "user-id",
  "action": "approve",
  "rejectReason": "선택적 거절 사유"
}
```

**action 값:**
- `approve` - 승인
- `reject` - 거절
- `suspend` - 정지
- `reactivate` - 재활성화

---

## 크롤링 API

### POST `/api/crawl`

크롤링 수동 실행

**Response:**
```json
{
  "success": true,
  "message": "크롤링이 시작되었습니다.",
  "data": {
    "crawlLogId": "cuid123"
  }
}
```

### GET `/api/seed`

시드 데이터 적용 (개발용)

---

## HTTP 상태 코드

| 코드 | 설명 |
|------|------|
| 200 | 성공 |
| 400 | 잘못된 요청 (필수 파라미터 누락 등) |
| 401 | 인증 필요 |
| 403 | 권한 없음 |
| 404 | 리소스 없음 |
| 500 | 서버 에러 |

---

## 에러 응답 예시

### 400 Bad Request
```json
{
  "success": false,
  "error": "필수 항목을 입력해주세요."
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "로그인이 필요합니다."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "권한이 없습니다."
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "서버 오류가 발생했습니다."
}
```
