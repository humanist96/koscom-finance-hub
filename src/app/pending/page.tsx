'use client';

import Link from 'next/link';
import { Building2, Clock, Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PendingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4">
      {/* Background Effect */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/20 via-transparent to-transparent" />

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

        {/* Pending Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/20">
            <Clock className="h-10 w-10 text-amber-400" />
          </div>

          <h1 className="mb-2 text-2xl font-bold text-white">승인 대기 중</h1>
          <p className="mb-6 text-gray-400">
            회원가입 신청이 완료되었습니다.<br />
            관리자 승인 후 로그인이 가능합니다.
          </p>

          <div className="rounded-lg bg-white/5 p-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-300">
              <Mail className="h-4 w-4" />
              <span>승인이 완료되면 알림을 받으실 수 있습니다.</span>
            </div>
          </div>

          <div className="space-y-3">
            <Link href="/login">
              <Button
                variant="outline"
                className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                로그인 페이지로 돌아가기
              </Button>
            </Link>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-xs text-gray-500">
              문의사항이 있으시면 관리자에게 연락해주세요.
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
