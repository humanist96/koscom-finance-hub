'use client';

import { use } from 'react';
import Link from 'next/link';
import { useCompany } from '@/hooks/use-companies';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { NewsCard } from '@/components/features/news/news-card';
import { PersonnelItem } from '@/components/features/personnel/personnel-item';
import {
  Building2,
  ArrowLeft,
  ExternalLink,
  Newspaper,
  Users,
} from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CompanyDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const { data, isLoading } = useCompany(id);
  const company = data?.data;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Skeleton className="mb-4 h-8 w-32" />
        <Skeleton className="mb-2 h-10 w-48" />
        <Skeleton className="mb-6 h-4 w-64" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <p className="mb-4 text-gray-500">증권사를 찾을 수 없습니다.</p>
          <Link href="/companies">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              목록으로
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Back Button */}
      <Link
        href="/companies"
        className="mb-4 inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        목록으로
      </Link>

      {/* Company Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <Building2 className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">{company.name}</h1>
        </div>
        {company.websiteUrl && (
          <a
            href={company.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex items-center gap-1 text-sm text-blue-600 hover:underline"
          >
            <ExternalLink className="h-4 w-4" />
            {company.websiteUrl}
          </a>
        )}
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Newspaper className="h-5 w-5 text-blue-600" />
              뉴스
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{company._count?.news || 0}건</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-5 w-5 text-green-600" />
              인사 정보
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{company._count?.personnel || 0}건</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="news">
        <TabsList className="mb-4">
          <TabsTrigger value="news">
            뉴스 ({company.news?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="personnel">
            인사 정보 ({company.personnel?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="news">
          {company.news && company.news.length > 0 ? (
            <div className="space-y-4">
              {company.news.map((news: any) => (
                <NewsCard
                  key={news.id}
                  id={news.id}
                  title={news.title}
                  summary={news.summary}
                  sourceUrl={news.sourceUrl}
                  sourceName={news.sourceName}
                  category={news.category}
                  isPersonnel={news.isPersonnel}
                  publishedAt={news.publishedAt}
                  company={{
                    id: company.id,
                    name: company.name,
                    logoUrl: company.logoUrl,
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
              <p className="text-gray-500">등록된 뉴스가 없습니다.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="personnel">
          {company.personnel && company.personnel.length > 0 ? (
            <div className="space-y-4">
              {company.personnel.map((item: any) => (
                <PersonnelItem
                  key={item.id}
                  personName={item.personName}
                  position={item.position}
                  department={item.department}
                  changeType={item.changeType}
                  previousPosition={null}
                  announcedAt={item.announcedAt}
                  effectiveDate={null}
                  company={{
                    id: company.id,
                    name: company.name,
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
              <p className="text-gray-500">등록된 인사 정보가 없습니다.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
