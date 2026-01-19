'use client';

import {
  Treemap,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface ServiceSubscriberData {
  serviceCode: string;
  serviceName: string;
  category: string;
  subscriberCount: number;
  totalAmount: number;
}

interface ServiceTreemapProps {
  data: ServiceSubscriberData[];
}

const CATEGORY_COLORS: Record<string, string> = {
  TRADING: '#3B82F6',
  COMPLIANCE: '#EF4444',
  CHANNEL: '#10B981',
  INFRA: '#8B5CF6',
  OTHER: '#6B7280',
};

interface TreemapContentProps {
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
  category: string;
  subscriberCount: number;
}

const CustomContent = ({ x, y, width, height, name, category, subscriberCount }: TreemapContentProps) => {
  const showText = width > 60 && height > 40;
  const showCount = width > 40 && height > 25;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: CATEGORY_COLORS[category] || '#6B7280',
          stroke: '#fff',
          strokeWidth: 2,
          strokeOpacity: 1,
        }}
      />
      {showText && (
        <text
          x={x + width / 2}
          y={y + height / 2 - (showCount ? 6 : 0)}
          textAnchor="middle"
          fill="#fff"
          fontSize={Math.min(11, width / 8)}
          fontWeight="500"
        >
          {name.length > 15 ? name.substring(0, 12) + '...' : name}
        </text>
      )}
      {showCount && (
        <text
          x={x + width / 2}
          y={y + height / 2 + 10}
          textAnchor="middle"
          fill="#fff"
          fontSize={10}
          opacity={0.9}
        >
          {subscriberCount}개사
        </text>
      )}
    </g>
  );
};

export function ServiceTreemap({ data }: ServiceTreemapProps) {
  const treeData = data
    .filter(item => item.subscriberCount > 0)
    .map(item => ({
      name: item.serviceName,
      size: item.subscriberCount,
      category: item.category,
      subscriberCount: item.subscriberCount,
      totalAmount: item.totalAmount,
    }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <Treemap
        data={treeData}
        dataKey="size"
        aspectRatio={4 / 3}
        stroke="#fff"
        fill="#8884d8"
        content={<CustomContent x={0} y={0} width={0} height={0} name="" category="" subscriberCount={0} />}
      >
        <Tooltip
          formatter={(value, _name, props) => {
            const numValue = typeof value === 'number' ? value : 0;
            const totalAmount = (props?.payload as { totalAmount?: number })?.totalAmount || 0;
            return [
              `가입사: ${numValue}개, 총 계약금액: ${totalAmount.toFixed(2)}억원`,
              ''
            ];
          }}
          labelFormatter={(label) => String(label)}
        />
      </Treemap>
    </ResponsiveContainer>
  );
}
