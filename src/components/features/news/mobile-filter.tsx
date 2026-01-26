'use client';

import { useState } from 'react';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  useFilterUI,
  DateRangeFilter,
  CategoryFilter,
  CompanyFilter,
  CheckboxItem,
} from '@/components/features/filters';

export function MobileFilter() {
  const [open, setOpen] = useState(false);
  const {
    filteredCompanies,
    categories,
    selectedCompanyIds,
    selectedCategories,
    dateRange,
    showPersonnelOnly,
    showPowerbaseOnly,
    activeFilterCount,
    toggleCompany,
    toggleCategory,
    setDateRange,
    setShowPersonnelOnly,
    setShowPowerbaseOnly,
    resetFilters,
  } = useFilterUI();

  return (
    <div className="lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            필터
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[80vh]">
          <SheetHeader className="mb-4">
            <SheetTitle className="flex items-center justify-between">
              필터
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  초기화
                </Button>
              )}
            </SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-full pb-20">
            <div className="space-y-6 px-1">
              {/* 기간 */}
              <div>
                <h4 className="mb-2 font-medium">기간</h4>
                <DateRangeFilter
                  dateRange={dateRange}
                  setDateRange={setDateRange}
                  variant="badge"
                />
              </div>

              {/* 인사 뉴스 */}
              <div>
                <CheckboxItem
                  id="mobile-personnel-only"
                  checked={showPersonnelOnly}
                  onCheckedChange={setShowPersonnelOnly}
                  label="인사 뉴스만 보기"
                />
              </div>

              {/* Powerbase 고객사 */}
              <div>
                <CheckboxItem
                  id="mobile-powerbase-only"
                  checked={showPowerbaseOnly}
                  onCheckedChange={setShowPowerbaseOnly}
                  label="Powerbase 고객사만"
                />
              </div>

              {/* 카테고리 */}
              <div>
                <h4 className="mb-2 font-medium">카테고리</h4>
                <CategoryFilter
                  categories={categories}
                  selectedCategories={selectedCategories}
                  toggleCategory={toggleCategory}
                  variant="badge"
                />
              </div>

              {/* 증권사 */}
              <div>
                <h4 className="mb-2 font-medium">증권사 ({filteredCompanies.length})</h4>
                <CompanyFilter
                  companies={filteredCompanies}
                  selectedCompanyIds={selectedCompanyIds}
                  toggleCompany={toggleCompany}
                  variant="badge"
                />
              </div>
            </div>
          </ScrollArea>
          <div className="absolute bottom-0 left-0 right-0 border-t bg-white p-4">
            <Button className="w-full" onClick={() => setOpen(false)}>
              적용하기
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
