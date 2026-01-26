import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';

// Rate limit configuration per endpoint type
export const RATE_LIMIT_CONFIG = {
  public: { requests: 100, window: '1m' },      // 100 req/min for public APIs
  authenticated: { requests: 500, window: '1m' }, // 500 req/min for authenticated users
  search: { requests: 30, window: '1m' },       // 30 req/min for search (prevent abuse)
  crawl: { requests: 1, window: '5m' },         // 1 req/5min for crawling
} as const;

type RateLimitType = keyof typeof RATE_LIMIT_CONFIG;

// Create Redis client (lazy initialization)
let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;

  const url = process.env.UPSTASH_REDIS_URL;
  const token = process.env.UPSTASH_REDIS_TOKEN;

  if (!url || !token) {
    console.warn('[RateLimit] Upstash Redis not configured, rate limiting disabled');
    return null;
  }

  redis = new Redis({ url, token });
  return redis;
}

// Create rate limiters for each type
const rateLimiters: Map<RateLimitType, Ratelimit> = new Map();

function getRateLimiter(type: RateLimitType): Ratelimit | null {
  const redisClient = getRedis();
  if (!redisClient) return null;

  if (!rateLimiters.has(type)) {
    const config = RATE_LIMIT_CONFIG[type];
    rateLimiters.set(
      type,
      new Ratelimit({
        redis: redisClient,
        limiter: Ratelimit.slidingWindow(config.requests, config.window),
        analytics: true,
        prefix: `ratelimit:${type}`,
      })
    );
  }

  return rateLimiters.get(type)!;
}

// Get client identifier (IP or user ID)
export function getClientIdentifier(req: NextRequest, userId?: string): string {
  if (userId) {
    return `user:${userId}`;
  }

  // Get IP from various headers (Vercel, Cloudflare, etc.)
  const forwardedFor = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const cfConnectingIp = req.headers.get('cf-connecting-ip');

  const ip = cfConnectingIp || realIp || forwardedFor?.split(',')[0]?.trim() || 'anonymous';
  return `ip:${ip}`;
}

// Determine rate limit type based on path
export function getRateLimitType(pathname: string): RateLimitType {
  if (pathname.startsWith('/api/crawl')) {
    return 'crawl';
  }
  if (pathname.startsWith('/api/search')) {
    return 'search';
  }
  // Public APIs
  const publicPaths = ['/api/news', '/api/companies', '/api/personnel'];
  if (publicPaths.some(p => pathname.startsWith(p))) {
    return 'public';
  }
  return 'authenticated';
}

// Rate limit response
export function rateLimitResponse(resetTime: number): NextResponse {
  const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);

  return NextResponse.json(
    {
      success: false,
      error: '요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter,
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfter),
        'X-RateLimit-Reset': String(resetTime),
      },
    }
  );
}

// Main rate limit check function
export async function checkRateLimit(
  req: NextRequest,
  userId?: string
): Promise<{ success: boolean; reset?: number; remaining?: number }> {
  const pathname = req.nextUrl.pathname;
  const type = getRateLimitType(pathname);
  const limiter = getRateLimiter(type);

  // If rate limiting is not configured, allow all requests
  if (!limiter) {
    return { success: true };
  }

  const identifier = getClientIdentifier(req, userId);
  const result = await limiter.limit(identifier);

  return {
    success: result.success,
    reset: result.reset,
    remaining: result.remaining,
  };
}

// Add rate limit headers to response
export function addRateLimitHeaders(
  response: NextResponse,
  remaining?: number,
  reset?: number
): NextResponse {
  if (remaining !== undefined) {
    response.headers.set('X-RateLimit-Remaining', String(remaining));
  }
  if (reset !== undefined) {
    response.headers.set('X-RateLimit-Reset', String(reset));
  }
  return response;
}

// Middleware helper for API routes
export async function withRateLimit(
  req: NextRequest,
  handler: () => Promise<NextResponse>,
  userId?: string
): Promise<NextResponse> {
  const result = await checkRateLimit(req, userId);

  if (!result.success) {
    return rateLimitResponse(result.reset!);
  }

  const response = await handler();
  return addRateLimitHeaders(response, result.remaining, result.reset);
}
