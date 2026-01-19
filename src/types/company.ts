// 증권사 관련 타입 정의

export interface SecuritiesCompany {
  id: string;
  name: string;
  code?: string | null;
  logoUrl?: string | null;
  websiteUrl?: string | null;
  newsroomUrl?: string | null;
  isActive: boolean;
  isPowerbaseClient?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SecuritiesCompanyWithStats extends SecuritiesCompany {
  _count?: {
    news: number;
    personnel: number;
  };
  recentNewsCount?: number;
  latestNewsDate?: Date | null;
}

// PowerBase 회원 증권사 목록 (시드 데이터용)
export const SECURITIES_COMPANIES = [
  { name: '삼성증권', code: 'SAMSUNG' },
  { name: '미래에셋증권', code: 'MIRAE' },
  { name: 'NH투자증권', code: 'NH' },
  { name: 'KB증권', code: 'KB' },
  { name: '한국투자증권', code: 'HANKOOK' },
  { name: '신한투자증권', code: 'SHINHAN' },
  { name: '키움증권', code: 'KIWOOM' },
  { name: '대신증권', code: 'DAISHIN' },
  { name: '하나증권', code: 'HANA' },
  { name: '메리츠증권', code: 'MERITZ' },
  { name: '유안타증권', code: 'YUANTA' },
  { name: '현대차증권', code: 'HYUNDAI' },
  { name: 'SK증권', code: 'SK' },
  { name: '한화투자증권', code: 'HANWHA' },
  { name: '교보증권', code: 'KYOBO' },
  { name: 'DB금융투자', code: 'DB' },
  { name: 'IBK투자증권', code: 'IBK' },
  { name: '유진투자증권', code: 'EUGENE' },
  { name: '이베스트투자증권', code: 'EBEST' },
  { name: '신영증권', code: 'SHINYOUNG' },
  { name: '부국증권', code: 'BOOKOOK' },
  { name: '케이프투자증권', code: 'CAPE' },
  { name: '하이투자증권', code: 'HI' },
  { name: '토스증권', code: 'TOSS' },
  { name: '카카오페이증권', code: 'KAKAOPAY' },
] as const;

export type SecuritiesCompanyCode = typeof SECURITIES_COMPANIES[number]['code'];
