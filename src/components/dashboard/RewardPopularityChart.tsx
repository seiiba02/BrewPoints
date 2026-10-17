'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface RewardPopularityChartProps {
  data: {
    name: string;
    redemptions: number;
  }[];
}

export function RewardPopularityChart({ data }: RewardPopularityChartProps) {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-baseline justify-between border-b border-[#D4D0C5] pb-3">
        <div>
          <h2 className="text-xl font-bold text-[#111110]">
            Reward Demand by Item
          </h2>
          <p className="text-xs text-[#4A4843]">
            Confirmed single-use QR redemptions across catalog items
          </p>
        </div>
        <span className="font-mono text-xs text-[#111110] font-semibold">
          RANKED VOLUME
        </span>
      </div>

      <div className="h-[280px] w-full font-mono text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
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
            <Bar dataKey="redemptions" fill="#111110" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
