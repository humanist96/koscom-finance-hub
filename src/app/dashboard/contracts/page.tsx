'use client';

import { useState } from 'react';
import { useContractStats, useServiceStats, useContracts, useContractInsights } from '@/hooks/use-contracts';
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
import {
  InsightCard,
  StatCard,
  OpportunityTable,
  ServiceOpportunityTable,
  RiskAlert,
  RiskSummary,
  ActionItems,
  ActionSummary,
} from '@/components/features/contracts';

type TabType = 'revenue' | 'service' | 'customer' | 'insight';

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
  const { data: insightsData, isLoading: insightsLoading } = useContractInsights();

  const stats = statsData?.data;
  const serviceStats = serviceData?.data;
  const insights = insightsData?.data;

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
            { key: 'insight', label: '영업 인사이트' },
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

      {/* 영업 인사이트 탭 */}
      {activeTab === 'insight' && (
        <div className="space-y-6">
          {insightsLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">인사이트 데이터 로딩 중...</span>
            </div>
          ) : insights ? (
            <>
              {/* 요약 카드 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  label="영업 기회 잠재 매출"
                  value={`${insights.summary.totalOpportunityRevenue.toFixed(0)}억`}
                  subValue="업셀링 + 서비스 확대"
                  color="green"
                />
                <StatCard
                  label="집중 관리 고객 매출"
                  value={`${insights.summary.focusCustomersRevenue.toFixed(1)}억`}
                  subValue="2025년 TOP 10"
                  color="blue"
                />
                <StatCard
                  label="리스크 고객 매출"
                  value={`${insights.summary.atRiskRevenue.toFixed(1)}억`}
                  subValue="이탈/감소 위험"
                  color="red"
                />
                <StatCard
                  label="이관사 업셀링 기회"
                  value={`${insights.upsellOpportunities.migratedCustomers.count}개사`}
                  subValue={`잠재 ${insights.upsellOpportunities.migratedCustomers.potentialRevenue.toFixed(0)}억`}
                  color="yellow"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 이관사 업셀링 기회 */}
                <InsightCard
                  title="이관사 업셀링 기회"
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  }
                >
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-yellow-50 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-yellow-700">
                          {insights.upsellOpportunities.migratedCustomers.count}개사
                        </div>
                        <div className="text-xs text-yellow-600">이관사 수</div>
                      </div>
                      <div className="bg-yellow-50 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-yellow-700">
                          {insights.upsellOpportunities.migratedCustomers.avgRevenue}억
                        </div>
                        <div className="text-xs text-yellow-600">평균 매출</div>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">타겟 평균 매출</span>
                        <span className="font-medium">{insights.upsellOpportunities.migratedCustomers.targetAvgRevenue}억</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">잠재 매출</span>
                        <span className="font-bold text-green-600">
                          +{insights.upsellOpportunities.migratedCustomers.potentialRevenue}억
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      이관사의 평균 매출이 국내/외자계 대비 낮아 업셀링 기회가 있습니다.
                    </p>
                  </div>
                </InsightCard>

                {/* 서비스 영업 기회 */}
                <InsightCard
                  title="서비스별 영업 기회 TOP 5"
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  }
                >
                  <div className="space-y-3">
                    {insights.upsellOpportunities.serviceOpportunities.slice(0, 5).map((item) => (
                      <div key={item.service} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">{item.serviceName}</div>
                          <div className="text-xs text-gray-500">
                            가입 {item.subscribedCount}개사 / 미가입 {item.potentialCount}개사
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-green-600">+{item.totalPotential.toFixed(0)}억</div>
                          <div className="text-xs text-gray-400">잠재 매출</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </InsightCard>
              </div>

              {/* 집중 관리 고객 TOP 10 */}
              <InsightCard
                title="2025년 집중 관리 고객 TOP 10"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                }
              >
                <OpportunityTable data={insights.focusCustomers} />
              </InsightCard>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 리스크 모니터링 */}
                <InsightCard
                  title="리스크 모니터링"
                  icon={
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  }
                >
                  <RiskSummary
                    totalCount={insights.riskCustomers.length}
                    highCount={insights.riskCustomers.filter(r => r.riskLevel === 'HIGH').length}
                    mediumCount={insights.riskCustomers.filter(r => r.riskLevel === 'MEDIUM').length}
                    lowCount={insights.riskCustomers.filter(r => r.riskLevel === 'LOW').length}
                    totalAtRiskRevenue={insights.summary.atRiskRevenue}
                  />
                  <RiskAlert data={insights.riskCustomers.slice(0, 5)} />
                </InsightCard>

                {/* 액션 아이템 */}
                <InsightCard
                  title="영업 액션 아이템"
                  icon={
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  }
                >
                  <ActionSummary
                    shortTermCount={insights.actionItems.shortTerm.length}
                    midTermCount={insights.actionItems.midTerm.length}
                    longTermCount={insights.actionItems.longTerm.length}
                    totalEstimatedRevenue={
                      insights.actionItems.shortTerm.reduce((sum, i) => sum + i.estimatedRevenue, 0) +
                      insights.actionItems.midTerm.reduce((sum, i) => sum + i.estimatedRevenue, 0) +
                      insights.actionItems.longTerm.reduce((sum, i) => sum + i.estimatedRevenue, 0)
                    }
                  />
                  <ActionItems data={insights.actionItems} />
                </InsightCard>
              </div>

              {/* 서비스별 영업 기회 상세 */}
              <InsightCard
                title="서비스별 영업 기회 상세"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                }
              >
                <ServiceOpportunityTable data={insights.upsellOpportunities.serviceOpportunities} />
              </InsightCard>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              인사이트 데이터를 불러오는데 실패했습니다.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
