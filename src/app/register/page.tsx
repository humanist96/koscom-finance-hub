'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, ArrowRight, Eye, EyeOff, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { registerFormSchema, type RegisterFormValues } from '@/lib/validators/auth-forms';

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      email: '',
      name: '',
      password: '',
      confirmPassword: '',
      department: '',
      position: '',
      employeeId: '',
    },
    mode: 'onBlur',
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setServerError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email.trim(),
          password: data.password,
          name: data.name.trim(),
          department: data.department?.trim() || null,
          position: data.position?.trim() || null,
          employeeId: data.employeeId?.trim() || null,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || '회원가입에 실패했습니다.');
      }

      setSuccess(true);
      // 3초 후 승인 대기 페이지로 이동
      setTimeout(() => {
        router.push('/pending');
      }, 3000);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />

        <div className="relative w-full max-w-md">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
              <Check className="h-8 w-8 text-green-400" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-white">회원가입 신청 완료!</h1>
            <p className="text-gray-400">
              관리자 승인 후 로그인이 가능합니다.
              <br />
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
          <p className="mb-6 text-center text-sm text-gray-400">계정 정보를 입력해주세요</p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* 필수 항목 */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">
                      이메일 <span className="text-red-400">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="hong@koscom.co.kr"
                        className="border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:border-blue-500"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">
                      이름 <span className="text-red-400">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="홍길동"
                        className="border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:border-blue-500"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">
                      비밀번호 <span className="text-red-400">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="8자 이상 입력하세요"
                          className="border-white/10 bg-white/5 pr-10 text-white placeholder:text-gray-500 focus:border-blue-500"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">
                      비밀번호 확인 <span className="text-red-400">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="비밀번호를 다시 입력하세요"
                        className="border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:border-blue-500"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              {/* 선택 항목 */}
              <div className="pt-2">
                <p className="mb-3 text-xs text-gray-500">선택 항목</p>
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">부서</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="금융영업부"
                            className="border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:border-blue-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">직책</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="과장"
                            className="border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:border-blue-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">사번</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="K12345"
                        className="border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:border-blue-500"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              {serverError && <p className="text-sm text-red-400">{serverError}</p>}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 py-6 text-lg font-semibold text-white shadow-lg shadow-blue-500/25 hover:from-blue-600 hover:to-cyan-600"
              >
                {isLoading ? '가입 신청 중...' : '가입 신청하기'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </form>
          </Form>

          <div className="mt-4 rounded-lg bg-blue-500/10 p-3">
            <p className="text-center text-xs text-blue-300">관리자 승인 후 로그인이 가능합니다</p>
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
