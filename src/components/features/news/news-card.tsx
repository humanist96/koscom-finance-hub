'use client';

import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NEWS_CATEGORY_LABELS, type NewsCategory } from '@/types/news';
import { CATEGORY_COLORS } from '@/constants';

interface NewsCardProps {
  id: string;
  title: string;
  summary?: string | null;
  sourceUrl: string;
  sourceName?: string | null;
  category: string;
  isPersonnel: boolean;
  publishedAt: Date | string;
  company: {
    id: string;
    name: string;
    logoUrl?: string | null;
  };
}

export function NewsCard({
  id,
  title,
  summary,
  sourceUrl,
  sourceName,
  category,
  isPersonnel,
  publishedAt,
  company,
}: NewsCardProps) {
  const timeAgo = formatDistanceToNow(new Date(publishedAt), {
    addSuffix: true,
    locale: ko,
  });

  const categoryLabel = NEWS_CATEGORY_LABELS[category as NewsCategory] || category;
  const categoryColor = CATEGORY_COLORS[category] || 'bg-gray-100 text-gray-800';

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-blue-600">{company.name}</span>
            <Badge variant="outline" className={categoryColor}>
              {categoryLabel}
            </Badge>
            {isPersonnel && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                인사
              </Badge>
            )}
          </div>
          <span className="shrink-0 text-xs text-gray-400">{timeAgo}</span>
        </div>
      </CardHeader>
      <CardContent>
        <h3 className="mb-2 font-semibold leading-tight">
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-600"
          >
            {title}
          </a>
        </h3>
        {summary && (
          <p className="mb-3 text-sm text-gray-600 line-clamp-2">{summary}</p>
        )}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-blue-600"
          >
            <ExternalLink className="h-3 w-3" />
            {sourceName || '원문 보기'}
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
