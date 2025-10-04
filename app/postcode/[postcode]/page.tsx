import Link from 'next/link';
import { DeliveryHistogram } from '@/components/DeliveryHistogram';
import { getNearbySectorSummaries, getPostcodeSummary } from '@/lib/queries';
import { formatPostcodeForDisplay, parsePostcode } from '@/lib/postcodes';
import { AggregatedStats } from '@/lib/types';

interface PostcodePageProps {
  params: Promise<{ postcode: string }>;
}

function formatMinutes(minutes: number | null) {
  if (minutes === null) return '–';
  const hours = Math.floor(minutes / 60)
    .toString()
    .padStart(2, '0');
  const mins = (minutes % 60).toString().padStart(2, '0');
  return `${hours}:${mins}`;
}

function confidenceLabel(confidence: AggregatedStats['confidence']) {
  switch (confidence) {
    case 'high':
      return { label: 'High confidence', tone: 'bg-cat-green/20 text-cat-green border border-cat-green/40' };
    case 'medium':
      return { label: 'Medium confidence', tone: 'bg-cat-peach/20 text-cat-peach border border-cat-peach/40' };
    default:
      return { label: 'Low confidence', tone: 'bg-cat-maroon/20 text-cat-maroon border border-cat-maroon/40' };
  }
}

function StatsPanel({ stats }: { stats: AggregatedStats }) {
  const confidence = confidenceLabel(stats.confidence);

  return (
    <section className="space-y-4 rounded-xl border border-cat-surface2 bg-cat-surface0 p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-cat-rosewater">{stats.label}</h2>
          <p className="text-sm text-cat-overlay1">{stats.count} reports in the last 30 days</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${confidence.tone}`}>
          {confidence.label}
        </span>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <div className="text-sm text-cat-overlay1">Median delivery</div>
          <div className="text-2xl font-semibold text-cat-sky">{formatMinutes(stats.medianMinutes)}</div>
        </div>
        <div>
          <div className="text-sm text-cat-overlay1">Earliest</div>
          <div className="text-lg text-cat-text">{formatMinutes(stats.minMinutes)}</div>
        </div>
        <div>
          <div className="text-sm text-cat-overlay1">Latest</div>
          <div className="text-lg text-cat-text">{formatMinutes(stats.maxMinutes)}</div>
        </div>
      </div>
      <DeliveryHistogram data={stats.histogram} />
    </section>
  );
}

export default async function PostcodePage({ params }: PostcodePageProps) {
  const { postcode: rawPostcode } = await params;
  const postcode = decodeURIComponent(rawPostcode);
  const parsed = parsePostcode(postcode);
  const displayPostcode = parsed?.normalised ?? formatPostcodeForDisplay(postcode);
  const outwardAreaLabel = parsed?.outward ?? 'this area';
  const summary = await getPostcodeSummary(postcode);
  let nearbySectors: AggregatedStats[] = [];

  if (!summary && parsed) {
    nearbySectors = await getNearbySectorSummaries(parsed.outward);
  }

  if (!summary) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-semibold text-cat-rosewater">No data for {displayPostcode || postcode}</h1>
        <p className="text-cat-overlay1">
          Nobody has reported a delivery for this postcode yet. You can be the first.
        </p>
        <Link href={`/report?postcode=${encodeURIComponent(displayPostcode || postcode)}`} className="w-fit">
          Report a delivery
        </Link>
        {nearbySectors.length > 0 ? (
          <div className="space-y-4 rounded-xl border border-cat-surface2 bg-cat-surface0 p-4">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-cat-rosewater">Active nearby sectors</h2>
              <p className="text-sm text-cat-overlay1">
                We do not have direct reports for {displayPostcode}, but these neighbouring sectors in {outwardAreaLabel}
                have recent submissions.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {nearbySectors.map((stats) => (
                <StatsPanel key={stats.label} stats={stats} />
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-cat-surface2 bg-cat-surface0 p-4 text-sm text-cat-overlay0">
            No nearby reports yet. Share your delivery to kickstart insights for this area.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-cat-rosewater">{summary.displayPostcode}</h1>
          <p className="text-sm text-cat-overlay1">
            Aggregated from reports in the last 30 days. Share how your delivery went to improve accuracy.
          </p>
        </div>
        <Link
          href={`/report?postcode=${encodeURIComponent(summary.displayPostcode)}`}
          className="inline-flex items-center gap-2 text-sm text-cat-sky"
        >
          Report a delivery
        </Link>
      </div>
      {summary.outwardSector && <StatsPanel stats={summary.outwardSector} />}
      {summary.fullPostcode && <StatsPanel stats={summary.fullPostcode} />}
      {!summary.fullPostcode && (
        <div className="rounded-xl border border-cat-surface2 bg-cat-surface0 p-4 text-sm text-cat-overlay0">
          Need at least 7 reports for full postcode breakdown. Encourage neighbours to submit their delivery times.
        </div>
      )}
      <div className="text-xs text-cat-overlay1">
        Last updated {summary.lastUpdated ? new Date(summary.lastUpdated).toLocaleString() : 'recently'}.
      </div>
    </div>
  );
}
