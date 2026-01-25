'use client';

import { ChartCard, RevenueScatter } from '@/components/charts';
import { CATEGORY_LABELS, TYPE_LABELS, getCategoryBadgeClass } from './constants';

interface ContractItem {
  id: string;
  orderNumber: number;
  company: { name: string };
  category: string;
  customerType: string;
  currentRevenue: number | null;
  powerbaseRevenue: number | null;
  year2025Revenue: number | null;
  progressNotes: string | null;
}

interface CustomerTabProps {
  revenueComparison: Array<{
    companyId: string;
    companyName: string;
    category: string;
    customerType: string;
    powerbaseRevenue: number;
    currentRevenue: number;
    year2025Revenue: number;
  }>;
  contracts: ContractItem[];
}

export function CustomerTab({ revenueComparison, contracts }: CustomerTabProps) {
  return (
    <div className="space-y-6">
      <ChartCard
        title="PowerBASE 매출 vs 당기매출 비교"
        description="X축: PowerBASE 매출, Y축: 당기매출 (원 크기: 2025년 예상 매출)"
      >
        <RevenueScatter data={revenueComparison} />
      </ChartCard>

      <ChartCard
        title="전체 고객사 목록"
        description="Powerbase 고객사 계약 현황 상세"
      >
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">순번</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">고객사</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">구분</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">분류</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">당기매출</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">PB매출</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">2025년</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">진행사항</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contracts.map((contract) => (
                <tr key={contract.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 text-sm text-gray-500">{contract.orderNumber}</td>
                  <td className="px-3 py-2 text-sm font-medium text-gray-900">{contract.company.name}</td>
                  <td className="px-3 py-2 text-sm">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getCategoryBadgeClass(contract.category)}`}>
                      {CATEGORY_LABELS[contract.category]}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-500">
                    {TYPE_LABELS[contract.customerType]}
                  </td>
                  <td className="px-3 py-2 text-sm text-right text-gray-900">
                    {contract.currentRevenue ? `${Number(contract.currentRevenue).toFixed(1)}억` : '-'}
                  </td>
                  <td className="px-3 py-2 text-sm text-right font-medium text-blue-600">
                    {contract.powerbaseRevenue ? `${Number(contract.powerbaseRevenue).toFixed(1)}억` : '-'}
                  </td>
                  <td className="px-3 py-2 text-sm text-right font-medium text-green-600">
                    {contract.year2025Revenue && Number(contract.year2025Revenue) > 0
                      ? `${Number(contract.year2025Revenue).toFixed(1)}억`
                      : '-'}
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-500 max-w-xs truncate" title={contract.progressNotes || ''}>
                    {contract.progressNotes || '-'}
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
