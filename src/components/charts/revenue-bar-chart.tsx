'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts';

interface RevenueData {
  companyName: string;
  powerbaseRevenue: number;
  year2025Revenue: number;
  category: string;
}

interface RevenueBarChartProps {
  data: RevenueData[];
  showYear2025?: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  DOMESTIC: '#3B82F6',
  FOREIGN: '#10B981',
  MIGRATED: '#F59E0B',
};

export function RevenueBarChart({ data, showYear2025 = false }: RevenueBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={500}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
        <XAxis
          type="number"
          tickFormatter={(value) => `${value}억`}
          fontSize={11}
        />
        <YAxis
          dataKey="companyName"
          type="category"
          width={95}
          tick={{ fontSize: 11 }}
        />
        <Tooltip
          formatter={(value, name) => {
            const numValue = typeof value === 'number' ? value : 0;
            return [
              `${numValue.toFixed(2)}억원`,
              name === 'powerbaseRevenue' ? 'PowerBASE 매출' : '2025년 매출'
            ];
          }}
          labelStyle={{ fontWeight: 'bold' }}
        />
        <Legend
          formatter={(value) => value === 'powerbaseRevenue' ? 'PowerBASE 매출' : '2025년 매출'}
        />
        <Bar dataKey="powerbaseRevenue" name="powerbaseRevenue" radius={[0, 4, 4, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.category] || '#6B7280'} />
          ))}
        </Bar>
        {showYear2025 && (
          <Bar dataKey="year2025Revenue" name="year2025Revenue" fill="#EC4899" radius={[0, 4, 4, 0]} />
        )}
      </BarChart>
    </ResponsiveContainer>
  );
}

// 서비스별 매출 차트
interface ServiceRevenueData {
  serviceName: string;
  totalAmount: number;
  category: string;
}

interface ServiceRevenueBarChartProps {
  data: ServiceRevenueData[];
}

const SERVICE_CATEGORY_COLORS: Record<string, string> = {
  TRADING: '#3B82F6',
  COMPLIANCE: '#EF4444',
  CHANNEL: '#10B981',
  INFRA: '#8B5CF6',
  OTHER: '#6B7280',
};

export function ServiceRevenueBarChart({ data }: ServiceRevenueBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
        <XAxis
          type="number"
          tickFormatter={(value) => `${value}억`}
          fontSize={11}
        />
        <YAxis
          dataKey="serviceName"
          type="category"
          width={145}
          tick={{ fontSize: 10 }}
        />
        <Tooltip
          formatter={(value) => {
            const numValue = typeof value === 'number' ? value : 0;
            return [`${numValue.toFixed(2)}억원`, '계약 금액'];
          }}
          labelStyle={{ fontWeight: 'bold' }}
        />
        <Bar dataKey="totalAmount" radius={[0, 4, 4, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={SERVICE_CATEGORY_COLORS[entry.category] || '#6B7280'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
