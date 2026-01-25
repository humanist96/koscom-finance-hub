'use client';

import {
  ChartCard,
  RevenueBarChart,
  CustomerPieChart,
  CategoryPieChart,
} from '@/components/charts';
import { CATEGORY_LABELS, getCategoryBadgeClass } from './constants';

interface RevenueTabProps {
  revenueByCustomerType: Array<{ type: string; totalRevenue: number; count: number }>;
  revenueByCategory: Array<{ category: string; powerbaseRevenue: number; year2025Revenue: number; count: number }>;
  revenueTop20: Array<{
    companyId: string;
    companyName: string;
    category: string;
    powerbaseRevenue: number;
    year2025Revenue: number;
  }>;
  year2025Top10: Array<{
    companyId: string;
    companyName: string;
    category: string;
    year2025Revenue: number;
  }>;
}

export function RevenueTab({
  revenueByCustomerType,
  revenueByCategory,
  revenueTop20,
  year2025Top10,
}: RevenueTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="고객 분류별 매출 비중"
          description="증권사, 유관기관, 자산운용사 등 분류별 PowerBASE 매출"
        >
          <CustomerPieChart data={revenueByCustomerType} />
        </ChartCard>

        <ChartCard
          title="구분별 매출 비교"
          description="국내/외자계/이관사별 PowerBASE 매출 비교"
        >
          <CategoryPieChart data={revenueByCategory} />
        </ChartCard>
      </div>

      <ChartCard
        title="고객사별 PowerBASE 매출 TOP 20"
        description="PowerBASE 매출 기준 상위 20개사"
      >
        <div className="flex items-center gap-4 mb-4 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-blue-500"></span> 국내
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-green-500"></span> 외자계
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-yellow-500"></span> 이관사
          </span>
        </div>
        <RevenueBarChart data={revenueTop20} />
      </ChartCard>

      <ChartCard
        title="2025년 신규 매출 예상 TOP 10"
        description="2025년 계약 예정 금액 기준"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">순위</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">고객사</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">구분</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">2025년 매출</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {year2025Top10.map((item, index) => (
                <tr key={item.companyId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.companyName}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryBadgeClass(item.category)}`}>
                      {CATEGORY_LABELS[item.category]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-green-600">
                    {item.year2025Revenue.toFixed(2)}억
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
}
