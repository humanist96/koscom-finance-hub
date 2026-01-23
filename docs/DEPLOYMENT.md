# 배포 가이드

## 환경 변수

### 필수 환경 변수

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `DATABASE_URL` | PostgreSQL 연결 URL (Connection Pooling) | `postgresql://user:pass@host:5432/db?schema=public` |
| `DIRECT_URL` | PostgreSQL 직접 연결 URL | `postgresql://user:pass@host:5432/db?schema=public` |
| `NEXTAUTH_SECRET` | 세션 암호화 키 (32자 이상) | `openssl rand -base64 32`로 생성 |
| `NEXTAUTH_URL` | 애플리케이션 URL | `https://your-domain.com` |

### 선택 환경 변수

| 변수명 | 설명 | 기본값 |
|--------|------|--------|
| `ANTHROPIC_API_KEY` | Claude API 키 (AI 요약용) | - |

### 환경 변수 파일 예시

```env
# .env.production 예시

# 데이터베이스 (Vercel Postgres 또는 외부 PostgreSQL)
DATABASE_URL="postgresql://username:password@ep-xxx.aws-region.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://username:password@ep-xxx.aws-region.supabase.com:5432/postgres"

# NextAuth
NEXTAUTH_SECRET="your-production-secret-key-minimum-32-chars"
NEXTAUTH_URL="https://your-app-name.vercel.app"

# AI (선택)
ANTHROPIC_API_KEY="sk-ant-api03-xxxxx"
```

## 로컬 개발 환경

### 1. 사전 요구사항

- Node.js 20.x 이상
- npm 10.x 이상
- PostgreSQL 16 (또는 Docker)

### 2. 의존성 설치

```bash
npm install
```

### 3. 데이터베이스 설정 (Docker 사용)

```bash
# PostgreSQL 컨테이너 시작
docker compose up -d postgres

# 연결 확인
docker compose ps

# 로그 확인
docker compose logs postgres
```

Docker 없이 로컬 PostgreSQL 사용 시:
```bash
# 데이터베이스 생성
createdb securities_hub

# .env.local 설정
DATABASE_URL="postgresql://localhost:5432/securities_hub?schema=public"
DIRECT_URL="postgresql://localhost:5432/securities_hub?schema=public"
```

### 4. Prisma 스키마 적용

```bash
# 스키마 푸시 (개발 환경)
npm run db:push

# 또는 마이그레이션 (프로덕션 환경)
npm run db:migrate
```

### 5. 초기 데이터 (선택)

```bash
npm run db:seed
```

### 6. 개발 서버 실행

```bash
npm run dev
```

## Docker Compose 설정

`docker-compose.yml` 파일:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: sih-postgres
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: securities_hub
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d securities_hub"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: sih-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### Docker 명령어

```bash
# 모든 서비스 시작
docker compose up -d

# 특정 서비스만 시작
docker compose up -d postgres

# 서비스 상태 확인
docker compose ps

# 로그 확인
docker compose logs -f postgres

# 서비스 중지
docker compose down

# 볼륨 포함 삭제 (데이터 삭제 주의)
docker compose down -v
```

## Vercel 배포

### 1. Vercel 프로젝트 연결

```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 연결
vercel link
```

### 2. 환경 변수 설정

Vercel 대시보드 또는 CLI에서 환경 변수 설정:

```bash
# CLI로 환경 변수 추가
vercel env add DATABASE_URL production
vercel env add DIRECT_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production
```

또는 Vercel 대시보드에서:
1. Project Settings → Environment Variables
2. 각 환경 변수 추가 (Production, Preview, Development 선택)

### 3. 데이터베이스 설정 (Vercel Postgres)

Vercel Postgres 사용 시:
1. Vercel 대시보드 → Storage → Create Database → Postgres
2. 생성된 연결 문자열이 자동으로 환경 변수에 추가됨

외부 PostgreSQL (Supabase, Railway, Neon 등) 사용 시:
1. 해당 서비스에서 PostgreSQL 인스턴스 생성
2. Connection Pooling URL과 Direct URL 획득
3. Vercel 환경 변수에 수동 추가

### 4. 빌드 설정

`vercel.json`:
```json
{
  "buildCommand": "prisma generate && prisma db push && next build",
  "framework": "nextjs"
}
```

### 5. 배포

```bash
# 프로덕션 배포
vercel --prod

# 프리뷰 배포 (PR 생성 시 자동)
vercel
```

### 6. 배포 후 확인

```bash
# 배포 상태 확인
vercel ls

# 로그 확인
vercel logs your-project-name.vercel.app

# 환경 변수 확인
vercel env ls
```

## 프로덕션 체크리스트

### 보안
- [ ] `NEXTAUTH_SECRET`이 충분히 긴 랜덤 문자열인가?
- [ ] 데이터베이스 비밀번호가 강력한가?
- [ ] `.env` 파일이 `.gitignore`에 포함되어 있는가?
- [ ] 관리자 기본 비밀번호가 변경되었는가?

### 데이터베이스
- [ ] Connection Pooling이 설정되어 있는가? (서버리스 환경 필수)
- [ ] 데이터베이스 백업이 설정되어 있는가?
- [ ] 인덱스가 적절히 생성되어 있는가?

### 성능
- [ ] 이미지 최적화가 설정되어 있는가?
- [ ] Edge 캐싱이 활성화되어 있는가?

### 모니터링
- [ ] 에러 추적 서비스가 연결되어 있는가? (Sentry 등)
- [ ] 로그 모니터링이 설정되어 있는가?
- [ ] 헬스 체크 엔드포인트가 있는가?

### 운영
- [ ] 도메인이 연결되어 있는가?
- [ ] SSL 인증서가 적용되어 있는가? (Vercel 자동)
- [ ] CORS 설정이 올바른가?

## 트러블슈팅

### 빌드 실패: Prisma 에러

```bash
# Prisma 클라이언트 재생성
npx prisma generate

# 스키마 동기화
npx prisma db push --accept-data-loss
```

### 데이터베이스 연결 실패

1. 환경 변수 확인
2. 데이터베이스 서버 상태 확인
3. Connection Pooling URL vs Direct URL 구분

### 빌드 타임아웃

Vercel 무료 플랜 빌드 제한 (10분) 초과 시:
- 불필요한 의존성 제거
- `next.config.js`에서 빌드 최적화

### NextAuth 세션 에러

```bash
# NEXTAUTH_URL이 실제 배포 URL과 일치하는지 확인
# 로컬: http://localhost:3000
# 프로덕션: https://your-domain.vercel.app
```
