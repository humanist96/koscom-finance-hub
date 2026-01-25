/**
 * Contract page constants and types
 */

export type TabType = 'revenue' | 'service' | 'customer' | 'insight';

export const CATEGORY_LABELS: Record<string, string> = {
  DOMESTIC: '국내',
  FOREIGN: '외자계',
  MIGRATED: '이관사',
};

export const TYPE_LABELS: Record<string, string> = {
  SECURITIES: '증권사',
  INSTITUTION: '유관기관',
  ASSET_MGMT: '자산운용사',
  FUTURES: '선물사',
  MEDIA: '신문사',
};

export const TABS = [
  { key: 'revenue' as const, label: '매출 분석' },
  { key: 'service' as const, label: '서비스 분석' },
  { key: 'customer' as const, label: '고객사 분석' },
  { key: 'insight' as const, label: '영업 인사이트' },
];

export const CATEGORY_COLORS: Record<string, string> = {
  DOMESTIC: 'bg-blue-100 text-blue-700',
  FOREIGN: 'bg-green-100 text-green-700',
  MIGRATED: 'bg-yellow-100 text-yellow-700',
};

export function getCategoryBadgeClass(category: string): string {
  return CATEGORY_COLORS[category] || 'bg-gray-100 text-gray-700';
}
