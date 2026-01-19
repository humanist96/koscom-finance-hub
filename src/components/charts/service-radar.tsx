'use client';

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';

interface RadarData {
  service: string;
  serviceCode: string;
  domestic: number;
  foreign: number;
}

interface ServiceRadarProps {
  data: RadarData[];
}

export function ServiceRadar({ data }: ServiceRadarProps) {
  // 서비스명을 짧게 변환
  const chartData = data.map(item => ({
    ...item,
    service: item.service.length > 12 ? item.service.substring(0, 10) + '...' : item.service,
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
        <PolarGrid />
        <PolarAngleAxis
          dataKey="service"
          tick={{ fontSize: 10, fill: '#374151' }}
        />
        <PolarRadiusAxis
          angle={30}
          domain={[0, 'auto']}
          tick={{ fontSize: 9 }}
          tickFormatter={(value) => `${value}억`}
        />
        <Radar
          name="국내 증권사"
          dataKey="domestic"
          stroke="#3B82F6"
          fill="#3B82F6"
          fillOpacity={0.3}
        />
        <Radar
          name="외자계 증권사"
          dataKey="foreign"
          stroke="#10B981"
          fill="#10B981"
          fillOpacity={0.3}
        />
        <Legend />
        <Tooltip
          formatter={(value, name) => {
            const numValue = typeof value === 'number' ? value : 0;
            return [`${numValue.toFixed(2)}억원`, String(name)];
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
