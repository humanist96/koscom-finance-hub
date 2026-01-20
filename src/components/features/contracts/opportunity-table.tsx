'use client';

const CATEGORY_LABELS: Record<string, string> = {
  DOMESTIC: '국내',
  FOREIGN: '외자계',
  MIGRATED: '이관사',
};

const PRIORITY_STYLES: Record<string, string> = {
  HIGH: 'bg-red-100 text-red-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  LOW: 'bg-green-100 text-green-700',
};

interface FocusCustomer {
  rank: number;
  companyId: string;
  companyName: string;
  category: string;
  year2025Revenue: number;
  powerbaseRevenue: number;
  progressNotes: string;
  priority: string;
  actionRequired: string;
}

interface OpportunityTableProps {
  data: FocusCustomer[];
}

export function OpportunityTable({ data }: OpportunityTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        데이터가 없습니다.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              순위
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              고객사
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              구분
            </th>
            <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              2025년 예상
            </th>
            <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              현재 PB매출
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              진행사항
            </th>
            <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              우선순위
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              액션
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((customer) => (
            <tr key={customer.companyId} className="hover:bg-gray-50">
              <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">
                {customer.rank}
              </td>
              <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                {customer.companyName}
              </td>
              <td className="px-3 py-3 whitespace-nowrap text-sm">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    customer.category === 'DOMESTIC'
                      ? 'bg-blue-100 text-blue-700'
                      : customer.category === 'FOREIGN'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {CATEGORY_LABELS[customer.category]}
                </span>
              </td>
              <td className="px-3 py-3 whitespace-nowrap text-sm text-right font-medium text-green-600">
                {customer.year2025Revenue.toFixed(2)}억
              </td>
              <td className="px-3 py-3 whitespace-nowrap text-sm text-right text-gray-600">
                {customer.powerbaseRevenue.toFixed(2)}억
              </td>
              <td className="px-3 py-3 text-sm text-gray-500 max-w-xs truncate" title={customer.progressNotes}>
                {customer.progressNotes || '-'}
              </td>
              <td className="px-3 py-3 whitespace-nowrap text-center">
                <span className={`px-2 py-1 rounded text-xs font-medium ${PRIORITY_STYLES[customer.priority]}`}>
                  {customer.priority}
                </span>
              </td>
              <td className="px-3 py-3 whitespace-nowrap text-sm text-blue-600">
                {customer.actionRequired}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface ServiceOpportunity {
  service: string;
  serviceName: string;
  category: string;
  subscribedCount: number;
  potentialCount: number;
  avgAmount: number;
  totalPotential: number;
}

interface ServiceOpportunityTableProps {
  data: ServiceOpportunity[];
}

export function ServiceOpportunityTable({ data }: ServiceOpportunityTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        데이터가 없습니다.
      </div>
    );
  }

  const SERVICE_CATEGORY_LABELS: Record<string, string> = {
    TRADING: '트레이딩',
    COMPLIANCE: '컴플라이언스',
    CHANNEL: '채널',
    INFRA: '인프라',
    OTHER: '기타',
  };

  const SERVICE_CATEGORY_COLORS: Record<string, string> = {
    TRADING: 'bg-blue-100 text-blue-700',
    COMPLIANCE: 'bg-red-100 text-red-700',
    CHANNEL: 'bg-green-100 text-green-700',
    INFRA: 'bg-purple-100 text-purple-700',
    OTHER: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              서비스
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              카테고리
            </th>
            <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              가입사
            </th>
            <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              미가입사
            </th>
            <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              평균 계약금액
            </th>
            <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              잠재 매출
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item) => (
            <tr key={item.service} className="hover:bg-gray-50">
              <td className="px-3 py-3 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium text-gray-900">{item.serviceName}</div>
                  <div className="text-xs text-gray-500">{item.service}</div>
                </div>
              </td>
              <td className="px-3 py-3 whitespace-nowrap">
                <span className={`px-2 py-1 rounded text-xs font-medium ${SERVICE_CATEGORY_COLORS[item.category] || SERVICE_CATEGORY_COLORS.OTHER}`}>
                  {SERVICE_CATEGORY_LABELS[item.category] || item.category}
                </span>
              </td>
              <td className="px-3 py-3 whitespace-nowrap text-sm text-right text-gray-600">
                {item.subscribedCount}개사
              </td>
              <td className="px-3 py-3 whitespace-nowrap text-sm text-right font-medium text-blue-600">
                {item.potentialCount}개사
              </td>
              <td className="px-3 py-3 whitespace-nowrap text-sm text-right text-gray-600">
                {item.avgAmount.toFixed(1)}억
              </td>
              <td className="px-3 py-3 whitespace-nowrap text-sm text-right font-medium text-green-600">
                {item.totalPotential.toFixed(1)}억
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
