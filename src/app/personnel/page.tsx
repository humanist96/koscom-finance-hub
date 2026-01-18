'use client';

import { useState } from 'react';
import { PersonnelList } from '@/components/features/personnel/personnel-list';
import { Badge } from '@/components/ui/badge';
import { PERSONNEL_CHANGE_LABELS, type PersonnelChangeType } from '@/types/news';

const changeTypes: PersonnelChangeType[] = [
  'APPOINTMENT',
  'PROMOTION',
  'TRANSFER',
  'RESIGNATION',
  'RETIREMENT',
];

const dateOptions = [
  { label: '최근 1주', value: '1week' },
  { label: '최근 1개월', value: '1month' },
  { label: '최근 3개월', value: '3months' },
  { label: '전체', value: 'all' },
];

export default function PersonnelPage() {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState('1month');

  const toggleType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">인사 동향</h1>
        <p className="mt-1 text-sm text-gray-500">
          증권사 임원 및 주요 인사의 변동 내역을 확인하세요
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4 rounded-lg border bg-gray-50 p-4">
        {/* Date Range */}
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

        {/* Change Type */}
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
      </div>

      {/* Personnel List */}
      <PersonnelList
        changeTypes={selectedTypes.length > 0 ? selectedTypes : undefined}
        dateRange={dateRange}
      />
    </div>
  );
}
