'use client';

import { RefreshCw, Search, Filter, Plus, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CHANGE_TYPE_OPTIONS, SOURCE_TYPE_OPTIONS } from './constants';

interface Company {
  id: string;
  name: string;
  code: string | null;
}

interface PersonnelFiltersProps {
  companies: Company[];
  companyFilter: string;
  onCompanyFilterChange: (value: string) => void;
  changeTypeFilter: string;
  onChangeTypeFilterChange: (value: string) => void;
  sourceTypeFilter: string;
  onSourceTypeFilterChange: (value: string) => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onRefresh: () => void;
  onAddNew: () => void;
  onDownloadTemplate: () => void;
  loading: boolean;
}

export function PersonnelFilters({
  companies,
  companyFilter,
  onCompanyFilterChange,
  changeTypeFilter,
  onChangeTypeFilterChange,
  sourceTypeFilter,
  onSourceTypeFilterChange,
  searchQuery,
  onSearchQueryChange,
  onRefresh,
  onAddNew,
  onDownloadTemplate,
  loading,
}: PersonnelFiltersProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={companyFilter}
            onChange={(e) => onCompanyFilterChange(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="">전체 증권사</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>

        <select
          value={changeTypeFilter}
          onChange={(e) => onChangeTypeFilterChange(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="">전체 변동유형</option>
          {CHANGE_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={sourceTypeFilter}
          onChange={(e) => onSourceTypeFilterChange(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="">전체 소스</option>
          {SOURCE_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="인물명, 직책, 부서 검색..."
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onDownloadTemplate}
          >
            <Download className="h-4 w-4 mr-2" />
            템플릿
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            새로고침
          </Button>

          <Button
            size="sm"
            onClick={onAddNew}
          >
            <Plus className="h-4 w-4 mr-2" />
            인사정보 추가
          </Button>
        </div>
      </div>
    </div>
  );
}
