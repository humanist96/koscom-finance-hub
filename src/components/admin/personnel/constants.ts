import type { PersonnelChangeType, PersonnelSourceType } from '@/types/news';

export interface PersonnelItem {
  id: string;
  companyId: string;
  personName: string;
  position: string | null;
  department: string | null;
  changeType: PersonnelChangeType;
  previousPosition: string | null;
  sourceUrl: string | null;
  effectiveDate: Date | null;
  announcedAt: Date;
  sourceType: PersonnelSourceType;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
  company: {
    id: string;
    name: string;
    code: string | null;
  };
}

export const CHANGE_TYPE_OPTIONS = [
  { value: 'APPOINTMENT', label: '신규 임명' },
  { value: 'PROMOTION', label: '승진' },
  { value: 'TRANSFER', label: '전보' },
  { value: 'RESIGNATION', label: '사임/퇴직' },
  { value: 'RETIREMENT', label: '정년퇴직' },
] as const;

export const SOURCE_TYPE_OPTIONS = [
  { value: 'CRAWLED', label: '크롤링' },
  { value: 'MANUAL', label: '수기 입력' },
  { value: 'EXCEL_IMPORT', label: '엑셀 업로드' },
] as const;

export const CHANGE_TYPE_COLORS: Record<string, string> = {
  APPOINTMENT: 'bg-green-100 text-green-800',
  PROMOTION: 'bg-blue-100 text-blue-800',
  TRANSFER: 'bg-yellow-100 text-yellow-800',
  RESIGNATION: 'bg-red-100 text-red-800',
  RETIREMENT: 'bg-gray-100 text-gray-800',
};

export const SOURCE_TYPE_COLORS: Record<string, string> = {
  CRAWLED: 'bg-purple-100 text-purple-800',
  MANUAL: 'bg-blue-100 text-blue-800',
  EXCEL_IMPORT: 'bg-orange-100 text-orange-800',
};

export const CHANGE_TYPE_LABELS: Record<string, string> = {
  APPOINTMENT: '신규 임명',
  PROMOTION: '승진',
  TRANSFER: '전보',
  RESIGNATION: '사임/퇴직',
  RETIREMENT: '정년퇴직',
};

export const SOURCE_TYPE_LABELS: Record<string, string> = {
  CRAWLED: '크롤링',
  MANUAL: '수기 입력',
  EXCEL_IMPORT: '엑셀 업로드',
};
