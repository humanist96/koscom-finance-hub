'use client';

import Link from 'next/link';
import { useCompanies } from '@/hooks/use-companies';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2, Newspaper, Users, ExternalLink } from 'lucide-react';

export default function CompaniesPage() {
  const { data, isLoading } = useCompanies({ withStats: true });
  const companies = data?.data || [];

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">증권사 목록</h1>
        <p className="mt-1 text-sm text-gray-500">
          PowerBase 회원 증권사 {companies.length}개사의 정보를 확인하세요
        </p>
      </div>

      {/* Companies Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="mb-2 h-4 w-full" />
                <Skeleton className="h-4 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map(company => (
            <Link key={company.id} href={`/companies/${company.id}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    {company.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-3 flex gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Newspaper className="h-4 w-4" />
                      <span>뉴스 {company._count?.news || 0}건</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>인사 {company._count?.personnel || 0}건</span>
                    </div>
                  </div>
                  {company.websiteUrl && (
                    <a
                      href={company.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                      onClick={e => e.stopPropagation()}
                    >
                      <ExternalLink className="h-3 w-3" />
                      홈페이지 방문
                    </a>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
