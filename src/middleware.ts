import { withAuth } from 'next-auth/middleware';
import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { checkRateLimit, rateLimitResponse, addRateLimitHeaders } from '@/lib/rate-limit';

// Security headers to add to all responses
const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-XSS-Protection': '1; mode=block',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

// Add security headers to response
function addSecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

// Check if path should have rate limiting applied
function shouldApplyRateLimit(pathname: string): boolean {
  // Apply rate limiting to all API routes
  return pathname.startsWith('/api/');
}

// Main middleware function that handles both rate limiting and auth
async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Apply rate limiting for API routes
  if (shouldApplyRateLimit(pathname)) {
    // Get user ID from token if available (for authenticated rate limiting)
    const token = await getToken({ req: request });
    const userId = token?.sub;

    const rateLimitResult = await checkRateLimit(request, userId);

    if (!rateLimitResult.success) {
      const response = rateLimitResponse(rateLimitResult.reset!);
      return addSecurityHeaders(response);
    }

    // Continue with the request, we'll add rate limit headers later
    // Store rate limit info for later use
    const response = NextResponse.next();
    addRateLimitHeaders(response, rateLimitResult.remaining, rateLimitResult.reset);
    return addSecurityHeaders(response);
  }

  // For non-API routes, just add security headers
  const response = NextResponse.next();
  return addSecurityHeaders(response);
}

// Export the combined middleware with auth
export default withAuth(
  async function authMiddleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Rate limiting for API routes (with user context)
    if (path.startsWith('/api/')) {
      const rateLimitResult = await checkRateLimit(req, token?.sub);

      if (!rateLimitResult.success) {
        const response = rateLimitResponse(rateLimitResult.reset!);
        return addSecurityHeaders(response);
      }
    }

    // Admin page access control
    if (path.startsWith('/admin')) {
      if (token?.role !== 'ADMIN' && token?.role !== 'SUPER_ADMIN') {
        const response = NextResponse.redirect(new URL('/dashboard', req.url));
        return addSecurityHeaders(response);
      }
    }

    const response = NextResponse.next();
    return addSecurityHeaders(response);
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;

        // Public pages
        const publicPaths = ['/', '/login', '/register', '/pending', '/api/auth'];
        if (publicPaths.some(p => path === p || path.startsWith(p))) {
          return true;
        }

        // Public APIs (still rate limited)
        const publicApis = ['/api/news', '/api/companies', '/api/search', '/api/personnel'];
        if (publicApis.some(p => path.startsWith(p))) {
          return true;
        }

        // Authenticated routes require token
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    // Match all paths for security headers
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
