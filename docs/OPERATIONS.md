# 운영 가이드

## 일상 운영 절차

### 서비스 상태 확인

#### Vercel 대시보드
1. https://vercel.com 로그인
2. 프로젝트 선택
3. Deployments 탭에서 배포 상태 확인
4. Functions 탭에서 API 호출 현황 확인

#### 로컬 확인 (CLI)
```bash
# Vercel 로그 확인
vercel logs your-project-name.vercel.app

# 실시간 로그 스트리밍
vercel logs your-project-name.vercel.app --follow
```

### 데이터베이스 상태 확인

```bash
# Prisma Studio로 데이터 조회
npm run db:studio
```

Prisma Studio가 http://localhost:5555 에서 실행됩니다.

### 주요 점검 항목

| 항목 | 확인 방법 | 정상 상태 |
|------|----------|----------|
| 웹 서비스 | 브라우저로 접속 | 로그인 페이지 표시 |
| API 응답 | `/api/news` 호출 | JSON 응답 |
| 데이터베이스 | Prisma Studio | 연결 성공 |
| 크롤링 로그 | CrawlLog 테이블 | SUCCESS 상태 |

## 크롤러 관리

### 크롤러 스케줄

| 시간 | 설명 |
|------|------|
| 07:00 | 오전 크롤링 |
| 13:00 | 오후 크롤링 |
| 19:00 | 저녁 크롤링 |

### 수동 크롤링 실행

#### 로컬에서 실행
```bash
# 전체 크롤러 실행
npm run crawl

# 간단 크롤러 실행
npm run crawl:simple
```

#### API를 통한 실행
```bash
# 로컬
curl -X POST http://localhost:3000/api/crawl

# 프로덕션
curl -X POST https://your-domain.vercel.app/api/crawl
```

### 스케줄러 실행 (로컬)

```bash
# 스케줄러 백그라운드 실행
npm run scheduler

# nohup으로 백그라운드 실행
nohup npm run scheduler > scheduler.log 2>&1 &
```

> 주의: Vercel은 서버리스 환경이므로 별도 스케줄러가 필요합니다.
> Vercel Cron 또는 외부 서비스 (GitHub Actions, cron-job.org) 사용을 권장합니다.

### Vercel Cron 설정

`vercel.json`에 추가:
```json
{
  "crons": [
    {
      "path": "/api/crawl",
      "schedule": "0 7,13,19 * * *"
    }
  ]
}
```

### 크롤링 로그 확인

```sql
-- 최근 크롤링 로그 (Prisma Studio 또는 직접 쿼리)
SELECT * FROM crawl_logs ORDER BY started_at DESC LIMIT 10;

-- 실패한 크롤링 확인
SELECT * FROM crawl_logs WHERE status = 'FAILED' ORDER BY started_at DESC;
```

Prisma Studio에서:
1. `CrawlLog` 테이블 선택
2. `startedAt` 기준 내림차순 정렬
3. `status` 컬럼 확인 (SUCCESS/FAILED/RUNNING)

## 주간 리포트 관리

### 리포트 자동 생성

주간 리포트는 대시보드에서 자동으로 생성됩니다:
1. 대시보드 → 리포트 메뉴
2. "새 리포트 생성" 버튼 클릭
3. 기간 선택 (기본: 최근 1주)
4. AI가 뉴스를 분석하여 요약 생성

### 리포트 수동 생성

관리자가 직접 리포트를 생성하거나 수정할 수 있습니다:
1. 대시보드 → 리포트
2. "새 리포트 생성" 또는 기존 리포트 편집
3. 각 섹션 직접 작성 또는 AI 요약 활용

### PDF 내보내기

1. 리포트 상세 페이지 접속
2. "PDF 내보내기" 버튼 클릭
3. 브라우저에서 PDF 다운로드

## 사용자 관리

### 신규 가입 승인

1. 관리자 계정으로 로그인
2. 관리 → 사용자 관리 메뉴
3. "대기 중" 탭에서 승인 대기 사용자 확인
4. "승인" 또는 "거절" 버튼 클릭

### 사용자 권한 변경

| 권한 | 설명 | 접근 범위 |
|------|------|----------|
| USER | 일반 사용자 | 뉴스, 계약, 리포트 조회 |
| ADMIN | 관리자 | 사용자 승인, 설정 관리 |
| SUPER_ADMIN | 최고 관리자 | 전체 시스템 관리 |

권한 변경:
1. 관리 → 사용자 관리
2. 사용자 선택
3. 역할(Role) 드롭다운에서 변경
4. 저장

### 사용자 상태

| 상태 | 설명 |
|------|------|
| PENDING | 승인 대기 중 |
| APPROVED | 정상 승인됨 |
| REJECTED | 가입 거절됨 |
| SUSPENDED | 계정 정지됨 |

## 모니터링

### Vercel Analytics

1. Vercel 대시보드 → Analytics 탭
2. 주요 지표:
   - Page Views (페이지 조회수)
   - Unique Visitors (고유 방문자)
   - Web Vitals (성능 지표)

### 데이터베이스 모니터링

PostgreSQL 호스팅 서비스별 대시보드 확인:
- **Supabase**: Dashboard → Database → Query Performance
- **Vercel Postgres**: Dashboard → Storage → Postgres
- **Railway**: Dashboard → Project → Metrics

### 주요 모니터링 지표

| 지표 | 정상 범위 | 경고 기준 |
|------|----------|----------|
| API 응답 시간 | < 500ms | > 2s |
| 데이터베이스 연결 | < 50% | > 80% |
| 에러율 | < 1% | > 5% |
| 디스크 사용량 | < 70% | > 90% |

## 트러블슈팅

### 일반적인 오류

#### 로그인 실패
- **증상**: "등록되지 않은 이메일입니다" 또는 "비밀번호가 일치하지 않습니다"
- **원인**: 이메일/비밀번호 불일치 또는 승인 대기 상태
- **해결**:
  1. 이메일 확인
  2. 관리자에게 승인 요청
  3. 비밀번호 재설정

#### "승인 대기 중입니다" 오류
- **원인**: 사용자 상태가 PENDING
- **해결**: 관리자가 사용자 관리에서 승인 처리

#### 페이지 로딩 느림
- **원인**: 대량 데이터 조회 또는 네트워크 문제
- **해결**:
  1. 필터 범위 좁히기
  2. 페이지네이션 활용
  3. 네트워크 상태 확인

### 데이터베이스 연결 문제

#### "P1001: Can't reach database server"
```bash
# 환경 변수 확인
echo $DATABASE_URL

# 데이터베이스 서버 상태 확인 (Docker)
docker compose ps

# 연결 테스트
npx prisma db pull
```

#### "P2002: Unique constraint failed"
- **원인**: 중복 데이터 삽입 시도
- **해결**: 기존 데이터 확인 후 업데이트 또는 다른 값 사용

### 크롤링 실패

#### 타임아웃 오류
- **원인**: 네이버 서버 응답 지연 또는 차단
- **해결**:
  1. 재시도
  2. 크롤링 간격 조정 (현재 1초)
  3. User-Agent 확인

#### 뉴스가 수집되지 않음
- **확인 사항**:
  1. 증권사가 `isActive: true`인지 확인
  2. 크롤링 로그에서 에러 메시지 확인
  3. 네이버 뉴스 검색 결과 존재 여부 확인

### 배포 실패

#### 빌드 에러
```bash
# 로컬에서 빌드 테스트
npm run build

# Prisma 클라이언트 재생성
npx prisma generate
```

#### 환경 변수 누락
```bash
# Vercel 환경 변수 확인
vercel env ls

# 누락된 변수 추가
vercel env add VARIABLE_NAME production
```

## 긴급 대응

### 서비스 장애 시

1. **상황 파악**
   - Vercel 대시보드에서 에러 로그 확인
   - 데이터베이스 연결 상태 확인

2. **임시 조치**
   - 이전 배포로 롤백: `vercel rollback`
   - 문제 기능 비활성화

3. **근본 원인 분석**
   - 로그 분석
   - 재현 테스트
   - 수정 및 재배포

### 데이터 복구

```bash
# Vercel Postgres 백업 복원 (Vercel 대시보드에서)
# Storage → Postgres → Backups → Restore

# 로컬 PostgreSQL 백업
pg_dump -U user -d securities_hub > backup.sql

# 복원
psql -U user -d securities_hub < backup.sql
```

### 비상 연락처

| 역할 | 담당 |
|------|------|
| 시스템 관리자 | (담당자 정보) |
| 데이터베이스 담당 | (담당자 정보) |
| 개발팀 | (담당자 정보) |
