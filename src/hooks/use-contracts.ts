'use client';

import { useQuery } from '@tanstack/react-query';
import { contractsApi, GetContractsParams } from '@/services/api';

// 계약 목록 조회 훅
export function useContracts(params?: GetContractsParams) {
  return useQuery({
    queryKey: ['contracts', params],
    queryFn: () => contractsApi.getAll(params),
    staleTime: 1000 * 60 * 5, // 5분
  });
}

// 계약 통계 조회 훅
export function useContractStats() {
  return useQuery({
    queryKey: ['contracts', 'stats'],
    queryFn: () => contractsApi.getStats(),
    staleTime: 1000 * 60 * 10, // 10분
  });
}

// 서비스별 통계 조회 훅
export function useServiceStats() {
  return useQuery({
    queryKey: ['contracts', 'services'],
    queryFn: () => contractsApi.getServiceStats(),
    staleTime: 1000 * 60 * 10, // 10분
  });
}

// 영업 인사이트 조회 훅
export function useContractInsights() {
  return useQuery({
    queryKey: ['contracts', 'insights'],
    queryFn: () => contractsApi.getInsights(),
    staleTime: 1000 * 60 * 10, // 10분
  });
}
