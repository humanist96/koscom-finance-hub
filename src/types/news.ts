// 뉴스 관련 타입 정의

import type { SecuritiesCompany } from './company';

export type NewsCategory =
  | 'GENERAL'    // 일반
  | 'PERSONNEL'  // 인사
  | 'BUSINESS'   // 사업/실적
  | 'PRODUCT'    // 상품/서비스
  | 'IR'         // IR/공시
  | 'EVENT';     // 행사/이벤트

export const NEWS_CATEGORY_LABELS: Record<NewsCategory, string> = {
  GENERAL: '일반',
  PERSONNEL: '인사',
  BUSINESS: '사업/실적',
  PRODUCT: '상품/서비스',
  IR: 'IR/공시',
  EVENT: '행사/이벤트',
};

export interface News {
  id: string;
  companyId: string;
  title: string;
  content?: string | null;
  summary?: string | null;
  sourceUrl: string;
  sourceName?: string | null;
  imageUrl?: string | null;
  category: NewsCategory;
  isPersonnel: boolean;
  publishedAt: Date;
  crawledAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewsWithCompany extends News {
  company: SecuritiesCompany;
}

export interface NewsWithKeywords extends News {
  keywords: { keyword: { id: string; name: string } }[];
}

export interface NewsListItem {
  id: string;
  title: string;
  summary?: string | null;
  sourceUrl: string;
  sourceName?: string | null;
  category: NewsCategory;
  isPersonnel: boolean;
  publishedAt: Date;
  company: {
    id: string;
    name: string;
    logoUrl?: string | null;
  };
}

// 인사 변동 관련
export type PersonnelChangeType =
  | 'APPOINTMENT'  // 신규 임명
  | 'PROMOTION'    // 승진
  | 'TRANSFER'     // 전보
  | 'RESIGNATION'  // 사임/퇴직
  | 'RETIREMENT';  // 정년퇴직

export const PERSONNEL_CHANGE_LABELS: Record<PersonnelChangeType, string> = {
  APPOINTMENT: '신규 임명',
  PROMOTION: '승진',
  TRANSFER: '전보',
  RESIGNATION: '사임/퇴직',
  RETIREMENT: '정년퇴직',
};

// 인사정보 소스 타입
export type PersonnelSourceType = 'CRAWLED' | 'MANUAL' | 'EXCEL_IMPORT';

export const PERSONNEL_SOURCE_LABELS: Record<PersonnelSourceType, string> = {
  CRAWLED: '크롤링',
  MANUAL: '수기 입력',
  EXCEL_IMPORT: '엑셀 업로드',
};

export const PERSONNEL_SOURCE_COLORS: Record<PersonnelSourceType, string> = {
  CRAWLED: 'bg-purple-100 text-purple-800',
  MANUAL: 'bg-blue-100 text-blue-800',
  EXCEL_IMPORT: 'bg-orange-100 text-orange-800',
};

export interface PersonnelChange {
  id: string;
  companyId: string;
  personName: string;
  position?: string | null;
  department?: string | null;
  changeType: PersonnelChangeType;
  previousPosition?: string | null;
  sourceUrl?: string | null;
  effectiveDate?: Date | null;
  announcedAt: Date;
  sourceType: PersonnelSourceType;
  createdById?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PersonnelChangeWithCompany extends PersonnelChange {
  company: SecuritiesCompany;
}

// Admin용 인사정보 (생성자 정보 포함)
export interface AdminPersonnelChange extends PersonnelChangeWithCompany {
  creator?: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

// 인사정보 생성 DTO
export interface CreatePersonnelDto {
  companyId: string;
  personName: string;
  position?: string;
  department?: string;
  changeType: PersonnelChangeType;
  previousPosition?: string;
  sourceUrl?: string;
  effectiveDate?: string;
  announcedAt: string;
}

// 인사정보 수정 DTO
export interface UpdatePersonnelDto extends Partial<CreatePersonnelDto> {}

// Admin 인사정보 조회 파라미터
export interface GetAdminPersonnelParams {
  page?: number;
  limit?: number;
  companyIds?: string[];
  changeTypes?: string[];
  sourceTypes?: string[];
  keyword?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 필터 옵션
export interface NewsFilterOptions {
  companyIds?: string[];
  categories?: NewsCategory[];
  isPersonnel?: boolean;
  startDate?: Date;
  endDate?: Date;
  keyword?: string;
}

export interface PersonnelFilterOptions {
  companyIds?: string[];
  changeTypes?: PersonnelChangeType[];
  startDate?: Date;
  endDate?: Date;
  keyword?: string;
}
