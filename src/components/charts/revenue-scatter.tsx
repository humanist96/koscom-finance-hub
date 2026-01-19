'use client';

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
  Legend,
} from 'recharts';

interface RevenueComparisonData {
  companyName: string;
  companyId: string;
  powerbaseRevenue: number;
  currentRevenue: number;
  year2025Revenue: number;
  category: string;
  customerType: string;
}

interface RevenueScatterProps {
  data: RevenueComparisonData[];
}

const CATEGORY_COLORS: Record<string, string> = {
  DOMESTIC: '#3B82F6',
  FOREIGN: '#10B981',
  MIGRATED: '#F59E0B',
};

export function RevenueScatter({ data }: RevenueScatterProps) {
  const domesticData = data.filter(d => d.category === 'DOMESTIC');
  const foreignData = data.filter(d => d.category === 'FOREIGN');
  const migratedData = data.filter(d => d.category === 'MIGRATED');

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ScatterChart
        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          type="number"
          dataKey="powerbaseRevenue"
          name="PowerBASE 매출"
          unit="억"
          label={{ value: 'PowerBASE 매출 (억원)', position: 'bottom', offset: 0 }}
          fontSize={11}
        />
        <YAxis
          type="number"
          dataKey="currentRevenue"
          name="당기매출"
          unit="억"
          label={{ value: '당기매출 (억원)', angle: -90, position: 'insideLeft' }}
          fontSize={11}
        />
        <ZAxis
          type="number"
          dataKey="year2025Revenue"
          range={[50, 400]}
          name="2025년 매출"
        />
        <Tooltip
          cursor={{ strokeDasharray: '3 3' }}
          formatter={(value, name) => {
            const numValue = typeof value === 'number' ? value : 0;
            return [`${numValue.toFixed(2)}억원`, String(name)];
          }}
          labelFormatter={(_label, payload) => {
            if (payload && payload.length > 0) {
              const item = payload[0].payload as RevenueComparisonData;
              return item.companyName;
            }
            return '';
          }}
        />
        <Legend />
        <Scatter
          name="국내"
          data={domesticData}
          fill={CATEGORY_COLORS.DOMESTIC}
        />
        <Scatter
          name="외자계"
          data={foreignData}
          fill={CATEGORY_COLORS.FOREIGN}
        />
        <Scatter
          name="이관사"
          data={migratedData}
          fill={CATEGORY_COLORS.MIGRATED}
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
