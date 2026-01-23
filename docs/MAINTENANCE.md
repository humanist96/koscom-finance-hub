# 유지보수 가이드

## 코드 컨벤션

### TypeScript 스타일

#### 타입 정의
```typescript
// 인터페이스 사용 (확장 가능한 객체)
interface User {
  id: string;
  email: string;
  name: string | null;
}

// 타입 사용 (유니온, 교차 타입)
type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN';
type UserWithRole = User & { role: UserRole };
```

#### 함수 작성
```typescript
// async 함수는 Promise 반환 타입 명시
async function getUser(id: string): Promise<User | null> {
  return await prisma.user.findUnique({ where: { id } });
}

// 화살표 함수 (콜백, 간단한 함수)
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('ko-KR');
};
```

#### Import 순서
```typescript
// 1. React/Next.js
import { useState, useEffect } from 'react';
import { NextRequest, NextResponse } from 'next/server';

// 2. 외부 라이브러리
import { prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';

// 3. 내부 모듈 (@/ alias)
import { authOptions } from '@/lib/auth';
import { Button } from '@/components/ui/button';

// 4. 타입 (type-only imports)
import type { User } from '@/types';
```

### 파일/폴더 명명 규칙

| 유형 | 규칙 | 예시 |
|------|------|------|
| 폴더 | kebab-case | `user-management/` |
| 페이지 | 폴더명/page.tsx | `dashboard/page.tsx` |
| 컴포넌트 | PascalCase.tsx | `NewsCard.tsx` |
| 유틸리티 | kebab-case.ts | `date-utils.ts` |
| 훅 | use*.ts | `useNews.ts` |
| 타입 | PascalCase | `interface NewsItem` |

### 컴포넌트 구조

```typescript
// 1. Imports
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { NewsItem } from '@/types';

// 2. Types/Interfaces
interface NewsCardProps {
  news: NewsItem;
  onClick?: (id: string) => void;
}

// 3. Component
export function NewsCard({ news, onClick }: NewsCardProps) {
  // 3.1 Hooks
  const [isExpanded, setIsExpanded] = useState(false);

  // 3.2 Event handlers
  const handleClick = () => {
    onClick?.(news.id);
  };

  // 3.3 Render helpers
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR');
  };

  // 3.4 Return
  return (
    <div onClick={handleClick}>
      <h3>{news.title}</h3>
      <p>{formatDate(news.publishedAt)}</p>
    </div>
  );
}
```

### API Route 구조

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // 1. 인증 확인 (필요시)
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    // 2. 파라미터 추출
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');

    // 3. 데이터 조회
    const data = await prisma.model.findMany({
      skip: (page - 1) * 20,
      take: 20,
    });

    // 4. 성공 응답
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    // 5. 에러 처리
    console.error('조회 실패:', error);
    return NextResponse.json(
      { success: false, error: '조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}
```

## 새 기능 추가 방법

### 1. 페이지 추가

**단계:**
1. `src/app/` 하위에 폴더 생성
2. `page.tsx` 파일 생성
3. (선택) `layout.tsx` 추가

**예시: 통계 페이지 추가**

```bash
# 폴더 구조
src/app/dashboard/stats/
├── page.tsx      # 메인 페이지
└── layout.tsx    # 선택적 레이아웃
```

```typescript
// src/app/dashboard/stats/page.tsx
export default function StatsPage() {
  return (
    <div>
      <h1>통계</h1>
      {/* 페이지 내용 */}
    </div>
  );
}
```

### 2. API 라우트 추가

**단계:**
1. `src/app/api/` 하위에 폴더 생성
2. `route.ts` 파일 생성
3. HTTP 메서드별 함수 export

**예시: 통계 API 추가**

```typescript
// src/app/api/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const stats = await prisma.news.count();

    return NextResponse.json({
      success: true,
      data: { totalNews: stats },
    });
  } catch (error) {
    console.error('통계 조회 실패:', error);
    return NextResponse.json(
      { success: false, error: '통계 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}
```

### 3. 컴포넌트 추가

**단계:**
1. 적절한 폴더에 컴포넌트 파일 생성
   - 기능별: `src/components/features/{feature}/`
   - 공통 UI: `src/components/ui/`
   - 레이아웃: `src/components/layout/`
2. 컴포넌트 작성 및 export

**예시: 통계 카드 컴포넌트**

```typescript
// src/components/features/stats/stat-card.tsx
interface StatCardProps {
  title: string;
  value: number;
  change?: number;
}

export function StatCard({ title, value, change }: StatCardProps) {
  return (
    <div className="p-4 rounded-lg border">
      <h3 className="text-sm text-muted-foreground">{title}</h3>
      <p className="text-2xl font-bold">{value.toLocaleString()}</p>
      {change !== undefined && (
        <span className={change >= 0 ? 'text-green-500' : 'text-red-500'}>
          {change >= 0 ? '+' : ''}{change}%
        </span>
      )}
    </div>
  );
}
```

### 4. DB 모델 추가

**단계:**
1. `prisma/schema.prisma` 수정
2. 마이그레이션 생성 및 적용
3. Prisma 클라이언트 재생성

**예시: 태그 모델 추가**

```prisma
// prisma/schema.prisma에 추가
model Tag {
  id        String   @id @default(cuid())
  name      String   @unique
  createdAt DateTime @default(now())

  news      NewsTag[]

  @@map("tags")
}

model NewsTag {
  newsId String
  news   News   @relation(fields: [newsId], references: [id], onDelete: Cascade)
  tagId  String
  tag    Tag    @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([newsId, tagId])
  @@map("news_tags")
}
```

```bash
# 마이그레이션 실행
npm run db:migrate

# 또는 개발 환경에서 빠르게 적용
npm run db:push

# Prisma 클라이언트 재생성 (자동)
npx prisma generate
```

## 의존성 관리

### 패키지 업데이트

```bash
# 업데이트 가능한 패키지 확인
npm outdated

# 특정 패키지 업데이트
npm update package-name

# 메이저 버전 업그레이드
npm install package-name@latest

# 모든 패키지 업데이트 (주의)
npm update
```

### 주요 패키지 업데이트 시 주의사항

| 패키지 | 주의사항 |
|--------|---------|
| next | Breaking changes 확인, 마이그레이션 가이드 참조 |
| react | React 19 기능 호환성 확인 |
| prisma | 스키마 변경 필요 여부 확인 |
| next-auth | 인증 로직 테스트 필수 |
| tailwindcss | 클래스명 변경 여부 확인 |

### Prisma 업데이트

```bash
# Prisma CLI 업데이트
npm install prisma@latest

# Prisma Client 업데이트
npm install @prisma/client@latest

# 클라이언트 재생성
npx prisma generate

# 스키마 검증
npx prisma validate
```

## 테스트 (향후 계획)

### 테스트 도구 설정

```bash
# 테스트 프레임워크 설치
npm install -D vitest @testing-library/react @testing-library/jest-dom

# E2E 테스트 (Playwright)
npm install -D @playwright/test
```

### 테스트 파일 구조

```
src/
├── components/
│   └── features/
│       └── news/
│           ├── news-card.tsx
│           └── news-card.test.tsx  # 컴포넌트 테스트
├── lib/
│   ├── utils.ts
│   └── utils.test.ts               # 유틸리티 테스트
tests/
└── e2e/
    ├── login.spec.ts               # E2E 테스트
    └── news.spec.ts
```

### 테스트 예시

```typescript
// src/components/features/news/news-card.test.tsx
import { render, screen } from '@testing-library/react';
import { NewsCard } from './news-card';

describe('NewsCard', () => {
  it('renders news title', () => {
    const news = {
      id: '1',
      title: '테스트 뉴스',
      publishedAt: new Date(),
    };

    render(<NewsCard news={news} />);
    expect(screen.getByText('테스트 뉴스')).toBeInTheDocument();
  });
});
```

## Git 워크플로우

### 브랜치 전략

```
main (production)
  │
  └── develop (staging)
        │
        ├── feature/news-filter
        ├── feature/pdf-export
        └── fix/login-error
```

### 브랜치 명명 규칙

| 유형 | 접두사 | 예시 |
|------|--------|------|
| 새 기능 | feature/ | feature/user-dashboard |
| 버그 수정 | fix/ | fix/login-redirect |
| 리팩토링 | refactor/ | refactor/api-structure |
| 문서 | docs/ | docs/api-guide |

### 커밋 메시지 규칙

```
<type>: <subject>

<body>
```

**Type:**
- `feat`: 새 기능
- `fix`: 버그 수정
- `refactor`: 리팩토링
- `docs`: 문서
- `test`: 테스트
- `chore`: 빌드, 설정 변경

**예시:**
```
feat: 뉴스 필터에 날짜 범위 옵션 추가

- 오늘, 3일, 1주, 1개월 옵션 추가
- 기본값 1주로 설정
```

### Pull Request 체크리스트

```markdown
## 변경 사항
- [ ] 기능 설명

## 테스트
- [ ] 로컬에서 테스트 완료
- [ ] 에러 케이스 확인

## 리뷰어 확인 사항
- [ ] 코드 스타일 준수
- [ ] 타입 안전성
- [ ] 에러 처리
```

## 일반적인 작업

### 새 증권사 추가

```typescript
// Prisma Studio 또는 시드 스크립트 사용
const company = await prisma.securitiesCompany.create({
  data: {
    name: '새증권',
    code: 'NEW',
    websiteUrl: 'https://new-securities.com',
    isActive: true,
    isPowerbaseClient: false,
  },
});
```

### 카테고리 추가

1. `prisma/schema.prisma`에서 카테고리 값 문서화
2. API 라우트에서 카테고리 분류 로직 수정
3. 프론트엔드 필터 옵션 추가

### 알림 타입 추가

1. Prisma 스키마 주석에 새 타입 문서화
2. `notification-service.ts`에 생성 로직 추가
3. 알림 UI에 아이콘/스타일 추가

## 디버깅 팁

### 서버 로그 확인

```bash
# 개발 서버 로그
npm run dev

# Vercel 로그 (프로덕션)
vercel logs your-project.vercel.app --follow
```

### Prisma 쿼리 로깅

```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

### React Query DevTools

```typescript
// src/components/providers.tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### 일반적인 에러 해결

| 에러 | 원인 | 해결 |
|------|------|------|
| `PrismaClientInitializationError` | DB 연결 실패 | 환경 변수 확인 |
| `TypeError: fetch failed` | API 엔드포인트 오류 | URL 및 메서드 확인 |
| `Hydration mismatch` | 서버/클라이언트 불일치 | useEffect 또는 dynamic import 사용 |
| `Module not found` | import 경로 오류 | 절대 경로 (@/) 확인 |
