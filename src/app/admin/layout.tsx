'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building2, Users, Home, LogOut, Shield, FileSpreadsheet } from 'lucide-react';
import { signOut } from 'next-auth/react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  // 로딩 중
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 비로그인 또는 권한 없음
  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
    router.push('/dashboard');
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white">
        <div className="p-4 border-b border-slate-700">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold">KOSCOM</div>
              <div className="text-xs text-blue-400">관리자 콘솔</div>
            </div>
          </Link>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link
                href="/admin"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:bg-slate-800 hover:text-white"
              >
                <Home className="h-5 w-5" />
                대시보드
              </Link>
            </li>
            <li>
              <Link
                href="/admin/users"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:bg-slate-800 hover:text-white"
              >
                <Users className="h-5 w-5" />
                사용자 관리
              </Link>
            </li>
            <li>
              <Link
                href="/admin/contracts"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:bg-slate-800 hover:text-white"
              >
                <FileSpreadsheet className="h-5 w-5" />
                계약 정보 업로드
              </Link>
            </li>
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 w-64 p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-700">
              <Shield className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <div className="text-sm font-medium">{session.user.name}</div>
              <div className="text-xs text-gray-400">{session.user.role}</div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href="/dashboard"
              className="flex-1 text-center text-sm py-2 px-3 rounded bg-slate-700 text-gray-300 hover:bg-slate-600"
            >
              서비스로
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex items-center justify-center gap-1 text-sm py-2 px-3 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
