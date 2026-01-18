'use client';

import { useQuery } from '@tanstack/react-query';
import { companiesApi } from '@/services/api';
import type { GetCompaniesParams } from '@/types/api';

// 증권사 목록 조회 훅
export function useCompanies(params?: GetCompaniesParams) {
  return useQuery({
    queryKey: ['companies', params],
    queryFn: () => companiesApi.getAll(params),
    staleTime: 1000 * 60 * 60, // 1시간
  });
}

// 증권사 상세 조회 훅
export function useCompany(id: string | null) {
  return useQuery({
    queryKey: ['company', id],
    queryFn: () => companiesApi.getById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10분
  });
}
