'use client';

import { useSearchParams } from 'next/navigation';
import {
  UserFilters,
  UserTable,
  RejectModal,
  ResetPasswordConfirmModal,
  ResetPasswordResultModal,
  useUserManagement,
} from '@/components/admin/users';

export default function AdminUsersPage() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get('status') || '';

  const {
    users,
    loading,
    actionLoading,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    fetchUsers,
    handleApprove,
    handleSuspend,
    handleReactivate,
    showRejectModal,
    setShowRejectModal,
    handleReject,
    showResetPasswordModal,
    setShowResetPasswordModal,
    handleResetPassword,
    passwordResetResult,
    closePasswordResetResult,
  } = useUserManagement({ initialStatusFilter: initialStatus });

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">사용자 관리</h1>
        <p className="text-gray-600">사용자 가입 승인 및 권한을 관리합니다.</p>
      </div>

      <UserFilters
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onRefresh={fetchUsers}
        loading={loading}
      />

      <UserTable
        users={users}
        loading={loading}
        actionLoading={actionLoading}
        onApprove={handleApprove}
        onReject={(userId) => setShowRejectModal(userId)}
        onSuspend={handleSuspend}
        onReactivate={handleReactivate}
        onResetPassword={(userId) => setShowResetPasswordModal(userId)}
      />

      <RejectModal
        userId={showRejectModal}
        onClose={() => setShowRejectModal(null)}
        onConfirm={handleReject}
        isLoading={actionLoading === showRejectModal}
      />

      <ResetPasswordConfirmModal
        userId={showResetPasswordModal}
        onClose={() => setShowResetPasswordModal(null)}
        onConfirm={handleResetPassword}
        isLoading={actionLoading === showResetPasswordModal}
      />

      <ResetPasswordResultModal
        result={passwordResetResult}
        onClose={closePasswordResetResult}
      />
    </div>
  );
}
