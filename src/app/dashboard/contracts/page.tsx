'use client';

import { useState } from 'react';
import { useContractStats, useServiceStats, useContracts } from '@/hooks/use-contracts';
import {
  ChartCard,
  RevenueBarChart,
  ServiceRevenueBarChart,
  CustomerPieChart,
  CategoryPieChart,
  ServiceCategoryPieChart,
  ServiceTreemap,
  RevenueScatter,
  ServiceRadar,
} from '@/components/charts';

type TabType = 'revenue' | 'service' | 'customer';

const CATEGORY_LABELS: Record<string, string> = {
  DOMESTIC: '국내',
  FOREIGN: '외자계',
  MIGRATED: '이관사',
};

const TYPE_LABELS: Record<string, string> = {
  SECURITIES: '증권사',
  INSTITUTION: '유관기관',
  ASSET_MGMT: '자산운용사',
  FUTURES: '선물사',
  MEDIA: '신문사',
};

export default function ContractsDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>('revenue');
  const { data: statsData, isLoading: statsLoading, error: statsError } = useContractStats();
  const { data: serviceData, isLoading: serviceLoading } = useServiceStats();
  const { data: contractsData } = useContracts({ limit: 100 });

  const stats = statsData?.data;
  const serviceStats = serviceData?.data;

  if (statsLoading || serviceLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">데이터 로딩 중...</span>
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">데이터를 불러오는데 실패했습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Powerbase 고객사 계약 현황</h1>
          <p className="mt-1 text-sm text-gray-500">
            코스콤 Powerbase 고객사 계약 데이터 분석 대시보드
          </p>
        </div>
      </div>

      {/* 총계 카드 */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">총 고객사</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalStats.totalContracts}개사</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">PowerBASE 총 매출</p>
            <p className="text-2xl font-bold text-blue-600">
              {stats.totalStats.totalPowerbaseRevenue.toFixed(1)}억
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">2025년 예상 매출</p>
            <p className="text-2xl font-bold text-green-600">
              {stats.totalStats.totalYear2025Revenue.toFixed(1)}억
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">당기 총 매출</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.totalStats.totalCurrentRevenue.toFixed(1)}억
            </p>
          </div>
        </div>
      )}

      {/* 탭 네비게이션 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'revenue', label: '매출 분석' },
            { key: 'service', label: '서비스 분석' },
            { key: 'customer', label: '고객사 분석' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabType)}
              className={`
                whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* 매출 분석 탭 */}
      {activeTab === 'revenue' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 고객 분류별 매출 비중 */}
            <ChartCard
              title="고객 분류별 매출 비중"
              description="증권사, 유관기관, 자산운용사 등 분류별 PowerBASE 매출"
            >
              <CustomerPieChart data={stats.revenueByCustomerType} />
            </ChartCard>

            {/* 구분별 매출 비교 */}
            <ChartCard
              title="구분별 매출 비교"
              description="국내/외자계/이관사별 PowerBASE 매출 비교"
            >
              <CategoryPieChart data={stats.revenueByCategory} />
            </ChartCard>
          </div>

          {/* 고객사별 매출 TOP 20 */}
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
            <RevenueBarChart data={stats.revenueTop20} />
          </ChartCard>

          {/* 2025년 매출 예상 TOP 10 */}
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
                  {stats.year2025Top10.map((item, index) => (
                    <tr key={item.companyId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.companyName}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        <span className={`
                          px-2 py-1 rounded text-xs font-medium
                          ${item.category === 'DOMESTIC' ? 'bg-blue-100 text-blue-700' :
                            item.category === 'FOREIGN' ? 'bg-green-100 text-green-700' :
                            'bg-yellow-100 text-yellow-700'}
                        `}>
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
      )}

      {/* 서비스 분석 탭 */}
      {activeTab === 'service' && serviceStats && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 서비스 카테고리별 매출 */}
            <ChartCard
              title="서비스 카테고리별 매출"
              description="트레이딩, 컴플라이언스, 채널, 인프라별 매출"
            >
              <ServiceCategoryPieChart data={serviceStats.revenueByServiceCategory} />
            </ChartCard>

            {/* 서비스별 가입사 수 트리맵 */}
            <ChartCard
              title="서비스별 가입사 수"
              description="각 서비스를 사용하는 고객사 수 (크기 = 가입사 수)"
            >
              <ServiceTreemap data={serviceStats.serviceSubscriberCount} />
            </ChartCard>
          </div>

          {/* 서비스별 계약 금액 TOP 15 */}
          <ChartCard
            title="서비스별 계약 금액 TOP 15"
            description="총 계약 금액 기준 상위 15개 서비스"
          >
            <div className="flex items-center gap-4 mb-4 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-blue-500"></span> 트레이딩
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-red-500"></span> 컴플라이언스
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-green-500"></span> 채널
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-purple-500"></span> 인프라
              </span>
            </div>
            <ServiceRevenueBarChart data={serviceStats.serviceRevenueTop15} />
          </ChartCard>

          {/* 외자계 vs 국내 서비스 비교 */}
          <ChartCard
            title="외자계 vs 국내 증권사 서비스 가입 현황"
            description="주요 서비스별 국내/외자계 증권사 계약 금액 비교"
          >
            <ServiceRadar data={serviceStats.radarData} />
          </ChartCard>
        </div>
      )}

      {/* 고객사 분석 탭 */}
      {activeTab === 'customer' && stats && (
        <div className="space-y-6">
          {/* 매출 산점도 */}
          <ChartCard
            title="PowerBASE 매출 vs 당기매출 비교"
            description="X축: PowerBASE 매출, Y축: 당기매출 (원 크기: 2025년 예상 매출)"
          >
            <RevenueScatter data={stats.revenueComparison} />
          </ChartCard>

          {/* 고객사 목록 테이블 */}
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
                  {contractsData?.data?.items?.map((contract) => (
                    <tr key={contract.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-sm text-gray-500">{contract.orderNumber}</td>
                      <td className="px-3 py-2 text-sm font-medium text-gray-900">{contract.company.name}</td>
                      <td className="px-3 py-2 text-sm">
                        <span className={`
                          px-2 py-0.5 rounded text-xs font-medium
                          ${contract.category === 'DOMESTIC' ? 'bg-blue-100 text-blue-700' :
                            contract.category === 'FOREIGN' ? 'bg-green-100 text-green-700' :
                            'bg-yellow-100 text-yellow-700'}
                        `}>
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
      )}
    </div>
  );
}
