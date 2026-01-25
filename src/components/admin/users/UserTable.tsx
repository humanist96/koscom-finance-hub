'use client';

import { Check, X, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { User, STATUS_LABELS, ROLE_LABELS, formatDate } from './constants';

interface UserTableProps {
  users: User[];
  loading: boolean;
  actionLoading: string | null;
  onApprove: (userId: string) => void;
  onReject: (userId: string) => void;
  onSuspend: (userId: string) => void;
  onReactivate: (userId: string) => void;
  onResetPassword: (userId: string) => void;
}

export function UserTable({
  users,
  loading,
  actionLoading,
  onApprove,
  onReject,
  onSuspend,
  onReactivate,
  onResetPassword,
}: UserTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                사용자
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                소속
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                상태
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                역할
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                가입일
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                최근 로그인
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                액션
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  로딩 중...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  사용자가 없습니다.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-gray-900">{user.name || '-'}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900">
                      {user.department || '-'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {user.position || '-'} {user.employeeId && `(${user.employeeId})`}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        STATUS_LABELS[user.status]?.color || 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {STATUS_LABELS[user.status]?.label || user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {ROLE_LABELS[user.role] || user.role}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {formatDate(user.lastLoginAt)}
                  </td>
                  <td className="px-4 py-3">
                    <UserActions
                      user={user}
                      actionLoading={actionLoading}
                      onApprove={onApprove}
                      onReject={onReject}
                      onSuspend={onSuspend}
                      onReactivate={onReactivate}
                      onResetPassword={onResetPassword}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface UserActionsProps {
  user: User;
  actionLoading: string | null;
  onApprove: (userId: string) => void;
  onReject: (userId: string) => void;
  onSuspend: (userId: string) => void;
  onReactivate: (userId: string) => void;
  onResetPassword: (userId: string) => void;
}

function UserActions({
  user,
  actionLoading,
  onApprove,
  onReject,
  onSuspend,
  onReactivate,
  onResetPassword,
}: UserActionsProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {user.status === 'PENDING' && (
        <>
          <Button
            size="sm"
            variant="outline"
            className="text-green-600 border-green-200 hover:bg-green-50"
            onClick={() => onApprove(user.id)}
            disabled={actionLoading === user.id}
          >
            <Check className="h-4 w-4 mr-1" />
            승인
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50"
            onClick={() => onReject(user.id)}
            disabled={actionLoading === user.id}
          >
            <X className="h-4 w-4 mr-1" />
            거절
          </Button>
        </>
      )}
      {user.status === 'APPROVED' && (
        <>
          <Button
            size="sm"
            variant="outline"
            className="text-purple-600 border-purple-200 hover:bg-purple-50"
            onClick={() => onResetPassword(user.id)}
            disabled={actionLoading === user.id}
          >
            <KeyRound className="h-4 w-4 mr-1" />
            PW초기화
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-gray-600"
            onClick={() => onSuspend(user.id)}
            disabled={actionLoading === user.id}
          >
            정지
          </Button>
        </>
      )}
      {(user.status === 'SUSPENDED' || user.status === 'REJECTED') && (
        <Button
          size="sm"
          variant="outline"
          className="text-blue-600"
          onClick={() => onReactivate(user.id)}
          disabled={actionLoading === user.id}
        >
          재활성화
        </Button>
      )}
    </div>
  );
}
