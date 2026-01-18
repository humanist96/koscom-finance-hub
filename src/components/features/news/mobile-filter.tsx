'use client';

import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCompanies } from '@/hooks/use-companies';
import { useFilterStore } from '@/stores/filter-store';
import { NEWS_CATEGORY_LABELS, type NewsCategory } from '@/types/news';
import { DATE_FILTER_OPTIONS } from '@/constants';

export function MobileFilter() {
  const [open, setOpen] = useState(false);
  const { data: companiesData } = useCompanies({ withStats: true });
  const {
    selectedCompanyIds,
    selectedCategories,
    dateRange,
    showPersonnelOnly,
    toggleCompany,
    toggleCategory,
    setDateRange,
    setShowPersonnelOnly,
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

  const activeFilterCount =
    selectedCompanyIds.length +
    selectedCategories.length +
    (showPersonnelOnly ? 1 : 0) +
    (dateRange !== '1week' ? 1 : 0);

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
                <div className="flex flex-wrap gap-2">
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

              {/* 인사 뉴스 */}
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showPersonnelOnly}
                    onChange={e => setShowPersonnelOnly(e.target.checked)}
                    className="h-4 w-4 rounded"
                  />
                  <span>인사 뉴스만 보기</span>
                </label>
              </div>

              {/* 카테고리 */}
              <div>
                <h4 className="mb-2 font-medium">카테고리</h4>
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
              </div>

              {/* 증권사 */}
              <div>
                <h4 className="mb-2 font-medium">증권사</h4>
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
