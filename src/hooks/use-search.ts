'use client';

import { useQuery } from '@tanstack/react-query';
import { searchApi } from '@/services/api';
import type { SearchParams } from '@/types/api';

// 통합 검색 훅
export function useSearch(params: SearchParams | null) {
  return useQuery({
    queryKey: ['search', params],
    queryFn: () => searchApi.search(params!),
    enabled: !!params && !!params.query && params.query.length >= 2,
    staleTime: 1000 * 60 * 2, // 2분
  });
}
