'use client';

import { useState } from 'react';
import { useContractStats, useServiceStats, useContracts, useContractInsights } from '@/hooks/use-contracts';
import {
  StatsCards,
  TabNavigation,
  RevenueTab,
  ServiceTab,
  CustomerTab,
  InsightTab,
  type TabType,
} from '@/components/contracts';

export default function ContractsDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>('revenue');
  const { data: statsData, isLoading: statsLoading, error: statsError } = useContractStats();
  const { data: serviceData, isLoading: serviceLoading } = useServiceStats();
  const { data: contractsData } = useContracts({ limit: 100 });
  const { data: insightsData, isLoading: insightsLoading } = useContractInsights();

  const stats = statsData?.data;
  const serviceStats = serviceData?.data;
  const insights = insightsData?.data;
  const contracts = contractsData?.data?.items || [];

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
      {stats && <StatsCards stats={stats.totalStats} />}

      {/* 탭 네비게이션 */}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 매출 분석 탭 */}
      {activeTab === 'revenue' && stats && (
        <RevenueTab
          revenueByCustomerType={stats.revenueByCustomerType}
          revenueByCategory={stats.revenueByCategory}
          revenueTop20={stats.revenueTop20}
          year2025Top10={stats.year2025Top10}
        />
      )}

      {/* 서비스 분석 탭 */}
      {activeTab === 'service' && serviceStats && (
        <ServiceTab
          revenueByServiceCategory={serviceStats.revenueByServiceCategory}
          serviceSubscriberCount={serviceStats.serviceSubscriberCount}
          serviceRevenueTop15={serviceStats.serviceRevenueTop15}
          radarData={serviceStats.radarData}
        />
      )}

      {/* 고객사 분석 탭 */}
      {activeTab === 'customer' && stats && (
        <CustomerTab
          revenueComparison={stats.revenueComparison}
          contracts={contracts}
        />
      )}

      {/* 영업 인사이트 탭 */}
      {activeTab === 'insight' && (
        <InsightTab insights={insights} isLoading={insightsLoading} />
      )}
    </div>
  );
}
