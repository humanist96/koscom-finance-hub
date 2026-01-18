// 앱 상수 정의

// 페이지네이션 기본값
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// 캐시 TTL (초)
export const CACHE_TTL = {
  NEWS_LIST: 60 * 5,      // 5분
  NEWS_DETAIL: 60 * 10,   // 10분
  COMPANY_LIST: 60 * 60,  // 1시간
  PERSONNEL: 60 * 5,      // 5분
} as const;

// 크롤링 관련
export const CRAWL_CONFIG = {
  MAX_CONCURRENT: 5,
  REQUEST_DELAY_MS: 1000,
  MAX_RETRIES: 3,
  TIMEOUT_MS: 30000,
} as const;

// 뉴스 기간 필터 옵션
export const DATE_FILTER_OPTIONS = [
  { label: '오늘', value: 'today' },
  { label: '최근 3일', value: '3days' },
  { label: '최근 1주', value: '1week' },
  { label: '최근 1개월', value: '1month' },
  { label: '전체', value: 'all' },
] as const;

// 카테고리 색상 (Badge용)
export const CATEGORY_COLORS: Record<string, string> = {
  GENERAL: 'bg-gray-100 text-gray-800',
  PERSONNEL: 'bg-blue-100 text-blue-800',
  BUSINESS: 'bg-green-100 text-green-800',
  PRODUCT: 'bg-purple-100 text-purple-800',
  IR: 'bg-yellow-100 text-yellow-800',
  EVENT: 'bg-pink-100 text-pink-800',
};

// 인사 변동 유형 색상
export const PERSONNEL_CHANGE_COLORS: Record<string, string> = {
  APPOINTMENT: 'bg-green-100 text-green-800',
  PROMOTION: 'bg-blue-100 text-blue-800',
  TRANSFER: 'bg-yellow-100 text-yellow-800',
  RESIGNATION: 'bg-red-100 text-red-800',
  RETIREMENT: 'bg-gray-100 text-gray-800',
};

// API 경로
export const API_ROUTES = {
  NEWS: '/api/news',
  COMPANIES: '/api/companies',
  PERSONNEL: '/api/personnel',
  SEARCH: '/api/search',
  CRAWL: '/api/crawl',
  SUMMARIZE: '/api/summarize',
} as const;
