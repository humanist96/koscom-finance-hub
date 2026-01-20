# 관리자 승인 기반 인증 시스템 구현 계획서

**작성일:** 2026-01-20
**버전:** 1.0

---

## 1. 현재 상태 분석

### 1.1 현재 인증 구조
- Zustand 기반 클라이언트 사이드 인증 스토어만 존재
- 실제 비밀번호 검증/세션 관리 없음
- 누구나 로그인 가능한 상태

### 1.2 요구사항
- 관리자가 승인한 사용자만 로그인 가능
- 신규 사용자 가입 신청 → 관리자 승인 → 로그인 가능
- 무료로 구현 가능해야 함

---

## 2. 기술 스택 선정

### 2.1 무료 인증 옵션 비교

| 옵션 | 장점 | 단점 | 비용 |
|------|------|------|------|
| **NextAuth.js (Auth.js)** | Next.js 최적화, 다양한 프로바이더 | 설정 복잡도 | ✅ 무료 |
| Custom JWT + bcrypt | 완전한 제어, 가벼움 | 직접 구현 필요 | ✅ 무료 |
| Clerk | 쉬운 설정, UI 제공 | 무료 티어 제한(10K MAU) | 💰 제한적 무료 |
| Supabase Auth | PostgreSQL 통합 | 별도 DB 필요 | 💰 제한적 무료 |

### 2.2 선택: NextAuth.js + Credentials Provider

**선택 이유:**
- 완전 무료 (오픈소스)
- Next.js App Router 완벽 지원
- Prisma Adapter로 기존 DB 활용
- JWT 또는 Database 세션 선택 가능
- 미들웨어 기반 라우트 보호

---

## 3. 데이터베이스 스키마 확장

### 3.1 User 모델 수정

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String    // 해시된 비밀번호 (bcrypt)
  name          String?
  role          UserRole  @default(USER)

  // 승인 관련 필드
  status        UserStatus @default(PENDING)  // 승인 상태
  approvedAt    DateTime?                      // 승인 일시
  approvedBy    String?                        // 승인한 관리자 ID
  rejectedAt    DateTime?                      // 거절 일시
  rejectReason  String?                        // 거절 사유

  // 부서/직책 정보 (선택)
  department    String?   // 부서
  position      String?   // 직책
  employeeId    String?   // 사번

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  lastLoginAt   DateTime? // 마지막 로그인

  // 관계
  favorites      UserFavorite[]
  alerts         KeywordAlert[]
  notifications  Notification[]
  companyAlerts  CompanyAlert[]

  @@map("users")
}

enum UserRole {
  USER          // 일반 사용자
  ADMIN         // 관리자
  SUPER_ADMIN   // 슈퍼 관리자
}

enum UserStatus {
  PENDING       // 승인 대기
  APPROVED      // 승인됨
  REJECTED      // 거절됨
  SUSPENDED     // 정지됨
}
```

### 3.2 NextAuth 세션 모델 (선택적)

```prisma
// NextAuth.js Database 세션 사용 시 필요
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}
```

---

## 4. 인증 플로우

### 4.1 회원가입 플로우

```
┌─────────────────┐
│  회원가입 신청   │
│  (이메일, 비번,  │
│   이름, 부서)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  DB에 저장       │
│  status=PENDING │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  관리자에게      │
│  알림 발송       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  대기 화면      │
│  "승인 대기 중"  │
└─────────────────┘
```

### 4.2 관리자 승인 플로우

```
┌─────────────────┐
│  관리자 대시보드 │
│  승인 대기 목록  │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌───────┐ ┌───────┐
│ 승인  │ │ 거절  │
└───┬───┘ └───┬───┘
    │         │
    ▼         ▼
┌───────┐ ┌───────────┐
│APPROVED│ │REJECTED   │
│       │ │rejectReason│
└───────┘ └───────────┘
    │
    ▼
┌─────────────────┐
│  사용자에게      │
│  승인 완료 알림  │
└─────────────────┘
```

### 4.3 로그인 플로우

```
┌─────────────────┐
│  로그인 시도     │
│  (이메일, 비번)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  이메일 확인     │
│  사용자 존재?    │
└────────┬────────┘
         │
    ┌────┴────┐
    │ 없음    │ 있음
    ▼         ▼
┌───────┐ ┌─────────────┐
│ 에러  │ │ 비밀번호    │
│       │ │ 검증        │
└───────┘ └──────┬──────┘
                 │
            ┌────┴────┐
            │ 불일치   │ 일치
            ▼         ▼
       ┌───────┐ ┌─────────────┐
       │ 에러  │ │ 상태 확인   │
       └───────┘ │ (status)    │
                 └──────┬──────┘
                        │
         ┌──────────────┼──────────────┐
         ▼              ▼              ▼
    ┌─────────┐   ┌─────────┐   ┌─────────┐
    │ PENDING │   │APPROVED │   │REJECTED/│
    │ "대기중"│   │ 로그인  │   │SUSPENDED│
    └─────────┘   │ 성공!   │   │ 에러    │
                  └─────────┘   └─────────┘
```

---

## 5. 파일 구조

```
src/
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── [...nextauth]/
│   │       │   └── route.ts          # NextAuth 핸들러
│   │       ├── register/
│   │       │   └── route.ts          # 회원가입 API
│   │       └── check-status/
│   │           └── route.ts          # 승인 상태 확인 API
│   │
│   ├── (auth)/                        # 인증 관련 페이지 그룹
│   │   ├── login/
│   │   │   └── page.tsx              # 로그인 페이지 (수정)
│   │   ├── register/
│   │   │   └── page.tsx              # 회원가입 페이지 (신규)
│   │   └── pending/
│   │       └── page.tsx              # 승인 대기 페이지 (신규)
│   │
│   ├── admin/                         # 관리자 전용 (신규)
│   │   ├── layout.tsx                # 관리자 레이아웃
│   │   ├── page.tsx                  # 관리자 대시보드
│   │   └── users/
│   │       ├── page.tsx              # 사용자 관리
│   │       └── pending/
│   │           └── page.tsx          # 승인 대기 목록
│   │
│   └── dashboard/
│       └── ...                        # 기존 대시보드 (보호됨)
│
├── lib/
│   ├── auth.ts                        # NextAuth 설정
│   └── auth-utils.ts                  # 인증 유틸리티
│
├── middleware.ts                       # 라우트 보호 미들웨어
│
└── types/
    └── next-auth.d.ts                 # NextAuth 타입 확장
```

---

## 6. 주요 구현 내용

### 6.1 NextAuth 설정 (lib/auth.ts)

```typescript
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: '이메일', type: 'email' },
        password: { label: '비밀번호', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('이메일과 비밀번호를 입력해주세요.');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error('등록되지 않은 이메일입니다.');
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValid) {
          throw new Error('비밀번호가 일치하지 않습니다.');
        }

        // 승인 상태 확인
        if (user.status === 'PENDING') {
          throw new Error('PENDING:관리자 승인 대기 중입니다.');
        }

        if (user.status === 'REJECTED') {
          throw new Error('REJECTED:가입이 거절되었습니다.');
        }

        if (user.status === 'SUSPENDED') {
          throw new Error('SUSPENDED:계정이 정지되었습니다.');
        }

        // 마지막 로그인 시간 업데이트
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.status = user.status;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.status = token.status as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24시간
  },
};
```

### 6.2 미들웨어 (middleware.ts)

```typescript
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // 관리자 페이지 접근 제어
    if (path.startsWith('/admin')) {
      if (token?.role !== 'ADMIN' && token?.role !== 'SUPER_ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;

        // 공개 페이지
        const publicPaths = ['/', '/login', '/register', '/pending'];
        if (publicPaths.some(p => path === p || path.startsWith(p))) {
          return true;
        }

        // 인증 필요 페이지
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/api/alerts/:path*',
    '/api/reports/:path*',
  ],
};
```

### 6.3 회원가입 API (api/auth/register/route.ts)

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, department, position, employeeId } = body;

    // 유효성 검사
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: '필수 항목을 입력해주세요.' },
        { status: 400 }
      );
    }

    // 이메일 중복 확인
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: '이미 등록된 이메일입니다.' },
        { status: 400 }
      );
    }

    // 비밀번호 해시
    const hashedPassword = await bcrypt.hash(password, 12);

    // 사용자 생성 (PENDING 상태)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        department,
        position,
        employeeId,
        status: 'PENDING',
        role: 'USER',
      },
    });

    // 관리자에게 알림 (NotificationService 활용)
    // await notificationService.notifyAdminsNewUser(user);

    return NextResponse.json({
      success: true,
      message: '회원가입 신청이 완료되었습니다. 관리자 승인 후 이용 가능합니다.',
    });
  } catch (error) {
    console.error('회원가입 실패:', error);
    return NextResponse.json(
      { error: '회원가입 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
```

### 6.4 관리자 승인 API

```typescript
// api/admin/users/[id]/approve/route.ts
export async function POST(request: Request, { params }) {
  const session = await getServerSession(authOptions);

  // 관리자 권한 확인
  if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }

  const { id } = params;

  const user = await prisma.user.update({
    where: { id },
    data: {
      status: 'APPROVED',
      approvedAt: new Date(),
      approvedBy: session.user.id,
    },
  });

  // 사용자에게 승인 알림
  await notificationService.sendSystemNotification(
    id,
    '가입 승인 완료',
    '회원가입이 승인되었습니다. 이제 로그인하실 수 있습니다.'
  );

  return NextResponse.json({ success: true, user });
}
```

---

## 7. 필요 패키지

```bash
npm install next-auth @auth/prisma-adapter bcryptjs
npm install -D @types/bcryptjs
```

---

## 8. 구현 우선순위

### Phase 1: 기본 인증 (필수)
1. User 스키마 수정 및 마이그레이션
2. NextAuth.js 설정
3. 로그인 페이지 수정
4. 회원가입 페이지 및 API
5. 미들웨어 라우트 보호

### Phase 2: 관리자 기능
1. 관리자 대시보드 레이아웃
2. 승인 대기 사용자 목록
3. 승인/거절 기능
4. 사용자 관리 (목록, 상태 변경, 삭제)

### Phase 3: 고도화 (선택)
1. 비밀번호 재설정
2. 이메일 인증
3. 2단계 인증 (2FA)
4. 로그인 이력 관리
5. 세션 관리 (다중 기기)

---

## 9. 보안 고려사항

### 9.1 비밀번호 정책
- 최소 8자 이상
- 영문 + 숫자 + 특수문자 조합 권장
- bcrypt 해시 (cost factor: 12)

### 9.2 세션 보안
- JWT 토큰 사용 (httpOnly 쿠키)
- 24시간 만료
- CSRF 토큰 자동 적용 (NextAuth)

### 9.3 라우트 보호
- 미들웨어 기반 서버 사이드 검증
- API 라우트 권한 검사
- 역할 기반 접근 제어 (RBAC)

---

## 10. UI 목업

### 10.1 로그인 페이지
```
┌─────────────────────────────────────┐
│          KOSCOM 금융영업부 Hub       │
│                                      │
│  ┌─────────────────────────────┐    │
│  │ 이메일                      │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │ 비밀번호                    │    │
│  └─────────────────────────────┘    │
│                                      │
│  [        로그인        ]           │
│                                      │
│  계정이 없으신가요? [회원가입]       │
└─────────────────────────────────────┘
```

### 10.2 회원가입 페이지
```
┌─────────────────────────────────────┐
│            회원가입 신청             │
│                                      │
│  ┌─────────────────────────────┐    │
│  │ 이메일 *                    │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │ 비밀번호 *                  │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │ 이름 *                      │    │
│  └─────────────────────────────┘    │
│  ┌──────────────┐ ┌────────────┐    │
│  │ 부서         │ │ 직책       │    │
│  └──────────────┘ └────────────┘    │
│  ┌─────────────────────────────┐    │
│  │ 사번                        │    │
│  └─────────────────────────────┘    │
│                                      │
│  [      가입 신청하기      ]        │
│                                      │
│  ⓘ 관리자 승인 후 로그인 가능합니다  │
└─────────────────────────────────────┘
```

### 10.3 관리자 - 승인 대기 목록
```
┌─────────────────────────────────────────────────────┐
│  👤 사용자 관리 > 승인 대기                          │
├─────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────┐   │
│  │ 김영업 (kim@koscom.co.kr)                   │   │
│  │ 금융영업부 / 과장 / 사번: K12345            │   │
│  │ 신청일: 2026-01-20 10:30                    │   │
│  │                    [승인] [거절]            │   │
│  └─────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────┐   │
│  │ 이담당 (lee@koscom.co.kr)                   │   │
│  │ IT팀 / 대리 / 사번: K12346                  │   │
│  │ 신청일: 2026-01-20 11:15                    │   │
│  │                    [승인] [거절]            │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## 11. 예상 일정

| 단계 | 내용 | 예상 작업 |
|------|------|----------|
| 1 | 스키마 수정 + NextAuth 설정 | DB 마이그레이션, 인증 설정 |
| 2 | 로그인/회원가입 페이지 | UI 구현, API 연동 |
| 3 | 미들웨어 + 라우트 보호 | 접근 제어 구현 |
| 4 | 관리자 대시보드 | 사용자 관리 기능 |
| 5 | 테스트 + 버그 수정 | 전체 플로우 검증 |

---

## 12. 결론

**NextAuth.js + Credentials Provider** 조합으로:
- ✅ 완전 무료 구현 가능
- ✅ 기존 PostgreSQL + Prisma 활용
- ✅ 관리자 승인 기반 가입 플로우
- ✅ JWT 기반 안전한 세션 관리
- ✅ 역할 기반 접근 제어

구현을 진행할까요?

---

**문서 끝**
