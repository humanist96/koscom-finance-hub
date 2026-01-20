'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alertsApi, GetAlertsParams } from '@/services/api';

// 알림 목록 조회 훅
export function useAlerts(params: GetAlertsParams) {
  return useQuery({
    queryKey: ['alerts', params],
    queryFn: () => alertsApi.getAll(params),
    staleTime: 1000 * 60, // 1분
    enabled: !!params.userId,
  });
}

// 읽지 않은 알림 개수 조회 훅
export function useUnreadCount(userId: string | null) {
  return useQuery({
    queryKey: ['alerts', 'unread-count', userId],
    queryFn: () => alertsApi.getUnreadCount(userId!),
    staleTime: 1000 * 30, // 30초
    refetchInterval: 1000 * 60 * 2, // 2분마다 자동 갱신
    enabled: !!userId,
  });
}

// 알림 읽음 처리 훅
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => alertsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
}

// 모든 알림 읽음 처리 훅
export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => alertsApi.markAllAsRead(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
}

// 알림 삭제 훅
export function useDeleteAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => alertsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
}

// 알림 설정 조회 훅
export function useAlertSettings(userId: string | null) {
  return useQuery({
    queryKey: ['alerts', 'settings', userId],
    queryFn: () => alertsApi.getSettings(userId!),
    staleTime: 1000 * 60 * 5, // 5분
    enabled: !!userId,
  });
}

// 키워드 알림 추가 훅
export function useAddKeywordAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, keyword }: { userId: string; keyword: string }) =>
      alertsApi.addKeywordAlert(userId, keyword),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts', 'settings'] });
    },
  });
}

// 키워드 알림 삭제 훅
export function useDeleteKeywordAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => alertsApi.deleteKeywordAlert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts', 'settings'] });
    },
  });
}

// 회사 알림 추가 훅
export function useAddCompanyAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      companyId,
      alertOnNews,
      alertOnPersonnel,
    }: {
      userId: string;
      companyId: string;
      alertOnNews?: boolean;
      alertOnPersonnel?: boolean;
    }) => alertsApi.addCompanyAlert(userId, companyId, { alertOnNews, alertOnPersonnel }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts', 'settings'] });
    },
  });
}

// 회사 알림 수정 훅
export function useUpdateCompanyAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      alertOnNews,
      alertOnPersonnel,
      isActive,
    }: {
      id: string;
      alertOnNews?: boolean;
      alertOnPersonnel?: boolean;
      isActive?: boolean;
    }) => alertsApi.updateCompanyAlert(id, { alertOnNews, alertOnPersonnel, isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts', 'settings'] });
    },
  });
}

// 회사 알림 삭제 훅
export function useDeleteCompanyAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => alertsApi.deleteCompanyAlert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts', 'settings'] });
    },
  });
}
