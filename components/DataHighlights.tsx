import Link from 'next/link';
import { DailyReportSparkline } from '@/components/DailyReportSparkline';
import { DeliveryTypeBarChart } from '@/components/DeliveryTypeBarChart';
import { getGlobalStats } from '@/lib/queries';

function formatMinutesToTime(minutes: number | null) {
  if (minutes === null) return '—';
  const hours = Math.floor(minutes / 60)
    .toString()
    .padStart(2, '0');
  const mins = (minutes % 60).toString().padStart(2, '0');
  return `${hours}:${mins}`;
}

function formatDate(dateIso: string | null) {
  if (!dateIso) return 'Awaiting first submission';
  const parsed = new Date(dateIso);
  if (Number.isNaN(parsed.getTime())) {
    return 'Awaiting first submission';
  }
  return parsed.toLocaleString();
}

export async function DataHighlights() {
  const stats = await getGlobalStats();
  const { totals } = stats;

  const windowStartLabel = new Date(`${stats.rollingWindowStart}T00:00:00Z`).toLocaleDateString();

  return (
    <section className="space-y-6 rounded-xl border border-cat-surface2 bg-cat-surface0 p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-cat-rosewater">Community data pulse</h2>
          <p className="text-sm text-cat-overlay1">
            Crowdsourced reports collected since {windowStartLabel}. We keep a rolling 30-day window to stay fresh and
            resilient against outliers.
          </p>
        </div>
        <Link href="/report" className="inline-flex items-center gap-2 rounded-full border border-cat-sky px-3 py-1 text-sm text-cat-sky">
          Contribute your delivery
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-cat-surface2 bg-cat-surface1 p-4">
          <div className="text-sm text-cat-overlay1">Reports collected</div>
          <div className="text-2xl font-semibold text-cat-sky">{totals.totalReports.toLocaleString()}</div>
          <div className="text-xs text-cat-overlay1">+{totals.last7dReports.toLocaleString()} last 7 days</div>
        </div>
        <div className="rounded-lg border border-cat-surface2 bg-cat-surface1 p-4">
          <div className="text-sm text-cat-overlay1">Coverage</div>
          <div className="text-2xl font-semibold text-cat-text">{totals.uniqueSectors.toLocaleString()} sectors</div>
          <div className="text-xs text-cat-overlay1">{totals.uniquePostcodes.toLocaleString()} postcodes represented</div>
        </div>
        <div className="rounded-lg border border-cat-surface2 bg-cat-surface1 p-4">
          <div className="text-sm text-cat-overlay1">Latest submission</div>
          <div className="text-lg font-semibold text-cat-text">{formatDate(stats.lastSubmissionAt)}</div>
          <div className="text-xs text-cat-overlay1">{totals.last24hReports} in the last 24 hours</div>
        </div>
        <div className="rounded-lg border border-cat-surface2 bg-cat-surface1 p-4">
          <div className="text-sm text-cat-overlay1">Median arrival (30 days)</div>
          <div className="text-2xl font-semibold text-cat-sky">{formatMinutesToTime(stats.medianMinutesLast30Days)}</div>
          <div className="text-xs text-cat-overlay1">Calculated from submissions with delivery times</div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3 rounded-lg border border-cat-surface2 bg-cat-surface1 p-4">
          <div>
            <h3 className="text-lg font-semibold text-cat-text">Daily submission trend</h3>
            <p className="text-xs text-cat-overlay1">Rolling 14-day view. Peaks highlight when neighbours report deliveries.</p>
          </div>
          <DailyReportSparkline data={stats.dailyReports} />
        </div>
        <div className="space-y-3 rounded-lg border border-cat-surface2 bg-cat-surface1 p-4">
          <div>
            <h3 className="text-lg font-semibold text-cat-text">Delivery type mix</h3>
            <p className="text-xs text-cat-overlay1">Breakdown of reported deliveries by category.</p>
          </div>
          <DeliveryTypeBarChart data={stats.deliveryTypeBreakdown} />
        </div>
      </div>
    </section>
  );
}
