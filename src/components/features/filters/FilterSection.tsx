'use client';

import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { NEWS_CATEGORY_LABELS, type NewsCategory } from '@/types/news';
import { DATE_FILTER_OPTIONS } from '@/constants';
import { Star } from 'lucide-react';
import type { FilterUIState } from './useFilterUI';

/**
 * Checkbox item component for filter lists
 */
export function CheckboxItem({
  id,
  checked,
  onCheckedChange,
  label,
  count,
  className = '',
}: {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  count?: number;
  className?: string;
}) {
  return (
    <label
      htmlFor={id}
      className={`flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-gray-100 ${className}`}
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

/**
 * Date range filter section
 */
export function DateRangeFilter({
  dateRange,
  setDateRange,
  variant = 'badge',
}: {
  dateRange: FilterUIState['dateRange'];
  setDateRange: FilterUIState['setDateRange'];
  variant?: 'badge' | 'checkbox';
}) {
  if (variant === 'badge') {
    return (
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
    );
  }

  // Checkbox variant
  return (
    <div className="space-y-1">
      {DATE_FILTER_OPTIONS.map(option => (
        <CheckboxItem
          key={option.value}
          id={`date-${option.value}`}
          checked={dateRange === option.value}
          onCheckedChange={() => setDateRange(option.value as typeof dateRange)}
          label={option.label}
        />
      ))}
    </div>
  );
}

/**
 * Category filter section
 */
export function CategoryFilter({
  categories,
  selectedCategories,
  toggleCategory,
  variant = 'checkbox',
}: {
  categories: NewsCategory[];
  selectedCategories: NewsCategory[];
  toggleCategory: (category: NewsCategory) => void;
  variant?: 'badge' | 'checkbox';
}) {
  if (variant === 'badge') {
    return (
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <Badge
            key={category}
            variant={selectedCategories.includes(category) ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => toggleCategory(category)}
          >
            {NEWS_CATEGORY_LABELS[category]}
          </Badge>
        ))}
      </div>
    );
  }

  // Checkbox variant
  return (
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
  );
}

/**
 * Company filter section
 */
export function CompanyFilter({
  companies,
  selectedCompanyIds,
  toggleCompany,
  isCompanyAssigned,
  isLoading,
  variant = 'checkbox',
}: {
  companies: Array<{
    id: string;
    name: string;
    isPowerbaseClient?: boolean;
    _count?: { news?: number };
  }>;
  selectedCompanyIds: string[];
  toggleCompany: (id: string) => void;
  isCompanyAssigned?: (id: string) => boolean;
  isLoading?: boolean;
  variant?: 'badge' | 'checkbox';
}) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    );
  }

  if (variant === 'badge') {
    return (
      <div className="flex flex-wrap gap-2">
        {companies.map(company => (
          <Badge
            key={company.id}
            variant={selectedCompanyIds.includes(company.id) ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => toggleCompany(company.id)}
          >
            {company.name}
          </Badge>
        ))}
      </div>
    );
  }

  // Checkbox variant with assigned company highlighting
  return (
    <div className="space-y-1">
      {companies.map(company => {
        const isAssigned = isCompanyAssigned?.(company.id) ?? false;
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
  );
}

/**
 * Toggle filters section (Personnel only, Powerbase only)
 */
export function ToggleFilters({
  showPersonnelOnly,
  setShowPersonnelOnly,
  showPowerbaseOnly,
  setShowPowerbaseOnly,
  powerbaseCount,
}: {
  showPersonnelOnly: boolean;
  setShowPersonnelOnly: (value: boolean) => void;
  showPowerbaseOnly: boolean;
  setShowPowerbaseOnly: (value: boolean) => void;
  powerbaseCount?: number;
}) {
  return (
    <>
      <CheckboxItem
        id="personnel-only"
        checked={showPersonnelOnly}
        onCheckedChange={setShowPersonnelOnly}
        label="인사 뉴스만 보기"
      />
      <CheckboxItem
        id="powerbase-only"
        checked={showPowerbaseOnly}
        onCheckedChange={setShowPowerbaseOnly}
        label="Powerbase 고객사만"
        count={powerbaseCount}
      />
    </>
  );
}

/**
 * Assigned companies info banner
 */
export function AssignedCompaniesBanner({
  isLoggedIn,
  assignedCompanyIds,
}: {
  isLoggedIn: boolean;
  assignedCompanyIds: string[];
}) {
  if (!isLoggedIn || assignedCompanyIds.length === 0) {
    return null;
  }

  return (
    <div className="mb-3 rounded-lg bg-blue-50 p-2">
      <p className="mb-1 flex items-center gap-1 text-xs font-medium text-blue-700">
        <Star className="h-3 w-3 fill-current" />
        내 담당 증권사 ({assignedCompanyIds.length}개)
      </p>
      <p className="text-xs text-blue-600">
        담당 증권사의 뉴스가 자동으로 필터링됩니다
      </p>
    </div>
  );
}
