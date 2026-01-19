'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

interface CustomerTypeData {
  type: string;
  totalRevenue: number;
  count: number;
}

interface CustomerPieChartProps {
  data: CustomerTypeData[];
}

const TYPE_LABELS: Record<string, string> = {
  SECURITIES: '증권사',
  INSTITUTION: '유관기관',
  ASSET_MGMT: '자산운용사',
  FUTURES: '선물사',
  MEDIA: '신문사',
};

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export function CustomerPieChart({ data }: CustomerPieChartProps) {
  const chartData = data.map(item => ({
    ...item,
    name: TYPE_LABELS[item.type] || item.type,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          fill="#8884d8"
          paddingAngle={2}
          dataKey="totalRevenue"
          label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, _name, props) => {
            const numValue = typeof value === 'number' ? value : 0;
            const count = (props?.payload as { count?: number })?.count || 0;
            return [`${numValue.toFixed(2)}억원 (${count}개사)`, '매출'];
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

// 카테고리별 파이 차트 (국내/외자계/이관사)
interface CategoryData {
  category: string;
  powerbaseRevenue: number;
  count: number;
}

interface CategoryPieChartProps {
  data: CategoryData[];
}

const CATEGORY_LABELS: Record<string, string> = {
  DOMESTIC: '국내',
  FOREIGN: '외자계',
  MIGRATED: '이관사',
};

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  const chartData = data.map(item => ({
    ...item,
    name: CATEGORY_LABELS[item.category] || item.category,
    value: item.powerbaseRevenue,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          fill="#8884d8"
          paddingAngle={2}
          dataKey="value"
          label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, _name, props) => {
            const numValue = typeof value === 'number' ? value : 0;
            const count = (props?.payload as { count?: number })?.count || 0;
            return [`${numValue.toFixed(2)}억원 (${count}개사)`, '매출'];
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

// 서비스 카테고리별 파이 차트
interface ServiceCategoryData {
  category: string;
  totalAmount: number;
  serviceCount: number;
}

interface ServiceCategoryPieChartProps {
  data: ServiceCategoryData[];
}

const SERVICE_CATEGORY_LABELS: Record<string, string> = {
  TRADING: '트레이딩',
  COMPLIANCE: '컴플라이언스',
  CHANNEL: '채널',
  INFRA: '인프라',
  OTHER: '기타',
};

export function ServiceCategoryPieChart({ data }: ServiceCategoryPieChartProps) {
  const chartData = data.map(item => ({
    ...item,
    name: SERVICE_CATEGORY_LABELS[item.category] || item.category,
    value: item.totalAmount,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          fill="#8884d8"
          paddingAngle={2}
          dataKey="value"
          label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, _name, props) => {
            const numValue = typeof value === 'number' ? value : 0;
            const serviceCount = (props?.payload as { serviceCount?: number })?.serviceCount || 0;
            return [`${numValue.toFixed(2)}억원 (${serviceCount}개 서비스)`, '매출'];
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
