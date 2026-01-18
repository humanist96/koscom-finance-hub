'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowRight, BarChart3, Bell, Building2, Newspaper, Users, Zap, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

// 3D 컴포넌트는 클라이언트 사이드에서만 렌더링
const FloatingParticles = dynamic(
  () => import('@/components/three/floating-particles').then(mod => mod.FloatingParticles),
  { ssr: false }
);

const features = [
  {
    icon: Newspaper,
    title: '실시간 뉴스 수집',
    description: '25개 PowerBase 회원 증권사의 최신 뉴스를 자동으로 수집합니다.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Users,
    title: '인사 동향 추적',
    description: '주요 임원 인사 변동을 실시간으로 파악하고 알림을 받으세요.',
    color: 'from-violet-500 to-purple-500',
  },
  {
    icon: BarChart3,
    title: 'AI 분석 리포트',
    description: '수집된 데이터를 AI가 분석하여 인사이트를 제공합니다.',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: Bell,
    title: '맞춤 알림 설정',
    description: '관심 증권사와 키워드를 설정하면 자동으로 알림을 보내드립니다.',
    color: 'from-emerald-500 to-teal-500',
  },
];

const stats = [
  { value: '25', label: '증권사', suffix: '+' },
  { value: '1000', label: '일간 수집 뉴스', suffix: '+' },
  { value: '99.9', label: '업타임', suffix: '%' },
  { value: '24/7', label: '모니터링', suffix: '' },
];

function AnimatedCounter({ value, suffix }: { value: string; suffix: string }) {
  const [count, setCount] = useState(0);
  const numValue = parseFloat(value);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = numValue / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= numValue) {
        setCount(numValue);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [numValue]);

  return (
    <span>
      {value.includes('.') ? count.toFixed(1) : Math.floor(count)}
      {suffix}
    </span>
  );
}

export default function LandingPage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* 3D Background */}
      <FloatingParticles />

      {/* Gradient Overlays */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/50" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />

      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/5 bg-slate-950/50 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/25">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white">KOSCOM</span>
              <span className="text-xs text-blue-400">금융영업부 Hub</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" className="text-gray-300 hover:bg-white/10 hover:text-white">
                대시보드
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25 hover:from-blue-600 hover:to-cyan-600">
                시작하기
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-6 py-20 text-center">
        <div
          className={`transition-all duration-1000 ${
            isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-300 backdrop-blur-sm">
            <Zap className="h-4 w-4" />
            <span>AI 기반 금융 인텔리전스 플랫폼</span>
          </div>

          {/* Main Title */}
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-white md:text-7xl">
            <span className="bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
              증권사 동향을
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              한눈에 파악하세요
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-400 md:text-xl">
            PowerBase 회원 25개 증권사의 뉴스와 인사 동향을 실시간으로 모니터링하고,
            <br className="hidden md:block" />
            AI가 분석한 인사이트로 영업 기회를 발굴하세요.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/dashboard">
              <Button
                size="lg"
                className="group h-14 bg-gradient-to-r from-blue-500 to-cyan-500 px-8 text-lg font-semibold text-white shadow-xl shadow-blue-500/30 transition-all hover:from-blue-600 hover:to-cyan-600 hover:shadow-blue-500/40"
              >
                대시보드 바로가기
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="h-14 border-white/20 bg-white/5 px-8 text-lg text-white backdrop-blur-sm hover:bg-white/10"
            >
              <Shield className="mr-2 h-5 w-5" />
              기능 소개
            </Button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-white/30 p-1">
            <div className="h-2 w-1 animate-pulse rounded-full bg-white/60" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 border-y border-white/5 bg-slate-900/50 py-16 backdrop-blur-xl">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 md:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="mb-2 text-4xl font-bold text-white md:text-5xl">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
              강력한 기능으로 영업력을 높이세요
            </h2>
            <p className="text-gray-400">
              KOSCOM 금융영업부 Hub가 제공하는 핵심 기능들
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-8 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10"
              >
                <div
                  className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${feature.color} p-3 shadow-lg`}
                >
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-white">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>

                {/* Hover Glow */}
                <div
                  className={`absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br ${feature.color} opacity-0 blur-3xl transition-opacity group-hover:opacity-20`}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-blue-600/20 via-slate-900/50 to-cyan-600/20 p-12 backdrop-blur-xl">
            <Clock className="mx-auto mb-6 h-12 w-12 text-blue-400" />
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
              지금 바로 시작하세요
            </h2>
            <p className="mb-8 text-gray-400">
              매일 업데이트되는 증권사 동향을 놓치지 마세요.
              <br />
              금융영업부 Hub와 함께 스마트한 영업을 시작하세요.
            </p>
            <Link href="/dashboard">
              <Button
                size="lg"
                className="h-14 bg-gradient-to-r from-blue-500 to-cyan-500 px-10 text-lg font-semibold text-white shadow-xl shadow-blue-500/30 hover:from-blue-600 hover:to-cyan-600"
              >
                무료로 시작하기
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 bg-slate-950/80 py-12 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-white">KOSCOM 금융영업부 Hub</span>
                <p className="text-xs text-gray-500">Securities Intelligence Platform</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              © 2026 KOSCOM. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
