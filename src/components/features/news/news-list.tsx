'use client';

import { useNews } from '@/hooks/use-news';
import { useFilterStore } from '@/stores/filter-store';
import { useSession } from 'next-auth/react';
import { NewsCard } from './news-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

export function NewsList() {
  const {
    selectedCompanyIds,
    selectedCategories,
    dateRange,
    showPersonnelOnly,
    showPowerbaseOnly,
    searchKeyword,
  } = useFilterStore();

  const { data: session } = useSession();
  const user = session?.user;

  // 담당 증권사가 설정되어 있으면 해당 증권사만 필터링
  // 필터에서 직접 선택한 경우 해당 선택 우선
  const effectiveCompanyIds =
    selectedCompanyIds.length > 0
      ? selectedCompanyIds
      : user?.assignedCompanyIds?.length
        ? user.assignedCompanyIds
        : undefined;

  const { data, isLoading, isError, refetch } = useNews({
    companyIds: effectiveCompanyIds,
    categories: selectedCategories.length > 0 ? selectedCategories : undefined,
    isPersonnel: showPersonnelOnly || undefined,
    isPowerbaseOnly: showPowerbaseOnly || undefined,
    startDate: dateRange,
    keyword: searchKeyword || undefined,
    limit: 50,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-4">
            <div className="mb-2 flex items-center gap-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="mb-2 h-6 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 p-8 text-center">
        <AlertCircle className="mb-2 h-8 w-8 text-red-500" />
        <p className="mb-4 text-red-700">뉴스를 불러오는데 실패했습니다.</p>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          다시 시도
        </Button>
      </div>
    );
  }

  const news = data?.data?.items || [];

  if (news.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
        <p className="text-gray-500">조건에 맞는 뉴스가 없습니다.</p>
        <p className="mt-1 text-sm text-gray-400">
          필터 조건을 변경하거나 기간을 넓혀보세요.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          총 <strong>{data?.data?.pagination.total || 0}</strong>개의 뉴스
        </p>
        <Button variant="ghost" size="sm" onClick={() => refetch()}>
          <RefreshCw className="mr-1 h-3 w-3" />
          새로고침
        </Button>
      </div>
      {news.map(item => (
        <NewsCard
          key={item.id}
          id={item.id}
          title={item.title}
          summary={item.summary}
          sourceUrl={item.sourceUrl}
          sourceName={item.sourceName}
          category={item.category}
          isPersonnel={item.isPersonnel}
          publishedAt={item.publishedAt}
          company={item.company}
        />
      ))}
    </div>
  );
}
