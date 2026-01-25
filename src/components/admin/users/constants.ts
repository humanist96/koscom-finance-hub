export interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  status: string;
  department: string | null;
  position: string | null;
  employeeId: string | null;
  createdAt: string;
  approvedAt: string | null;
  lastLoginAt: string | null;
}

export const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: '대기중', color: 'bg-amber-100 text-amber-700' },
  APPROVED: { label: '승인됨', color: 'bg-green-100 text-green-700' },
  REJECTED: { label: '거절됨', color: 'bg-red-100 text-red-700' },
  SUSPENDED: { label: '정지됨', color: 'bg-gray-100 text-gray-700' },
};

export const ROLE_LABELS: Record<string, string> = {
  USER: '사용자',
  ADMIN: '관리자',
  SUPER_ADMIN: '최고관리자',
};

export function formatDate(dateString: string | null): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
