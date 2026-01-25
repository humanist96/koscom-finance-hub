'use client';

import { useState, useEffect, useCallback } from 'react';
import { User } from './constants';
import { PasswordResetResult } from './UserModals';

interface UseUserManagementOptions {
  initialStatusFilter?: string;
}

export function useUserManagement(options: UseUserManagementOptions = {}) {
  const { initialStatusFilter = '' } = options;

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Modal states
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState<string | null>(null);
  const [passwordResetResult, setPasswordResetResult] = useState<PasswordResetResult | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      params.set('limit', '100');

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setUsers(data.data.users);
      }
    } catch (error) {
      console.error('사용자 목록 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAction = async (userId: string, action: string, reason?: string) => {
    setActionLoading(userId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action, rejectReason: reason }),
      });

      const data = await res.json();
      if (data.success) {
        if (action === 'resetPassword' && data.data) {
          setPasswordResetResult(data.data);
          setShowResetPasswordModal(null);
        } else {
          fetchUsers();
          setShowRejectModal(null);
        }
      } else {
        alert(data.error || '처리에 실패했습니다.');
      }
    } catch (error) {
      console.error('액션 처리 실패:', error);
      alert('처리 중 오류가 발생했습니다.');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter((user) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.email.toLowerCase().includes(query) ||
      user.name?.toLowerCase().includes(query) ||
      user.department?.toLowerCase().includes(query)
    );
  });

  // Action handlers
  const handleApprove = (userId: string) => handleAction(userId, 'approve');
  const handleReject = (userId: string, reason: string) => handleAction(userId, 'reject', reason);
  const handleSuspend = (userId: string) => handleAction(userId, 'suspend');
  const handleReactivate = (userId: string) => handleAction(userId, 'reactivate');
  const handleResetPassword = (userId: string) => handleAction(userId, 'resetPassword');

  const closePasswordResetResult = () => {
    setPasswordResetResult(null);
    fetchUsers();
  };

  return {
    // Data
    users: filteredUsers,
    loading,
    actionLoading,

    // Filters
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,

    // Actions
    fetchUsers,
    handleApprove,
    handleSuspend,
    handleReactivate,

    // Reject modal
    showRejectModal,
    setShowRejectModal,
    handleReject,

    // Reset password modal
    showResetPasswordModal,
    setShowResetPasswordModal,
    handleResetPassword,

    // Reset password result
    passwordResetResult,
    closePasswordResetResult,
  };
}
