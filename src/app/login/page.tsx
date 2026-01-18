'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/auth-store';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('이름을 입력해주세요.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('올바른 이메일을 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      // 서버에 사용자 등록/조회
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '로그인에 실패했습니다.');
      }

      // 로그인 상태 저장
      login({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        assignedCompanyIds: data.user.assignedCompanyIds || [],
      });

      // 담당 증권사가 없으면 설정 페이지로, 있으면 대시보드로
      if (!data.user.assignedCompanyIds?.length) {
        router.push('/dashboard/settings');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4">
      {/* Background Effect */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/25">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div className="text-left">
              <span className="block text-lg font-bold text-white">KOSCOM</span>
              <span className="block text-sm text-blue-400">금융영업부 Hub</span>
            </div>
          </Link>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
          <h1 className="mb-2 text-center text-2xl font-bold text-white">로그인</h1>
          <p className="mb-6 text-center text-sm text-gray-400">
            영업대표 정보를 입력해주세요
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-300">
                이름
              </label>
              <Input
                id="name"
                type="text"
                placeholder="홍길동"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-300">
                이메일
              </label>
              <Input
                id="email"
                type="email"
                placeholder="hong@koscom.co.kr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:border-blue-500"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 py-6 text-lg font-semibold text-white shadow-lg shadow-blue-500/25 hover:from-blue-600 hover:to-cyan-600"
            >
              {isLoading ? '로그인 중...' : '로그인'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-500">
            처음 방문하신 분은 자동으로 계정이 생성됩니다.
          </p>
        </div>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-400 hover:text-white">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
