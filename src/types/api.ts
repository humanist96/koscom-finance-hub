// API 관련 타입 정의

// API 응답 기본 타입
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 페이지네이션
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// 정렬
export type SortOrder = 'asc' | 'desc';

export interface SortParams {
  sortBy?: string;
  sortOrder?: SortOrder;
}

// 뉴스 API 파라미터
export interface GetNewsParams extends PaginationParams, SortParams {
  companyId?: string;
  companyIds?: string[];
  category?: string;
  categories?: string[];
  isPersonnel?: boolean;
  startDate?: string;
  endDate?: string;
  keyword?: string;
}

// 증권사 API 파라미터
export interface GetCompaniesParams extends PaginationParams, SortParams {
  isActive?: boolean;
  withStats?: boolean;
}

// 인사 정보 API 파라미터
export interface GetPersonnelParams extends PaginationParams, SortParams {
  companyId?: string;
  companyIds?: string[];
  changeType?: string;
  changeTypes?: string[];
  startDate?: string;
  endDate?: string;
  keyword?: string;
}

// 검색 API 파라미터
export interface SearchParams extends PaginationParams {
  query: string;
  type?: 'all' | 'news' | 'personnel';
  companyIds?: string[];
}

// AI 요약 요청
export interface SummarizeRequest {
  newsIds: string[];
  type?: 'individual' | 'weekly';
}

export interface SummarizeResponse {
  summaries: {
    newsId: string;
    summary: string;
  }[];
  weeklyReport?: string;
}

// 크롤링 상태
export interface CrawlStatus {
  isRunning: boolean;
  lastRunAt?: Date;
  lastRunStatus?: 'SUCCESS' | 'FAILED' | 'RUNNING';
  itemsFound?: number;
  nextRunAt?: Date;
}
