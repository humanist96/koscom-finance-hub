'use client';

import { useEffect, useState } from 'react';
import { Users, UserCheck, Clock, UserX, FileSpreadsheet } from 'lucide-react';
import Link from 'next/link';

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // 각 상태별 사용자 수 조회
        const responses = await Promise.all([
          fetch('/api/admin/users?limit=1'),
          fetch('/api/admin/users?status=PENDING&limit=1'),
          fetch('/api/admin/users?status=APPROVED&limit=1'),
          fetch('/api/admin/users?status=REJECTED&limit=1'),
        ]);

        const data = await Promise.all(responses.map(r => r.json()));

        setStats({
          total: data[0]?.data?.total || 0,
          pending: data[1]?.data?.total || 0,
          approved: data[2]?.data?.total || 0,
          rejected: data[3]?.data?.total || 0,
        });
      } catch (error) {
        console.error('통계 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const statCards = [
    { label: '전체 사용자', value: stats.total, icon: Users, color: 'bg-blue-500' },
    { label: '승인 대기', value: stats.pending, icon: Clock, color: 'bg-amber-500', link: '/admin/users?status=PENDING' },
    { label: '승인됨', value: stats.approved, icon: UserCheck, color: 'bg-green-500' },
    { label: '거절/정지', value: stats.rejected, icon: UserX, color: 'bg-red-500' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">관리자 대시보드</h1>
        <p className="text-gray-600">사용자 및 시스템을 관리합니다.</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          const content = (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {loading ? '...' : card.value}
                  </p>
                </div>
                <div className={`${card.color} rounded-lg p-3`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );

          return card.link ? (
            <Link key={card.label} href={card.link}>
              {content}
            </Link>
          ) : (
            <div key={card.label}>{content}</div>
          );
        })}
      </div>

      {/* 빠른 액션 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">빠른 액션</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/admin/users?status=PENDING"
            className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">승인 대기 사용자 관리</h3>
              <p className="text-sm text-gray-500">
                {stats.pending > 0
                  ? `${stats.pending}명의 사용자가 승인을 기다리고 있습니다.`
                  : '대기 중인 사용자가 없습니다.'}
              </p>
            </div>
          </Link>

          <Link
            href="/admin/users"
            className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">전체 사용자 관리</h3>
              <p className="text-sm text-gray-500">
                사용자 목록 조회 및 권한 관리
              </p>
            </div>
          </Link>

          <Link
            href="/admin/contracts"
            className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <FileSpreadsheet className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">계약 정보 업로드</h3>
              <p className="text-sm text-gray-500">
                엑셀 파일로 계약 정보 일괄 업로드
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
