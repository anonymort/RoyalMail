'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import type { DailyReportPoint } from '@/lib/types';

interface DailyReportSparklineProps {
  data: DailyReportPoint[];
}

function formatDayLabel(date: string) {
  const parsed = new Date(`${date}T00:00:00Z`);
  return parsed.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

export function DailyReportSparkline({ data }: DailyReportSparklineProps) {
  const hasData = data.some((point) => point.count > 0);

  if (!hasData) {
    return <p className="text-sm text-cat-overlay1">No submissions in the last two weeks yet.</p>;
  }

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 12, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id="dailyReportsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#89b4fa" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#89b4fa" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#45475a" />
          <XAxis
            dataKey="date"
            stroke="#bac2de"
            fontSize={12}
            tickFormatter={formatDayLabel}
            interval={data.length > 7 ? 1 : 0}
          />
          <YAxis stroke="#bac2de" fontSize={12} allowDecimals={false} width={32} />
          <Tooltip
            cursor={{ stroke: '#89b4fa', strokeWidth: 2 }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const entry = payload[0]?.payload as DailyReportPoint;
              return (
                <div className="rounded-md border border-cat-surface2 bg-cat-surface1 px-3 py-2 text-sm text-cat-text shadow">
                  <div className="font-medium text-cat-sky">{entry.count} report(s)</div>
                  <div>{new Date(`${entry.date}T00:00:00Z`).toLocaleDateString()}</div>
                </div>
              );
            }}
          />
          <Area type="monotone" dataKey="count" stroke="#89b4fa" fill="url(#dailyReportsGradient)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
