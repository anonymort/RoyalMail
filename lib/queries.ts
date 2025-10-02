import {
  fetchDailyReportCounts,
  fetchDeliveryTypeCounts,
  fetchGlobalCounts,
  fetchLatestTimestamp,
  fetchMinutesSince,
  fetchReports,
  insertReport
} from '@/lib/db';
import { revalidateTag, unstable_cache } from 'next/cache';
import { parsePostcode, formatPostcodeForDisplay } from '@/lib/postcodes';
import { AggregatedStats, DeliveryType, GlobalStats, PostcodePayload } from '@/lib/types';

const DELIVERY_TYPES: DeliveryType[] = ['letters', 'parcels', 'both'];
const GLOBAL_STATS_TAG = 'global-stats';

function daysAgoIso(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

function computeMedian(values: number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return Math.round((sorted[mid - 1] + sorted[mid]) / 2);
  }
  return sorted[mid];
}

function buildHistogram(values: number[]): Array<{ binStart: number; binEnd: number; count: number }> {
  if (!values.length) return [];
  const bins = new Map<number, number>();
  for (const value of values) {
    const binStart = Math.floor(value / 15) * 15;
    const current = bins.get(binStart) ?? 0;
    bins.set(binStart, current + 1);
  }
  return Array.from(bins.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([binStart, count]) => ({ binStart, binEnd: binStart + 15, count }));
}

function determineConfidence(count: number): AggregatedStats['confidence'] {
  if (count >= 20) return 'high';
  if (count >= 7) return 'medium';
  return 'low';
}

function renderStats(label: string, minutes: number[]): AggregatedStats {
  const count = minutes.length;
  const minMinutes = minutes.length ? Math.min(...minutes) : null;
  const maxMinutes = minutes.length ? Math.max(...minutes) : null;
  return {
    label,
    count,
    minMinutes,
    maxMinutes,
    medianMinutes: computeMedian(minutes),
    histogram: buildHistogram(minutes),
    confidence: determineConfidence(count)
  };
}

export async function submitReport(input: {
  postcode: string;
  deliveryDate: string;
  deliveryTime: string;
  deliveryType: string;
  note?: string;
}): Promise<{ normalisedPostcode: string } | null> {
  const parsed = parsePostcode(input.postcode);
  if (!parsed) {
    return null;
  }

  const deliveryDate = input.deliveryDate;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(deliveryDate)) {
    return null;
  }

  const timeMatch = input.deliveryTime.match(/^(\d{2}):(\d{2})$/);
  if (!timeMatch) {
    return null;
  }
  const hours = Number(timeMatch[1]);
  const minutes = Number(timeMatch[2]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes) || hours > 23 || minutes > 59) {
    return null;
  }
  const minutesSinceMidnight = hours * 60 + minutes;

  const deliveryType = DELIVERY_TYPES.includes(input.deliveryType as DeliveryType)
    ? (input.deliveryType as DeliveryType)
    : 'letters';

  await insertReport({
    postcode: parsed.normalised,
    outwardSector: parsed.outwardSector,
    deliveryDate,
    minutesSinceMidnight,
    deliveryType,
    note: input.note?.slice(0, 500)
  });

  try {
    await revalidateTag(GLOBAL_STATS_TAG);
  } catch {
    // Cache invalidation is unavailable outside the Next.js runtime (e.g. Vitest).
  }

  return { normalisedPostcode: parsed.normalised };
}

export async function getPostcodeSummary(postcode: string): Promise<(PostcodePayload & { displayPostcode: string }) | null> {
  const parsed = parsePostcode(postcode);
  if (!parsed) {
    return null;
  }

  const sinceDate = daysAgoIso(30);
  const [sectorRows, postcodeRows] = await Promise.all([
    fetchReports({ outwardSector: parsed.outwardSector, sinceDate }),
    fetchReports({ outwardSector: parsed.outwardSector, postcode: parsed.normalised, sinceDate })
  ]);

  if (!sectorRows.length && !postcodeRows.length) {
    return null;
  }

  const sectorMinutes = sectorRows.map((row) => row.minutes_since_midnight);
  const postcodeMinutes = postcodeRows.map((row) => row.minutes_since_midnight);

  const summary: PostcodePayload & { displayPostcode: string } = {
    displayPostcode: formatPostcodeForDisplay(parsed.normalised),
    outwardSector: sectorRows.length ? renderStats(parsed.outwardSector, sectorMinutes) : null,
    fullPostcode: postcodeRows.length >= 7 ? renderStats(parsed.normalised, postcodeMinutes) : null,
    lastUpdated: await fetchLatestTimestamp(parsed.outwardSector)
  };

  return summary;
}

function buildContinuousDailySeries(
  startIso: string,
  days: number,
  raw: Array<{ date: string; count: number }>
) {
  const startDate = new Date(startIso);
  const output: Array<{ date: string; count: number }> = [];
  const lookup = new Map(raw.map((entry) => [entry.date, entry.count]));

  for (let offset = 0; offset < days; offset += 1) {
    const current = new Date(startDate);
    current.setDate(startDate.getDate() + offset);
    const iso = current.toISOString().slice(0, 10);
    output.push({ date: iso, count: lookup.get(iso) ?? 0 });
  }

  return output;
}

function buildEmptyGlobalStats(): GlobalStats {
  const rollingWindowStart = daysAgoIso(30);
  const dailyReports = buildContinuousDailySeries(daysAgoIso(13), 14, []);
  return {
    totals: {
      totalReports: 0,
      uniquePostcodes: 0,
      uniqueSectors: 0,
      last24hReports: 0,
      last7dReports: 0
    },
    lastSubmissionAt: null,
    medianMinutesLast30Days: null,
    dailyReports,
    deliveryTypeBreakdown: DELIVERY_TYPES.map((type) => ({ type, count: 0 })),
    rollingWindowStart
  };
}

const computeGlobalStats = async (): Promise<GlobalStats> => {
  try {
    const [counts, deliveryTypeRows] = await Promise.all([fetchGlobalCounts(), fetchDeliveryTypeCounts()]);

    const rollingWindowStart = daysAgoIso(30);
    const [dailyRows, minutesLast30Days] = await Promise.all([
      fetchDailyReportCounts(daysAgoIso(13)),
      fetchMinutesSince(rollingWindowStart)
    ]);

    const deliveryTypeOrder: DeliveryType[] = ['letters', 'parcels', 'both'];
    const deliveryTypeMap = new Map(deliveryTypeRows.map((row) => [row.delivery_type, Number(row.count)]));
    const deliveryTypeBreakdown = deliveryTypeOrder.map((type) => ({
      type,
      count: deliveryTypeMap.get(type) ?? 0
    }));

    const dailySeriesStart = daysAgoIso(13);
    const dailyReports = buildContinuousDailySeries(dailySeriesStart, 14, dailyRows);

    return {
      totals: {
        totalReports: counts.total_reports,
        uniquePostcodes: counts.unique_postcodes,
        uniqueSectors: counts.unique_sectors,
        last24hReports: counts.last_24h_reports,
        last7dReports: counts.last_7d_reports
      },
      lastSubmissionAt: counts.last_submission_at,
      medianMinutesLast30Days: computeMedian(minutesLast30Days),
      dailyReports,
      deliveryTypeBreakdown,
      rollingWindowStart
    };
  } catch (error) {
    console.warn('Falling back to empty global stats snapshot', error);
    return buildEmptyGlobalStats();
  }
};

const getGlobalStatsCached = unstable_cache(computeGlobalStats, [GLOBAL_STATS_TAG], {
  tags: [GLOBAL_STATS_TAG],
  revalidate: 300
});

export async function getGlobalStats(): Promise<GlobalStats> {
  try {
    return await getGlobalStatsCached();
  } catch {
    // Fallback when the incremental cache is unavailable (tests or non-Next runtimes).
    return computeGlobalStats();
  }
}
