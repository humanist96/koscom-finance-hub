'use client';

import { usePersonnel } from '@/hooks/use-personnel';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, RefreshCw, ExternalLink, Building2, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import Link from 'next/link';

interface PersonnelListProps {
  companyIds?: string[];
  changeTypes?: string[];
  dateRange?: string;
}

interface PersonnelNewsItem {
  id: string;
  title: string;
  summary: string | null;
  sourceUrl: string;
  sourceName: string | null;
  publishedAt: string;
  company: {
    id: string;
    name: string;
    code: string;
    logoUrl: string | null;
  };
}

export function PersonnelList({
  companyIds,
  dateRange = '1month',
}: PersonnelListProps) {
  const { data, isLoading, isError, refetch } = usePersonnel({
    companyIds,
    startDate: dateRange,
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
        <p className="mb-4 text-red-700">인사 정보를 불러오는데 실패했습니다.</p>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          다시 시도
        </Button>
      </div>
    );
  }

  const personnel = (data?.data?.items || []) as unknown as PersonnelNewsItem[];

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
          총 <strong>{data?.data?.pagination.total || 0}</strong>개의 인사 뉴스
        </p>
        <Button variant="ghost" size="sm" onClick={() => refetch()}>
          <RefreshCw className="mr-1 h-3 w-3" />
          새로고침
        </Button>
      </div>

      <div className="space-y-3">
        {personnel.map(item => (
          <article
            key={item.id}
            className="group rounded-lg border bg-white p-4 transition-all hover:border-purple-200 hover:shadow-md"
          >
            {/* Header */}
            <div className="mb-2 flex items-center gap-2 text-sm">
              <Link
                href={`/dashboard/companies/${item.company.id}`}
                className="flex items-center gap-1 font-medium text-purple-600 hover:underline"
              >
                <Building2 className="h-4 w-4" />
                {item.company.name}
              </Link>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                인사
              </Badge>
              <span className="flex items-center gap-1 text-gray-400">
                <Calendar className="h-3 w-3" />
                {formatDistanceToNow(new Date(item.publishedAt), {
                  addSuffix: true,
                  locale: ko,
                })}
              </span>
            </div>

            {/* Title */}
            <h3 className="mb-2 font-semibold text-gray-900 group-hover:text-purple-700">
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {item.title}
              </a>
            </h3>

            {/* Summary */}
            {item.summary && (
              <p className="mb-3 text-sm text-gray-600 line-clamp-2">
                {item.summary}
              </p>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{item.sourceName || '뉴스'}</span>
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-purple-500 hover:text-purple-700"
              >
                원문 보기
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
