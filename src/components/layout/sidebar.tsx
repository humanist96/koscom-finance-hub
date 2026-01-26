'use client';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RotateCcw } from 'lucide-react';
import Link from 'next/link';
import {
  useFilterUI,
  DateRangeFilter,
  CategoryFilter,
  CompanyFilter,
  ToggleFilters,
  AssignedCompaniesBanner,
} from '@/components/features/filters';

export function Sidebar() {
  const {
    filteredCompanies,
    companies,
    categories,
    powerbaseCount,
    isLoadingCompanies,
    isLoggedIn,
    assignedCompanyIds,
    isCompanyAssigned,
    selectedCompanyIds,
    selectedCategories,
    dateRange,
    showPersonnelOnly,
    showPowerbaseOnly,
    hasActiveFilters,
    toggleCompany,
    toggleCategory,
    setDateRange,
    setShowPersonnelOnly,
    setShowPowerbaseOnly,
    resetFilters,
  } = useFilterUI();

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
            <DateRangeFilter
              dateRange={dateRange}
              setDateRange={setDateRange}
              variant="badge"
            />
          </div>

          {/* 인사 뉴스만 보기 & Powerbase 고객사만 보기 */}
          <div className="mb-6 space-y-1">
            <ToggleFilters
              showPersonnelOnly={showPersonnelOnly}
              setShowPersonnelOnly={setShowPersonnelOnly}
              showPowerbaseOnly={showPowerbaseOnly}
              setShowPowerbaseOnly={setShowPowerbaseOnly}
              powerbaseCount={powerbaseCount}
            />
          </div>

          {/* 카테고리 필터 */}
          <div className="mb-6">
            <h3 className="mb-2 text-sm font-semibold text-gray-700">카테고리</h3>
            <CategoryFilter
              categories={categories}
              selectedCategories={selectedCategories}
              toggleCategory={toggleCategory}
              variant="checkbox"
            />
          </div>

          {/* 증권사 필터 */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">
                증권사 ({filteredCompanies.length}
                {showPowerbaseOnly ? '' : `/${companies.length}`})
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

            <AssignedCompaniesBanner
              isLoggedIn={isLoggedIn}
              assignedCompanyIds={assignedCompanyIds}
            />

            <CompanyFilter
              companies={filteredCompanies}
              selectedCompanyIds={selectedCompanyIds}
              toggleCompany={toggleCompany}
              isCompanyAssigned={isCompanyAssigned}
              isLoading={isLoadingCompanies}
              variant="checkbox"
            />
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}
