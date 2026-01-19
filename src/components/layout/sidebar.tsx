'use client';

import { useCompanies } from '@/hooks/use-companies';
import { useFilterStore } from '@/stores/filter-store';
import { useAuthStore } from '@/store/auth-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { NEWS_CATEGORY_LABELS, type NewsCategory } from '@/types/news';
import { DATE_FILTER_OPTIONS, CATEGORY_COLORS } from '@/constants';
import { RotateCcw, Star } from 'lucide-react';
import Link from 'next/link';

// Checkbox 컴포넌트가 없으므로 간단히 구현
function CheckboxItem({
  id,
  checked,
  onCheckedChange,
  label,
  count,
}: {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  count?: number;
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-gray-100"
    >
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={e => onCheckedChange(e.target.checked)}
        className="h-4 w-4 rounded border-gray-300"
      />
      <span className="flex-1 text-sm">{label}</span>
      {count !== undefined && (
        <span className="text-xs text-gray-400">{count}</span>
      )}
    </label>
  );
}

export function Sidebar() {
  const { data: companiesData, isLoading } = useCompanies({ withStats: true });
  const { user, isLoggedIn } = useAuthStore();
  const {
    selectedCompanyIds,
    selectedCategories,
    dateRange,
    showPersonnelOnly,
    showPowerbaseOnly,
    toggleCompany,
    toggleCategory,
    setDateRange,
    setShowPersonnelOnly,
    setShowPowerbaseOnly,
    resetFilters,
  } = useFilterStore();

  const companies = companiesData?.data || [];
  const categories: NewsCategory[] = [
    'GENERAL',
    'PERSONNEL',
    'BUSINESS',
    'PRODUCT',
    'IR',
    'EVENT',
  ];

  // 사용자의 담당 증권사 ID 목록
  const assignedCompanyIds = user?.assignedCompanyIds || [];

  // 담당 증권사를 먼저 보여주도록 정렬
  const sortedCompanies = [...companies].sort((a, b) => {
    const aAssigned = assignedCompanyIds.includes(a.id);
    const bAssigned = assignedCompanyIds.includes(b.id);
    if (aAssigned && !bAssigned) return -1;
    if (!aAssigned && bAssigned) return 1;
    return 0;
  });

  // Powerbase 고객사만 필터링
  const filteredCompanies = showPowerbaseOnly
    ? sortedCompanies.filter((c: { isPowerbaseClient?: boolean }) => c.isPowerbaseClient)
    : sortedCompanies;

  // Powerbase 고객사 수
  const powerbaseCount = companies.filter((c: { isPowerbaseClient?: boolean }) => c.isPowerbaseClient).length;

  const hasActiveFilters =
    selectedCompanyIds.length > 0 ||
    selectedCategories.length > 0 ||
    dateRange !== '1week' ||
    showPersonnelOnly ||
    showPowerbaseOnly;

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-gray-50/50 lg:block">
      <ScrollArea className="h-[calc(100vh-3.5rem)]">
        <div className="p-4">
          {/* 필터 리셋 */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="mb-4 w-full justify-start text-gray-500"
              onClick={resetFilters}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              필터 초기화
            </Button>
          )}

          {/* 기간 필터 */}
          <div className="mb-6">
            <h3 className="mb-2 text-sm font-semibold text-gray-700">기간</h3>
            <div className="flex flex-wrap gap-1">
              {DATE_FILTER_OPTIONS.map(option => (
                <Badge
                  key={option.value}
                  variant={dateRange === option.value ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setDateRange(option.value as typeof dateRange)}
                >
                  {option.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* 인사 뉴스만 보기 */}
          <div className="mb-4">
            <CheckboxItem
              id="personnel-only"
              checked={showPersonnelOnly}
              onCheckedChange={setShowPersonnelOnly}
              label="인사 뉴스만 보기"
            />
          </div>

          {/* Powerbase 고객사만 보기 */}
          <div className="mb-6">
            <CheckboxItem
              id="powerbase-only"
              checked={showPowerbaseOnly}
              onCheckedChange={setShowPowerbaseOnly}
              label="Powerbase 고객사만"
              count={powerbaseCount}
            />
          </div>

          {/* 카테고리 필터 */}
          <div className="mb-6">
            <h3 className="mb-2 text-sm font-semibold text-gray-700">카테고리</h3>
            <div className="space-y-1">
              {categories.map(category => (
                <CheckboxItem
                  key={category}
                  id={`category-${category}`}
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={() => toggleCategory(category)}
                  label={NEWS_CATEGORY_LABELS[category]}
                />
              ))}
            </div>
          </div>

          {/* 증권사 필터 */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">
                증권사 ({filteredCompanies.length}{showPowerbaseOnly ? '' : `/${companies.length}`})
              </h3>
              {isLoggedIn && (
                <Link
                  href="/dashboard/settings"
                  className="text-xs text-blue-600 hover:underline"
                >
                  담당 설정
                </Link>
              )}
            </div>

            {/* 담당 증권사 표시 */}
            {isLoggedIn && assignedCompanyIds.length > 0 && (
              <div className="mb-3 rounded-lg bg-blue-50 p-2">
                <p className="mb-1 flex items-center gap-1 text-xs font-medium text-blue-700">
                  <Star className="h-3 w-3 fill-current" />
                  내 담당 증권사 ({assignedCompanyIds.length}개)
                </p>
                <p className="text-xs text-blue-600">
                  담당 증권사의 뉴스가 자동으로 필터링됩니다
                </p>
              </div>
            )}

            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 10 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {filteredCompanies.map((company: { id: string; name: string; isPowerbaseClient?: boolean; _count?: { news?: number } }) => {
                  const isAssigned = assignedCompanyIds.includes(company.id);
                  return (
                    <label
                      key={company.id}
                      htmlFor={`company-${company.id}`}
                      className={`flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-gray-100 ${
                        isAssigned ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        id={`company-${company.id}`}
                        checked={selectedCompanyIds.includes(company.id)}
                        onChange={() => toggleCompany(company.id)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <span className="flex flex-1 items-center gap-1 text-sm">
                        {company.name}
                        {isAssigned && (
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        )}
                      </span>
                      {company._count?.news !== undefined && (
                        <span className="text-xs text-gray-400">
                          {company._count.news}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}
