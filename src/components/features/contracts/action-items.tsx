'use client';

interface ActionItem {
  companyName: string;
  action: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  estimatedRevenue: number;
}

interface ActionItemsData {
  shortTerm: ActionItem[];
  midTerm: ActionItem[];
  longTerm: ActionItem[];
}

interface ActionItemsProps {
  data: ActionItemsData;
}

const TIMELINE_CONFIG = {
  shortTerm: {
    label: '단기 (즉시)',
    color: 'red',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    dotColor: 'bg-red-500',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  midTerm: {
    label: '중기 (분기 내)',
    color: 'yellow',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    dotColor: 'bg-yellow-500',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  longTerm: {
    label: '장기 (연내)',
    color: 'green',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    dotColor: 'bg-green-500',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
};

export function ActionItems({ data }: ActionItemsProps) {
  const timelines = [
    { key: 'shortTerm' as const, items: data.shortTerm },
    { key: 'midTerm' as const, items: data.midTerm },
    { key: 'longTerm' as const, items: data.longTerm },
  ];

  const totalItems = data.shortTerm.length + data.midTerm.length + data.longTerm.length;

  if (totalItems === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p>등록된 액션 아이템이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {timelines.map(({ key, items }) => {
        const config = TIMELINE_CONFIG[key];
        if (items.length === 0) return null;

        return (
          <div key={key} className={`rounded-lg border p-4 ${config.bgColor} ${config.borderColor}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className={`${config.dotColor} text-white rounded-full p-1`}>
                {config.icon}
              </span>
              <h4 className="font-semibold text-gray-900">{config.label}</h4>
              <span className="text-xs text-gray-500 ml-auto">{items.length}건</span>
            </div>
            <div className="space-y-2">
              {items.map((item, index) => (
                <div
                  key={`${item.companyName}-${index}`}
                  className="bg-white rounded-lg border border-gray-200 p-3 flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{item.companyName}</span>
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded ${
                          item.priority === 'HIGH'
                            ? 'bg-red-100 text-red-700'
                            : item.priority === 'MEDIUM'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {item.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate mt-0.5" title={item.action}>
                      {item.action}
                    </p>
                  </div>
                  {item.estimatedRevenue > 0 && (
                    <div className="text-right ml-4">
                      <div className="text-sm font-medium text-green-600">
                        +{item.estimatedRevenue.toFixed(1)}억
                      </div>
                      <div className="text-xs text-gray-400">예상 매출</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface ActionSummaryProps {
  shortTermCount: number;
  midTermCount: number;
  longTermCount: number;
  totalEstimatedRevenue: number;
}

export function ActionSummary({ shortTermCount, midTermCount, longTermCount, totalEstimatedRevenue }: ActionSummaryProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
      <div className="bg-red-100 rounded-lg p-3 text-center">
        <div className="text-2xl font-bold text-red-600">{shortTermCount}</div>
        <div className="text-xs text-red-600">단기</div>
      </div>
      <div className="bg-yellow-100 rounded-lg p-3 text-center">
        <div className="text-2xl font-bold text-yellow-600">{midTermCount}</div>
        <div className="text-xs text-yellow-600">중기</div>
      </div>
      <div className="bg-green-100 rounded-lg p-3 text-center">
        <div className="text-2xl font-bold text-green-600">{longTermCount}</div>
        <div className="text-xs text-green-600">장기</div>
      </div>
      <div className="bg-blue-100 rounded-lg p-3 text-center">
        <div className="text-2xl font-bold text-blue-600">{totalEstimatedRevenue.toFixed(1)}억</div>
        <div className="text-xs text-blue-600">예상 매출</div>
      </div>
    </div>
  );
}
