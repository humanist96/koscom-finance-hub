'use client';

import { useQuery } from '@tanstack/react-query';
import { personnelApi } from '@/services/api';
import type { GetPersonnelParams } from '@/types/api';

// 인사 정보 목록 조회 훅
export function usePersonnel(params?: GetPersonnelParams) {
  return useQuery({
    queryKey: ['personnel', params],
    queryFn: () => personnelApi.getAll(params),
    staleTime: 1000 * 60 * 5, // 5분
  });
}
