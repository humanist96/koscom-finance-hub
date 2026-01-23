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
        const publicPaths = ['/', '/login', '/register', '/pending', '/api/auth'];
        if (publicPaths.some(p => path === p || path.startsWith(p))) {
          return true;
        }

        // API 라우트 중 공개 API
        const publicApis = ['/api/news', '/api/companies', '/api/search', '/api/personnel'];
        if (publicApis.some(p => path.startsWith(p))) {
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
    '/api/contracts/:path*',
    '/api/admin/:path*',
  ],
};
