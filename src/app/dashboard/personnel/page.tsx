'use client';

import { useState } from 'react';
import { PersonnelList } from '@/components/features/personnel/personnel-list';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';

const dateOptions = [
  { label: '최근 1주', value: '1week' },
  { label: '최근 1개월', value: '1month' },
  { label: '최근 3개월', value: '3months' },
  { label: '전체', value: 'all' },
];

export default function PersonnelPage() {
  const [dateRange, setDateRange] = useState('1month');

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Users className="h-6 w-6 text-purple-600" />
          인사 동향
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          증권사 임원 및 주요 인사 관련 뉴스를 확인하세요
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-lg border bg-gray-50 p-4">
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
      </div>

      {/* Personnel News List */}
      <PersonnelList dateRange={dateRange} />
    </div>
  );
}
