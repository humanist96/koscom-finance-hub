'use client';

import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { newsApi } from '@/services/api';
import type { GetNewsParams } from '@/types/api';

// 뉴스 목록 조회 훅
export function useNews(params?: GetNewsParams) {
  return useQuery({
    queryKey: ['news', params],
    queryFn: () => newsApi.getAll(params),
    staleTime: 1000 * 60 * 5, // 5분
  });
}

// 뉴스 무한 스크롤 훅
export function useInfiniteNews(params?: Omit<GetNewsParams, 'page'>) {
  return useInfiniteQuery({
    queryKey: ['news', 'infinite', params],
    queryFn: ({ pageParam = 1 }) => newsApi.getAll({ ...params, page: pageParam }),
    getNextPageParam: lastPage => {
      const pagination = lastPage.data?.pagination;
      if (pagination && pagination.hasMore) {
        return pagination.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 5, // 5분
  });
}

// 뉴스 상세 조회 훅
export function useNewsDetail(id: string | null) {
  return useQuery({
    queryKey: ['news', id],
    queryFn: () => newsApi.getById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10분
  });
}
