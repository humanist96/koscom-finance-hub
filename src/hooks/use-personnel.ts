'use client';

import { useQuery } from '@tanstack/react-query';
import { personnelApi } from '@/services/api';
import type { GetPersonnelParams } from '@/types/api';

// 인사 뉴스 목록 조회 훅 (News 테이블의 isPersonnel=true)
export function usePersonnel(params?: GetPersonnelParams) {
  return useQuery({
    queryKey: ['personnel', params],
    queryFn: () => personnelApi.getAll(params),
    staleTime: 1000 * 60 * 5, // 5분
  });
}

// 구조화된 인사 정보 조회 훅 (PersonnelChange 테이블)
export function usePersonnelChanges(params?: GetPersonnelParams) {
  return useQuery({
    queryKey: ['personnelChanges', params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (params?.companyIds) queryParams.set('companyIds', params.companyIds.join(','));
      if (params?.changeTypes) queryParams.set('changeTypes', params.changeTypes.join(','));
      if (params?.startDate) queryParams.set('dateRange', params.startDate);
      if (params?.keyword) queryParams.set('keyword', params.keyword);
      if (params?.limit) queryParams.set('limit', String(params.limit));
      if (params?.page) queryParams.set('page', String(params.page));

      const res = await fetch(`/api/personnel/changes?${queryParams.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch personnel changes');
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5분
  });
}
