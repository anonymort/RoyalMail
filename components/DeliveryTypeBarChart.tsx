'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { DeliveryTypeBreakdownEntry } from '@/lib/types';

interface DeliveryTypeBarChartProps {
  data: DeliveryTypeBreakdownEntry[];
}

const LABELS: Record<DeliveryTypeBreakdownEntry['type'], string> = {
  letters: 'Letters',
  parcels: 'Parcels',
  both: 'Both'
};

export function DeliveryTypeBarChart({ data }: DeliveryTypeBarChartProps) {
  const total = data.reduce((sum, entry) => sum + entry.count, 0);

  if (total === 0) {
    return <p className="text-sm text-cat-overlay1">No delivery type breakdown yet.</p>;
  }

  const chartData = data.map((entry) => ({ ...entry, label: LABELS[entry.type] }));

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ top: 12, right: 16, left: 24, bottom: 12 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#45475a" />
          <XAxis type="number" stroke="#bac2de" fontSize={12} allowDecimals={false} />
          <YAxis type="category" dataKey="label" stroke="#bac2de" fontSize={12} width={72} />
          <Tooltip
            cursor={{ fill: 'rgba(148, 226, 213, 0.1)' }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const entry = payload[0]?.payload as typeof chartData[number];
              const percentage = total ? Math.round((entry.count / total) * 100) : 0;
              return (
                <div className="rounded-md border border-cat-surface2 bg-cat-surface1 px-3 py-2 text-sm text-cat-text shadow">
                  <div className="font-medium text-cat-sky">{entry.label}</div>
                  <div>
                    {entry.count} report(s) · {percentage}%
                  </div>
                </div>
              );
            }}
          />
          <Bar dataKey="count" fill="#f5c2e7" radius={4} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
