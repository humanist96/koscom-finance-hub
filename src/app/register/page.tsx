'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building2, ArrowRight, Eye, EyeOff, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    department: '',
    position: '',
    employeeId: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 유효성 검사
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('올바른 이메일을 입력해주세요.');
      return;
    }

    if (!formData.name.trim()) {
      setError('이름을 입력해주세요.');
      return;
    }

    if (formData.password.length < 8) {
      setError('비밀번호는 최소 8자 이상이어야 합니다.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
          name: formData.name.trim(),
          department: formData.department.trim() || null,
          position: formData.position.trim() || null,
          employeeId: formData.employeeId.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '회원가입에 실패했습니다.');
      }

      setSuccess(true);
      // 3초 후 승인 대기 페이지로 이동
      setTimeout(() => {
        router.push('/pending');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />

        <div className="relative w-full max-w-md">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
              <Check className="h-8 w-8 text-green-400" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-white">회원가입 신청 완료!</h1>
            <p className="text-gray-400">
              관리자 승인 후 로그인이 가능합니다.<br />
              승인 대기 페이지로 이동합니다...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-12">
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

        {/* Register Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
          <h1 className="mb-2 text-center text-2xl font-bold text-white">회원가입</h1>
          <p className="mb-6 text-center text-sm text-gray-400">
            계정 정보를 입력해주세요
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 필수 항목 */}
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-300">
                이메일 <span className="text-red-400">*</span>
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="hong@koscom.co.kr"
                value={formData.email}
                onChange={handleChange}
                className="border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-300">
                이름 <span className="text-red-400">*</span>
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="홍길동"
                value={formData.name}
                onChange={handleChange}
                className="border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-300">
                비밀번호 <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="8자 이상 입력하세요"
                  value={formData.password}
                  onChange={handleChange}
                  className="border-white/10 bg-white/5 pr-10 text-white placeholder:text-gray-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-gray-300">
                비밀번호 확인 <span className="text-red-400">*</span>
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="비밀번호를 다시 입력하세요"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:border-blue-500"
              />
            </div>

            {/* 선택 항목 */}
            <div className="pt-2">
              <p className="mb-3 text-xs text-gray-500">선택 항목</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="department" className="mb-1.5 block text-sm font-medium text-gray-300">
                    부서
                  </label>
                  <Input
                    id="department"
                    name="department"
                    type="text"
                    placeholder="금융영업부"
                    value={formData.department}
                    onChange={handleChange}
                    className="border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="position" className="mb-1.5 block text-sm font-medium text-gray-300">
                    직책
                  </label>
                  <Input
                    id="position"
                    name="position"
                    type="text"
                    placeholder="과장"
                    value={formData.position}
                    onChange={handleChange}
                    className="border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="employeeId" className="mb-1.5 block text-sm font-medium text-gray-300">
                사번
              </label>
              <Input
                id="employeeId"
                name="employeeId"
                type="text"
                placeholder="K12345"
                value={formData.employeeId}
                onChange={handleChange}
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
              {isLoading ? '가입 신청 중...' : '가입 신청하기'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </form>

          <div className="mt-4 rounded-lg bg-blue-500/10 p-3">
            <p className="text-center text-xs text-blue-300">
              관리자 승인 후 로그인이 가능합니다
            </p>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              이미 계정이 있으신가요?{' '}
              <Link href="/login" className="text-blue-400 hover:text-blue-300">
                로그인
              </Link>
            </p>
          </div>
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
