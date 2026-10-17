'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface PointVelocityChartProps {
  data: {
    name: string;
    points: number;
  }[];
}

export function PointVelocityChart({ data }: PointVelocityChartProps) {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-baseline justify-between border-b border-[#D4D0C5] pb-3">
        <div>
          <h2 className="text-xl font-bold text-[#111110]">
            Daily Point Issuance Velocity
          </h2>
          <p className="text-xs text-[#4A4843]">
            Points credited from verified counter purchases ($1.00 USD = 1 pt)
          </p>
        </div>
        <span className="font-mono text-xs text-[#E02E24] font-semibold">
          SERIES: ISSUED PTS
        </span>
      </div>

      <div className="h-[280px] w-full font-mono text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="foundryCrimson" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#E02E24" stopOpacity={0.28} />
                <stop offset="95%" stopColor="#E02E24" stopOpacity={0.02} />
              </linearGradient>
            </defs>
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
            <Area
              type="monotone"
              dataKey="points"
              stroke="#E02E24"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#foundryCrimson)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
