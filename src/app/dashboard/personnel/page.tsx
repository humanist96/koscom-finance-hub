'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Newspaper, UserCheck, RefreshCw, AlertCircle, ExternalLink, Building2, Calendar, ArrowRight, Plus, Settings } from 'lucide-react';
import { usePersonnel, usePersonnelChanges } from '@/hooks/use-personnel';
import { formatDistanceToNow, format } from 'date-fns';
import { ko } from 'date-fns/locale';
import Link from 'next/link';
import { PERSONNEL_CHANGE_LABELS, type PersonnelChangeType } from '@/types/news';
import { PERSONNEL_CHANGE_COLORS } from '@/constants';

const dateOptions = [
  { label: '최근 1주', value: '1week' },
  { label: '최근 1개월', value: '1month' },
  { label: '최근 3개월', value: '3months' },
  { label: '전체', value: 'all' },
];

const changeTypes: PersonnelChangeType[] = [
  'APPOINTMENT',
  'PROMOTION',
  'TRANSFER',
  'RESIGNATION',
  'RETIREMENT',
];

interface PersonnelNewsItem {
  id: string;
  title: string;
  summary: string | null;
  sourceUrl: string;
  sourceName: string | null;
  publishedAt: string;
  company: {
    id: string;
    name: string;
    code: string;
  };
}

interface PersonnelChangeItem {
  id: string;
  personName: string;
  position: string | null;
  department: string | null;
  changeType: string;
  previousPosition: string | null;
  announcedAt: string;
  effectiveDate: string | null;
  company: {
    id: string;
    name: string;
  };
}

export default function PersonnelPage() {
  const { data: session } = useSession();
  const [dateRange, setDateRange] = useState('1month');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'news' | 'changes'>('news');

  const isLoggedIn = !!session?.user;
  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN';

  const toggleType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  // 인사 뉴스
  const {
    data: newsData,
    isLoading: newsLoading,
    isError: newsError,
    refetch: refetchNews
  } = usePersonnel({
    startDate: dateRange,
    limit: 50,
  });

  // 구조화된 인사 정보
  const {
    data: changesData,
    isLoading: changesLoading,
    isError: changesError,
    refetch: refetchChanges
  } = usePersonnelChanges({
    startDate: 'all', // 인사 정보는 전체 기간
    changeTypes: selectedTypes.length > 0 ? selectedTypes : undefined,
    limit: 50,
  });

  const personnelNews = (newsData?.data?.items || []) as unknown as PersonnelNewsItem[];
  const personnelChanges = (changesData?.data?.items || []) as unknown as PersonnelChangeItem[];

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'APPOINTMENT': return '🔵';
      case 'PROMOTION': return '🟢';
      case 'TRANSFER': return '🟡';
      case 'RESIGNATION':
      case 'RETIREMENT': return '🔴';
      default: return '⚪';
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Page Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Users className="h-6 w-6 text-purple-600" />
            인사 동향
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            증권사 임원 및 주요 인사 관련 뉴스와 인사 정보를 확인하세요
          </p>
        </div>
        {isLoggedIn && (
          <div className="flex gap-2">
            <Link href="/admin/personnel">
              <Button variant="outline" size="sm">
                <Settings className="mr-2 h-4 w-4" />
                인사정보 관리
              </Button>
            </Link>
            <Link href="/admin/personnel">
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                인사정보 추가
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('news')}
          className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
            activeTab === 'news'
              ? 'border-b-2 border-purple-600 text-purple-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Newspaper className="h-4 w-4" />
          인사 뉴스
          <Badge variant="secondary" className="ml-1">
            {newsData?.data?.pagination.total || 0}
          </Badge>
        </button>
        <button
          onClick={() => setActiveTab('changes')}
          className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
            activeTab === 'changes'
              ? 'border-b-2 border-purple-600 text-purple-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <UserCheck className="h-4 w-4" />
          인사 정보
          <Badge variant="secondary" className="ml-1">
            {changesData?.data?.pagination.total || 0}
          </Badge>
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-lg border bg-gray-50 p-4">
        {activeTab === 'news' && (
          <div>
            <h3 className="mb-2 text-sm font-medium text-gray-700">기간</h3>
            <div className="flex flex-wrap gap-2">
              {dateOptions.map(option => (
                <Badge
                  key={option.value}
                  variant={dateRange === option.value ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setDateRange(option.value)}
                >
                  {option.label}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'changes' && (
          <div>
            <h3 className="mb-2 text-sm font-medium text-gray-700">변동 유형</h3>
            <div className="flex flex-wrap gap-2">
              {changeTypes.map(type => (
                <Badge
                  key={type}
                  variant={selectedTypes.includes(type) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleType(type)}
                >
                  {PERSONNEL_CHANGE_LABELS[type]}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {activeTab === 'news' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              총 <strong>{newsData?.data?.pagination.total || 0}</strong>개의 인사 뉴스
            </p>
            <Button variant="ghost" size="sm" onClick={() => refetchNews()}>
              <RefreshCw className="mr-1 h-3 w-3" />
              새로고침
            </Button>
          </div>

          {newsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="rounded-lg border p-4">
                  <Skeleton className="mb-2 h-5 w-32" />
                  <Skeleton className="mb-2 h-6 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          ) : newsError ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 p-8 text-center">
              <AlertCircle className="mb-2 h-8 w-8 text-red-500" />
              <p className="mb-4 text-red-700">인사 뉴스를 불러오는데 실패했습니다.</p>
              <Button variant="outline" onClick={() => refetchNews()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                다시 시도
              </Button>
            </div>
          ) : personnelNews.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
              <p className="text-gray-500">조건에 맞는 인사 뉴스가 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {personnelNews.map(item => (
                <article
                  key={item.id}
                  className="group rounded-lg border bg-white p-4 transition-all hover:border-purple-200 hover:shadow-md"
                >
                  <div className="mb-2 flex items-center gap-2 text-sm">
                    <Link
                      href={`/dashboard/companies/${item.company.id}`}
                      className="flex items-center gap-1 font-medium text-purple-600 hover:underline"
                    >
                      <Building2 className="h-4 w-4" />
                      {item.company.name}
                    </Link>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                      인사
                    </Badge>
                    <span className="flex items-center gap-1 text-gray-400">
                      <Calendar className="h-3 w-3" />
                      {formatDistanceToNow(new Date(item.publishedAt), {
                        addSuffix: true,
                        locale: ko,
                      })}
                    </span>
                  </div>
                  <h3 className="mb-2 font-semibold text-gray-900 group-hover:text-purple-700">
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {item.title}
                    </a>
                  </h3>
                  {item.summary && (
                    <p className="mb-3 text-sm text-gray-600 line-clamp-2">
                      {item.summary}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{item.sourceName || '뉴스'}</span>
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-purple-500 hover:text-purple-700"
                    >
                      원문 보기
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'changes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              총 <strong>{changesData?.data?.pagination.total || 0}</strong>개의 인사 정보
            </p>
            <Button variant="ghost" size="sm" onClick={() => refetchChanges()}>
              <RefreshCw className="mr-1 h-3 w-3" />
              새로고침
            </Button>
          </div>

          {changesLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="rounded-lg border p-4">
                  <div className="flex gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="mb-2 h-5 w-48" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : changesError ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 p-8 text-center">
              <AlertCircle className="mb-2 h-8 w-8 text-red-500" />
              <p className="mb-4 text-red-700">인사 정보를 불러오는데 실패했습니다.</p>
              <Button variant="outline" onClick={() => refetchChanges()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                다시 시도
              </Button>
            </div>
          ) : personnelChanges.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
              <p className="text-gray-500">조건에 맞는 인사 정보가 없습니다.</p>
              <p className="mt-1 text-sm text-gray-400">
                필터 조건을 변경해보세요.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {personnelChanges.map(item => {
                const changeLabel = PERSONNEL_CHANGE_LABELS[item.changeType as PersonnelChangeType] || item.changeType;
                const changeColor = PERSONNEL_CHANGE_COLORS[item.changeType] || 'bg-gray-100 text-gray-800';

                return (
                  <div
                    key={item.id}
                    className="flex gap-4 rounded-lg border bg-white p-4 transition-shadow hover:shadow-sm"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xl">
                      {getChangeIcon(item.changeType)}
                    </div>
                    <div className="flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="gap-1">
                          <Building2 className="h-3 w-3" />
                          {item.company.name}
                        </Badge>
                        <Badge className={changeColor}>{changeLabel}</Badge>
                      </div>
                      <div className="mb-1">
                        <span className="font-semibold">{item.personName}</span>
                        {item.position && (
                          <span className="ml-2 text-gray-600">
                            {item.position}
                            {item.department && ` (${item.department})`}
                          </span>
                        )}
                      </div>
                      {item.previousPosition && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>{item.previousPosition}</span>
                          <ArrowRight className="h-3 w-3" />
                          <span className="font-medium text-gray-700">
                            {item.position || '현재 직책'}
                          </span>
                        </div>
                      )}
                      <div className="mt-2 text-xs text-gray-400">
                        발표일: {format(new Date(item.announcedAt), 'yyyy.MM.dd', { locale: ko })}
                        {item.effectiveDate && (
                          <span className="ml-3">
                            발령일: {format(new Date(item.effectiveDate), 'yyyy.MM.dd', { locale: ko })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
