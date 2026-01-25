'use client';

import { ContractInsights } from '@/services/api';
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

interface InsightTabProps {
  insights: ContractInsights | undefined;
  isLoading: boolean;
}

export function InsightTab({ insights, isLoading }: InsightTabProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">인사이트 데이터 로딩 중...</span>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="text-center py-12 text-gray-500">
        인사이트 데이터를 불러오는데 실패했습니다.
      </div>
    );
  }

  const totalActionRevenue =
    insights.actionItems.shortTerm.reduce((sum, i) => sum + i.estimatedRevenue, 0) +
    insights.actionItems.midTerm.reduce((sum, i) => sum + i.estimatedRevenue, 0) +
    insights.actionItems.longTerm.reduce((sum, i) => sum + i.estimatedRevenue, 0);

  return (
    <div className="space-y-6">
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
          <MigratedCustomerInsight data={insights.upsellOpportunities.migratedCustomers} />
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
          <ServiceOpportunitySummary data={insights.upsellOpportunities.serviceOpportunities.slice(0, 5)} />
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
            totalEstimatedRevenue={totalActionRevenue}
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
    </div>
  );
}

// Sub-components

interface MigratedCustomerData {
  count: number;
  avgRevenue: number;
  targetAvgRevenue: number;
  potentialRevenue: number;
}

function MigratedCustomerInsight({ data }: { data: MigratedCustomerData }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-yellow-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-yellow-700">{data.count}개사</div>
          <div className="text-xs text-yellow-600">이관사 수</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-yellow-700">{data.avgRevenue.toFixed(1)}억</div>
          <div className="text-xs text-yellow-600">평균 매출</div>
        </div>
      </div>
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">타겟 평균 매출</span>
          <span className="font-medium">{data.targetAvgRevenue.toFixed(1)}억</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">잠재 매출</span>
          <span className="font-bold text-green-600">+{data.potentialRevenue.toFixed(0)}억</span>
        </div>
      </div>
      <p className="text-xs text-gray-500">
        이관사의 평균 매출이 국내/외자계 대비 낮아 업셀링 기회가 있습니다.
      </p>
    </div>
  );
}

interface ServiceOpportunityItem {
  service: string;
  serviceName: string;
  subscribedCount: number;
  potentialCount: number;
  totalPotential: number;
}

function ServiceOpportunitySummary({ data }: { data: ServiceOpportunityItem[] }) {
  return (
    <div className="space-y-3">
      {data.map((item) => (
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
  );
}
