'use client';

interface TotalStats {
  totalContracts: number;
  totalPowerbaseRevenue: number;
  totalYear2025Revenue: number;
  totalCurrentRevenue: number;
}

interface StatsCardsProps {
  stats: TotalStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <p className="text-sm text-gray-500">총 고객사</p>
        <p className="text-2xl font-bold text-gray-900">{stats.totalContracts}개사</p>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <p className="text-sm text-gray-500">PowerBASE 총 매출</p>
        <p className="text-2xl font-bold text-blue-600">
          {stats.totalPowerbaseRevenue.toFixed(1)}억
        </p>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <p className="text-sm text-gray-500">2025년 예상 매출</p>
        <p className="text-2xl font-bold text-green-600">
          {stats.totalYear2025Revenue.toFixed(1)}억
        </p>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <p className="text-sm text-gray-500">당기 총 매출</p>
        <p className="text-2xl font-bold text-gray-900">
          {stats.totalCurrentRevenue.toFixed(1)}억
        </p>
      </div>
    </div>
  );
}
