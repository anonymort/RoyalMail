import { DailyReportSparkline } from '@/components/DailyReportSparkline';
import { getGlobalStats } from '@/lib/queries';

function toLocale(value: number) {
  return value.toLocaleString();
}

export async function ContributionSnapshot() {
  const stats = await getGlobalStats();
  const latestValue = stats.dailyReports.at(-1)?.count ?? 0;

  return (
    <aside className="space-y-3 rounded-xl border border-cat-surface2 bg-cat-surface0 p-4">
      <div>
        <h2 className="text-lg font-semibold text-cat-rosewater">Why your report matters</h2>
        <p className="text-xs text-cat-overlay1">
          Every submission improves delivery predictions for your neighbours. Here is how the community is contributing
          right now.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-cat-surface2 bg-cat-surface1 p-3 text-center">
          <div className="text-xs uppercase tracking-wide text-cat-overlay1">Reports</div>
          <div className="text-xl font-semibold text-cat-sky">{toLocale(stats.totals.totalReports)}</div>
        </div>
        <div className="rounded-lg border border-cat-surface2 bg-cat-surface1 p-3 text-center">
          <div className="text-xs uppercase tracking-wide text-cat-overlay1">This week</div>
          <div className="text-xl font-semibold text-cat-text">+{toLocale(stats.totals.last7dReports)}</div>
        </div>
        <div className="rounded-lg border border-cat-surface2 bg-cat-surface1 p-3 text-center">
          <div className="text-xs uppercase tracking-wide text-cat-overlay1">Today</div>
          <div className="text-xl font-semibold text-cat-text">{toLocale(stats.totals.last24hReports)}</div>
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-cat-text">Daily contributions</h3>
        <p className="text-xs text-cat-overlay1">Latest day added {latestValue} report(s).</p>
        <DailyReportSparkline data={stats.dailyReports} />
      </div>
    </aside>
  );
}
