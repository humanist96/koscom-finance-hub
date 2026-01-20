'use client';

interface RiskCustomer {
  companyId: string;
  companyName: string;
  currentRevenue: number;
  powerbaseRevenue: number;
  riskType: 'CHURN' | 'DOWNGRADE' | 'INACTIVE';
  riskNote: string;
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface RiskAlertProps {
  data: RiskCustomer[];
}

const RISK_TYPE_LABELS: Record<string, string> = {
  CHURN: '이탈 위험',
  DOWNGRADE: '매출 감소',
  INACTIVE: '비활성',
};

const RISK_TYPE_ICONS: Record<string, React.ReactNode> = {
  CHURN: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  DOWNGRADE: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
    </svg>
  ),
  INACTIVE: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
    </svg>
  ),
};

const RISK_LEVEL_STYLES: Record<string, { bg: string; border: string; icon: string }> = {
  HIGH: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: 'text-red-500',
  },
  MEDIUM: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    icon: 'text-yellow-500',
  },
  LOW: {
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    icon: 'text-gray-500',
  },
};

export function RiskAlert({ data }: RiskAlertProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <svg className="w-12 h-12 mx-auto text-green-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>현재 리스크 고객이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((customer) => {
        const styles = RISK_LEVEL_STYLES[customer.riskLevel];
        return (
          <div
            key={customer.companyId}
            className={`rounded-lg border p-4 ${styles.bg} ${styles.border}`}
          >
            <div className="flex items-start gap-3">
              <div className={styles.icon}>
                {RISK_TYPE_ICONS[customer.riskType]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">{customer.companyName}</h4>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded ${
                      customer.riskLevel === 'HIGH'
                        ? 'bg-red-100 text-red-700'
                        : customer.riskLevel === 'MEDIUM'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {RISK_TYPE_LABELS[customer.riskType]}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{customer.riskNote}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span>당기매출: {customer.currentRevenue.toFixed(2)}억</span>
                  <span>PB매출: {customer.powerbaseRevenue.toFixed(2)}억</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface RiskSummaryProps {
  totalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  totalAtRiskRevenue: number;
}

export function RiskSummary({ totalCount, highCount, mediumCount, lowCount, totalAtRiskRevenue }: RiskSummaryProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
      <div className="bg-gray-100 rounded-lg p-3 text-center">
        <div className="text-2xl font-bold text-gray-900">{totalCount}</div>
        <div className="text-xs text-gray-500">전체 리스크</div>
      </div>
      <div className="bg-red-100 rounded-lg p-3 text-center">
        <div className="text-2xl font-bold text-red-600">{highCount}</div>
        <div className="text-xs text-red-600">고위험</div>
      </div>
      <div className="bg-yellow-100 rounded-lg p-3 text-center">
        <div className="text-2xl font-bold text-yellow-600">{mediumCount}</div>
        <div className="text-xs text-yellow-600">중위험</div>
      </div>
      <div className="bg-gray-100 rounded-lg p-3 text-center">
        <div className="text-2xl font-bold text-gray-600">{totalAtRiskRevenue.toFixed(1)}억</div>
        <div className="text-xs text-gray-500">위험 매출</div>
      </div>
    </div>
  );
}
