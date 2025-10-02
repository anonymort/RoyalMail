'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

interface HistogramDatum {
  binStart: number;
  binEnd: number;
  count: number;
}

interface DeliveryHistogramProps {
  data: HistogramDatum[];
}

function formatMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60)
    .toString()
    .padStart(2, '0');
  const mins = (minutes % 60).toString().padStart(2, '0');
  return `${hours}:${mins}`;
}

export function DeliveryHistogram({ data }: DeliveryHistogramProps) {
  if (!data.length) {
    return <p className="text-sm text-cat-overlay1">Not enough reports for a histogram yet.</p>;
  }

  return (
    <div className="h-64 w-full bg-cat-surface0/60 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, left: -8, bottom: 16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#45475a" />
          <XAxis
            dataKey="binStart"
            tickFormatter={(value) => formatMinutes(value)}
            stroke="#bac2de"
            fontSize={12}
          />
          <YAxis allowDecimals={false} stroke="#bac2de" fontSize={12} width={32} />
          <Tooltip
            cursor={{ fill: 'rgba(148, 226, 213, 0.1)' }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const entry = payload[0]?.payload as HistogramDatum;
              return (
                <div className="rounded-md border border-cat-surface2 bg-cat-surface1 px-3 py-2 text-sm text-cat-text shadow">
                  <div className="font-medium text-cat-sky">{entry.count} report(s)</div>
                  <div>
                    {formatMinutes(entry.binStart)} – {formatMinutes(entry.binEnd)}
                  </div>
                </div>
              );
            }}
          />
          <Bar dataKey="count" fill="#89b4fa" radius={4} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
