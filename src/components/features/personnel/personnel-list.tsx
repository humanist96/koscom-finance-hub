'use client';

import { usePersonnel } from '@/hooks/use-personnel';
import { PersonnelItem } from './personnel-item';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface PersonnelListProps {
  companyIds?: string[];
  changeTypes?: string[];
  dateRange?: string;
}

export function PersonnelList({
  companyIds,
  changeTypes,
  dateRange = '1month',
}: PersonnelListProps) {
  const { data, isLoading, isError, refetch } = usePersonnel({
    companyIds,
    changeTypes,
    startDate: dateRange,
    limit: 50,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-4">
            <div className="flex gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="mb-2 h-5 w-48" />
                <Skeleton className="mb-1 h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 p-8 text-center">
        <AlertCircle className="mb-2 h-8 w-8 text-red-500" />
        <p className="mb-4 text-red-700">인사 정보를 불러오는데 실패했습니다.</p>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          다시 시도
        </Button>
      </div>
    );
  }

  const personnel = data?.data?.items || [];

  if (personnel.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
        <p className="text-gray-500">조건에 맞는 인사 정보가 없습니다.</p>
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
          총 <strong>{data?.data?.pagination.total || 0}</strong>개의 인사 정보
        </p>
        <Button variant="ghost" size="sm" onClick={() => refetch()}>
          <RefreshCw className="mr-1 h-3 w-3" />
          새로고침
        </Button>
      </div>
      {personnel.map(item => (
        <PersonnelItem
          key={item.id}
          personName={item.personName}
          position={item.position}
          department={item.department}
          changeType={item.changeType}
          previousPosition={item.previousPosition}
          announcedAt={item.announcedAt}
          effectiveDate={item.effectiveDate}
          company={item.company}
        />
      ))}
    </div>
  );
}
