'use client';

import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { PERSONNEL_CHANGE_LABELS, type PersonnelChangeType } from '@/types/news';
import { PERSONNEL_CHANGE_COLORS } from '@/constants';
import { ArrowRight, Building2 } from 'lucide-react';

interface PersonnelItemProps {
  personName: string;
  position?: string | null;
  department?: string | null;
  changeType: string;
  previousPosition?: string | null;
  announcedAt: Date | string;
  effectiveDate?: Date | string | null;
  company: {
    id: string;
    name: string;
  };
}

export function PersonnelItem({
  personName,
  position,
  department,
  changeType,
  previousPosition,
  announcedAt,
  effectiveDate,
  company,
}: PersonnelItemProps) {
  const changeLabel =
    PERSONNEL_CHANGE_LABELS[changeType as PersonnelChangeType] || changeType;
  const changeColor =
    PERSONNEL_CHANGE_COLORS[changeType] || 'bg-gray-100 text-gray-800';

  const getChangeIcon = () => {
    switch (changeType) {
      case 'APPOINTMENT':
        return '🔵';
      case 'PROMOTION':
        return '🟢';
      case 'TRANSFER':
        return '🟡';
      case 'RESIGNATION':
      case 'RETIREMENT':
        return '🔴';
      default:
        return '⚪';
    }
  };

  return (
    <div className="flex gap-4 rounded-lg border p-4 transition-shadow hover:shadow-sm">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xl">
        {getChangeIcon()}
      </div>
      <div className="flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Building2 className="h-3 w-3" />
            {company.name}
          </Badge>
          <Badge className={changeColor}>{changeLabel}</Badge>
        </div>
        <div className="mb-1">
          <span className="font-semibold">{personName}</span>
          {position && (
            <span className="ml-2 text-gray-600">
              {position}
              {department && ` (${department})`}
            </span>
          )}
        </div>
        {previousPosition && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{previousPosition}</span>
            <ArrowRight className="h-3 w-3" />
            <span className="font-medium text-gray-700">
              {position || '현재 직책'}
            </span>
          </div>
        )}
        <div className="mt-2 text-xs text-gray-400">
          발표일: {format(new Date(announcedAt), 'yyyy.MM.dd', { locale: ko })}
          {effectiveDate && (
            <span className="ml-3">
              발령일: {format(new Date(effectiveDate), 'yyyy.MM.dd', { locale: ko })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
