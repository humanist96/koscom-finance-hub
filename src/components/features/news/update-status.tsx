'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { RefreshCw, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CrawlLog {
  id: string;
  status: string;
  itemsFound: number;
  completedAt: string | null;
  startedAt: string;
}

interface CrawlStatus {
  lastCrawl: CrawlLog | null;
  isRunning: boolean;
}

async function fetchCrawlStatus(): Promise<CrawlStatus> {
  const res = await fetch('/api/crawl');
  if (!res.ok) throw new Error('Failed to fetch crawl status');
  return res.json();
}

async function triggerCrawl(): Promise<void> {
  const res = await fetch('/api/crawl', { method: 'POST' });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to start crawler');
  }
}

export function UpdateStatus() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['crawlStatus'],
    queryFn: fetchCrawlStatus,
    refetchInterval: 10000, // 10초마다 갱신
  });

  const mutation = useMutation({
    mutationFn: triggerCrawl,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crawlStatus'] });
      // 뉴스 목록도 갱신
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['news'] });
      }, 5000);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>상태 확인 중...</span>
      </div>
    );
  }

  const { lastCrawl, isRunning } = data || {};

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-white px-4 py-2 shadow-sm">
      {/* 상태 아이콘 및 텍스트 */}
      <div className="flex items-center gap-2">
        {isRunning ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
            <span className="text-sm font-medium text-blue-600">수집 중...</span>
          </>
        ) : lastCrawl?.status === 'SUCCESS' ? (
          <>
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm text-gray-600">
              마지막 업데이트:{' '}
              <span className="font-medium">
                {lastCrawl.completedAt
                  ? formatDistanceToNow(new Date(lastCrawl.completedAt), {
                      addSuffix: true,
                      locale: ko,
                    })
                  : '-'}
              </span>
            </span>
          </>
        ) : lastCrawl?.status === 'FAILED' ? (
          <>
            <XCircle className="h-4 w-4 text-red-500" />
            <span className="text-sm text-red-600">수집 실패</span>
          </>
        ) : (
          <span className="text-sm text-gray-400">수집 기록 없음</span>
        )}
      </div>

      {/* 상세 시간 (성공 시) */}
      {lastCrawl?.completedAt && lastCrawl.status === 'SUCCESS' && (
        <span className="hidden text-xs text-gray-400 md:block">
          ({format(new Date(lastCrawl.completedAt), 'M/d HH:mm', { locale: ko })})
        </span>
      )}

      {/* 수동 새로고침 버튼 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => mutation.mutate()}
        disabled={isRunning || mutation.isPending}
        className="ml-2"
      >
        <RefreshCw
          className={`h-4 w-4 ${
            isRunning || mutation.isPending ? 'animate-spin' : ''
          }`}
        />
        <span className="ml-1 hidden sm:inline">
          {isRunning || mutation.isPending ? '수집 중' : '새로고침'}
        </span>
      </Button>
    </div>
  );
}
