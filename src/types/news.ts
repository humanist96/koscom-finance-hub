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
  createdAt: Date;
  updatedAt: Date;
}

export interface PersonnelChangeWithCompany extends PersonnelChange {
  company: SecuritiesCompany;
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
