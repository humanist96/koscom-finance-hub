'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  FileText,
  TrendingUp,
  Users,
  Package,
  Megaphone,
  Calendar,
  BarChart3,
  RefreshCw,
  ChevronRight,
  Building2,
  Sparkles,
} from 'lucide-react';

interface WeeklyReport {
  id: string;
  weekStart: string;
  weekEnd: string;
  businessSummary: string | null;
  personnelSummary: string | null;
  productSummary: string | null;
  irSummary: string | null;
  eventSummary: string | null;
  generalSummary: string | null;
  executiveSummary: string | null;
  closingRemarks: string | null;
  totalNewsCount: number;
  companyMentions: Record<string, number> | null;
  publishedAt: string | null;
}

interface CategoryCardProps {
  title: string;
  icon: React.ReactNode;
  content: string | null;
  color: string;
  bgColor: string;
}

function CategoryCard({ title, icon, content, color, bgColor }: CategoryCardProps) {
  if (!content || content.includes('뉴스가 없습니다')) {
    return null;
  }

  return (
    <div className={`rounded-xl border ${bgColor} p-6 transition-all hover:shadow-lg`}>
      <div className={`flex items-center gap-3 mb-4`}>
        <div className={`p-2 rounded-lg ${color}`}>
          {icon}
        </div>
        <h3 className="font-semibold text-lg text-gray-800">{title}</h3>
      </div>
      <p className="text-gray-600 leading-relaxed whitespace-pre-line">{content}</p>
    </div>
  );
}

export default function WeeklyReportPage() {
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/reports');
      const data = await res.json();

      if (data.success) {
        setReport(data.data);
        setError(null);
      } else {
        setError(data.error);
      }
    } catch {
      setError('리포트를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      setGenerating(true);
      const res = await fetch('/api/reports', { method: 'POST' });
      const data = await res.json();

      if (data.success) {
        await fetchReport();
      } else {
        setError(data.error);
      }
    } catch {
      setError('리포트 생성에 실패했습니다.');
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  // 상위 5개 증권사
  const topCompanies = report?.companyMentions
    ? Object.entries(report.companyMentions)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-500">리포트를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            주간 증권사 동향 리포트
          </h1>
          <p className="text-gray-500 mt-1">
            증권업계 주요 이슈를 한눈에 파악하세요
          </p>
        </div>
        <button
          onClick={generateReport}
          disabled={generating}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {generating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              생성 중...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              리포트 생성
            </>
          )}
        </button>
      </div>

      {error && !report && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <p className="text-yellow-800">{error}</p>
          <button
            onClick={generateReport}
            disabled={generating}
            className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
          >
            새 리포트 생성하기
          </button>
        </div>
      )}

      {report && (
        <>
          {/* 리포트 메타 정보 */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
            <div className="flex items-center gap-2 text-blue-100 mb-2">
              <Calendar className="w-5 h-5" />
              <span>
                {format(new Date(report.weekStart), 'yyyy년 M월 d일', { locale: ko })} ~{' '}
                {format(new Date(report.weekEnd), 'M월 d일', { locale: ko })}
              </span>
            </div>
            <h2 className="text-2xl font-bold mb-4">주간 핵심 요약</h2>
            <p className="text-lg leading-relaxed text-blue-50">
              {report.executiveSummary || '이번 주 증권업계 동향을 분석 중입니다.'}
            </p>
            <div className="mt-6 flex items-center gap-6 text-blue-100">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                <span>총 {report.totalNewsCount}건의 뉴스 분석</span>
              </div>
              {report.publishedAt && (
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  <span>
                    {format(new Date(report.publishedAt), 'M월 d일 HH:mm', { locale: ko })} 업데이트
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 주요 언급 증권사 */}
          {topCompanies.length > 0 && (
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-lg text-gray-800 flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5 text-gray-600" />
                이번 주 주요 증권사
              </h3>
              <div className="flex flex-wrap gap-3">
                {topCompanies.map(([name, count]) => (
                  <div
                    key={name}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full"
                  >
                    <span className="font-medium text-gray-700">{name}</span>
                    <span className="text-sm text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                      {count}건
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 카테고리별 요약 */}
          <div className="grid md:grid-cols-2 gap-6">
            <CategoryCard
              title="실적 / 사업 동향"
              icon={<TrendingUp className="w-5 h-5 text-green-600" />}
              content={report.businessSummary}
              color="bg-green-100"
              bgColor="border-green-200 bg-green-50/50"
            />
            <CategoryCard
              title="인사 동향"
              icon={<Users className="w-5 h-5 text-purple-600" />}
              content={report.personnelSummary}
              color="bg-purple-100"
              bgColor="border-purple-200 bg-purple-50/50"
            />
            <CategoryCard
              title="상품 / 서비스"
              icon={<Package className="w-5 h-5 text-orange-600" />}
              content={report.productSummary}
              color="bg-orange-100"
              bgColor="border-orange-200 bg-orange-50/50"
            />
            <CategoryCard
              title="IR / 공시"
              icon={<FileText className="w-5 h-5 text-blue-600" />}
              content={report.irSummary}
              color="bg-blue-100"
              bgColor="border-blue-200 bg-blue-50/50"
            />
            <CategoryCard
              title="이벤트 / 행사"
              icon={<Calendar className="w-5 h-5 text-pink-600" />}
              content={report.eventSummary}
              color="bg-pink-100"
              bgColor="border-pink-200 bg-pink-50/50"
            />
            <CategoryCard
              title="기타 동향"
              icon={<Megaphone className="w-5 h-5 text-gray-600" />}
              content={report.generalSummary}
              color="bg-gray-100"
              bgColor="border-gray-200 bg-gray-50/50"
            />
          </div>

          {/* 마무리 멘트 */}
          {report.closingRemarks && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-100 rounded-full">
                  <ChevronRight className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-amber-800 mb-2">
                    다음 주 전망
                  </h3>
                  <p className="text-amber-700 leading-relaxed">
                    {report.closingRemarks}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 푸터 */}
          <div className="text-center text-gray-400 text-sm py-4">
            본 리포트는 AI가 뉴스 데이터를 분석하여 자동 생성한 것으로, 참고용으로만 활용해 주세요.
          </div>
        </>
      )}
    </div>
  );
}
