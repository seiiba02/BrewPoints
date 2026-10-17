'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface RedemptionGrowthChartProps {
  data: {
    name: string;
    redemptions: number;
  }[];
}

export function RedemptionGrowthChart({ data }: RedemptionGrowthChartProps) {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-baseline justify-between border-b border-[#D4D0C5] pb-3">
        <div>
          <h2 className="text-xl font-bold text-[#111110]">
            Redemption Growth Trajectory
          </h2>
          <p className="text-xs text-[#4A4843]">
            Completed reward fulfillments over recent periods
          </p>
        </div>
        <span className="font-mono text-xs text-[#15803D] font-semibold">
          VERIFIED JTI
        </span>
      </div>

      <div className="h-[260px] w-full font-mono text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid
              stroke="#D4D0C5"
              strokeDasharray="2 2"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              stroke="#4A4843"
              tick={{ fill: '#4A4843', fontSize: 11 }}
            />
            <YAxis
              stroke="#4A4843"
              tick={{ fill: '#4A4843', fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#111110',
                borderColor: '#111110',
                color: '#F8F6F0',
                fontFamily: 'var(--font-geist-mono), monospace',
                fontSize: '12px',
              }}
            />
            <Line
              type="monotone"
              dataKey="redemptions"
              stroke="#15803D"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#15803D', stroke: '#111110', strokeWidth: 1.5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
