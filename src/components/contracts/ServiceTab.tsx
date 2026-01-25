'use client';

import {
  ChartCard,
  ServiceRevenueBarChart,
  ServiceCategoryPieChart,
  ServiceTreemap,
  ServiceRadar,
} from '@/components/charts';

interface ServiceTabProps {
  revenueByServiceCategory: Array<{
    category: string;
    totalAmount: number;
    serviceCount: number;
  }>;
  serviceSubscriberCount: Array<{
    serviceCode: string;
    serviceName: string;
    category: string;
    subscriberCount: number;
    totalAmount: number;
  }>;
  serviceRevenueTop15: Array<{
    serviceCode: string;
    serviceName: string;
    category: string;
    totalAmount: number;
    contractCount: number;
  }>;
  radarData: Array<{
    service: string;
    serviceCode: string;
    domestic: number;
    foreign: number;
  }>;
}

export function ServiceTab({
  revenueByServiceCategory,
  serviceSubscriberCount,
  serviceRevenueTop15,
  radarData,
}: ServiceTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="서비스 카테고리별 매출"
          description="트레이딩, 컴플라이언스, 채널, 인프라별 매출"
        >
          <ServiceCategoryPieChart data={revenueByServiceCategory} />
        </ChartCard>

        <ChartCard
          title="서비스별 가입사 수"
          description="각 서비스를 사용하는 고객사 수 (크기 = 가입사 수)"
        >
          <ServiceTreemap data={serviceSubscriberCount} />
        </ChartCard>
      </div>

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
        <ServiceRevenueBarChart data={serviceRevenueTop15} />
      </ChartCard>

      <ChartCard
        title="외자계 vs 국내 증권사 서비스 가입 현황"
        description="주요 서비스별 국내/외자계 증권사 계약 금액 비교"
      >
        <ServiceRadar data={radarData} />
      </ChartCard>
    </div>
  );
}
