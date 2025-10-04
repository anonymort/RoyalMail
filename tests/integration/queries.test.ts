import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const today = new Date().toISOString().slice(0, 10);

let tempDir: string;
let submitReport: (typeof import('@/lib/queries'))['submitReport'];
let getPostcodeSummary: (typeof import('@/lib/queries'))['getPostcodeSummary'];
let getGlobalStats: (typeof import('@/lib/queries'))['getGlobalStats'];
let getNearbySectorSummaries: (typeof import('@/lib/queries'))['getNearbySectorSummaries'];
let fetchReports: (typeof import('@/lib/db'))['fetchReports'];
let ValidationError: typeof import('@/lib/queries')['ValidationError'];

beforeEach(async () => {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'royalmail-tests-'));
  const sqlitePath = path.join(tempDir, `${randomUUID()}.sqlite`);
  process.env.DATABASE_URL = '';
  process.env.SQLITE_PATH = sqlitePath;
  vi.resetModules();
  ({ submitReport, getPostcodeSummary, getGlobalStats, getNearbySectorSummaries, ValidationError } = await import('@/lib/queries'));
  ({ fetchReports } = await import('@/lib/db'));
});

afterEach(() => {
  if (tempDir && fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
  delete process.env.SQLITE_PATH;
});

describe('submitReport', () => {
  it('validates payloads and stores sanitised records', async () => {
    const longNote = 'a'.repeat(800);
    const result = await submitReport({
      postcode: 'm46 0tf',
      deliveryDate: today,
      deliveryTime: '09:15',
      deliveryType: 'unexpected-type',
      note: longNote
    });

    expect(result).toEqual({ normalisedPostcode: 'M46 0TF' });

    const rows = await fetchReports({
      outwardSector: 'M46 0',
      postcode: 'M46 0TF',
      sinceDate: today
    });

    expect(rows).toHaveLength(1);
    const stored = rows[0];
    expect(stored.minutes_since_midnight).toBe(9 * 60 + 15);
    expect(stored.delivery_type).toBe('letters');
    expect(stored.note).toHaveLength(500);
  });

  it('rejects invalid data', async () => {
    await expect(
      submitReport({
        postcode: 'not-a-postcode',
        deliveryDate: today,
        deliveryTime: '10:00',
        deliveryType: 'letters'
      })
    ).rejects.toBeInstanceOf(ValidationError);

    await expect(
      submitReport({
        postcode: 'SW1A 1AA',
        deliveryDate: '',
        deliveryTime: '10:00',
        deliveryType: 'letters'
      })
    ).rejects.toBeInstanceOf(ValidationError);

    await expect(
      submitReport({
        postcode: 'SW1A 1AA',
        deliveryDate: today,
        deliveryTime: '25:61',
        deliveryType: 'letters'
      })
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('rejects deliveries outside operational constraints', async () => {
    await expect(
      submitReport({
        postcode: 'SW1A 1AA',
        deliveryDate: today,
        deliveryTime: '05:15',
        deliveryType: 'letters'
      })
    ).rejects.toMatchObject({ message: expect.stringContaining('Delivery time should be between 06:00 and 20:30') });

    await expect(
      submitReport({
        postcode: 'SW1A 1AA',
        deliveryDate: today,
        deliveryTime: '21:45',
        deliveryType: 'letters'
      })
    ).rejects.toBeInstanceOf(ValidationError);

    const sunday = (() => {
      const date = new Date();
      const day = date.getDay();
      const diff = day === 0 ? 0 : day; // go back to the most recent Sunday
      date.setDate(date.getDate() - diff);
      return date.toISOString().slice(0, 10);
    })();

    await expect(
      submitReport({
        postcode: 'SW1A 1AA',
        deliveryDate: sunday,
        deliveryTime: '09:30',
        deliveryType: 'letters'
      })
    ).rejects.toMatchObject({ message: expect.stringContaining('does not deliver letters on Sundays') });

    await expect(
      submitReport({
        postcode: 'SW1A 1AA',
        deliveryDate: sunday,
        deliveryTime: '12:05',
        deliveryType: 'parcels'
      })
    ).resolves.toEqual({ normalisedPostcode: 'SW1A 1AA' });

    const tomorrow = (() => {
      const date = new Date();
      date.setDate(date.getDate() + 1);
      return date.toISOString().slice(0, 10);
    })();

    await expect(
      submitReport({
        postcode: 'SW1A 1AA',
        deliveryDate: tomorrow,
        deliveryTime: '09:30',
        deliveryType: 'letters'
      })
    ).rejects.toMatchObject({ message: expect.stringContaining('cannot be in the future') });
  });
});

describe('getPostcodeSummary', () => {
  it('aggregates sector statistics and unlocks full postcode view after seven reports', async () => {
    const postcode = 'QA3A 1AB';
    const outwardSector = 'QA3A 1';
    const times = [420, 445, 465, 480, 495, 510];

    for (const minutes of times) {
      const hours = Math.floor(minutes / 60)
        .toString()
        .padStart(2, '0');
      const mins = (minutes % 60).toString().padStart(2, '0');
      await submitReport({
        postcode,
        deliveryDate: today,
        deliveryTime: `${hours}:${mins}`,
        deliveryType: 'letters'
      });
    }

    let summary = await getPostcodeSummary(postcode);
    expect(summary).not.toBeNull();
    expect(summary?.outwardSector?.label).toBe(outwardSector);
    expect(summary?.outwardSector?.count).toBe(times.length);
    expect(summary?.fullPostcode).toBeNull();

    await submitReport({
      postcode,
      deliveryDate: today,
      deliveryTime: '11:00',
      deliveryType: 'parcels'
    });

    summary = await getPostcodeSummary(postcode);
    expect(summary).not.toBeNull();
    expect(summary?.displayPostcode).toBe('QA3A 1AB');
    expect(summary?.outwardSector?.count).toBe(times.length + 1);
    expect(summary?.outwardSector?.confidence).toBe('medium');
    expect(summary?.fullPostcode?.count).toBe(times.length + 1);
    expect(summary?.fullPostcode?.confidence).toBe('medium');
    expect(summary?.fullPostcode?.histogram.length).toBeGreaterThan(0);
    expect(summary?.lastUpdated).not.toBeNull();
  });

  it('returns null for unknown or invalid postcodes', async () => {
    expect(await getPostcodeSummary('invalid')).toBeNull();

    const postcode = 'AB1C 2DE';
    await submitReport({
      postcode,
      deliveryDate: today,
      deliveryTime: '08:00',
      deliveryType: 'letters'
    });

    expect(await getPostcodeSummary('ZZ9Z 9ZZ')).toBeNull();
  });
});

describe('getGlobalStats', () => {
  it('returns zeroed stats when no data exists', async () => {
    const stats = await getGlobalStats();

    expect(stats.totals.totalReports).toBe(0);
    expect(stats.totals.last7dReports).toBe(0);
    expect(stats.lastSubmissionAt).toBeNull();
    expect(stats.medianMinutesLast30Days).toBeNull();
    expect(stats.dailyReports).toHaveLength(14);
    expect(stats.dailyReports.every((point) => point.count === 0)).toBe(true);
    expect(stats.deliveryTypeBreakdown).toEqual([
      { type: 'letters', count: 0 },
      { type: 'parcels', count: 0 },
      { type: 'both', count: 0 }
    ]);
  });

  it('aggregates counts, coverage, and delivery type mix', async () => {
    const todayIso = new Date().toISOString().slice(0, 10);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayIso = yesterday.toISOString().slice(0, 10);
    const eightDaysAgo = new Date();
    eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);
    const eightDaysAgoIso = eightDaysAgo.toISOString().slice(0, 10);

    const submissions: Array<{ postcode: string; deliveryDate: string; deliveryTime: string; deliveryType: string }> = [
      { postcode: 'M46 0TF', deliveryDate: todayIso, deliveryTime: '09:00', deliveryType: 'letters' },
      { postcode: 'M46 0TG', deliveryDate: yesterdayIso, deliveryTime: '11:15', deliveryType: 'parcels' },
      { postcode: 'SW1A 1AA', deliveryDate: eightDaysAgoIso, deliveryTime: '08:45', deliveryType: 'both' }
    ];

    for (const submission of submissions) {
      await submitReport(submission);
    }

    const stats = await getGlobalStats();

    expect(stats.totals.totalReports).toBe(submissions.length);
    expect(stats.totals.uniquePostcodes).toBe(3);
    expect(stats.totals.uniqueSectors).toBe(2);
    expect(stats.totals.last7dReports).toBeGreaterThanOrEqual(2);
    expect(stats.totals.last24hReports).toBeGreaterThanOrEqual(1);
    expect(stats.lastSubmissionAt).not.toBeNull();
    expect(stats.medianMinutesLast30Days).toBe(9 * 60);

    const todayPoint = stats.dailyReports.find((point) => point.date === todayIso);
    const yesterdayPoint = stats.dailyReports.find((point) => point.date === yesterdayIso);
    const eightDaysAgoPoint = stats.dailyReports.find((point) => point.date === eightDaysAgoIso);

    expect(todayPoint?.count).toBe(1);
    expect(yesterdayPoint?.count).toBe(1);
    expect(eightDaysAgoPoint?.count).toBe(1);

    const breakdownMap = new Map(stats.deliveryTypeBreakdown.map((entry) => [entry.type, entry.count]));
    expect(breakdownMap.get('letters')).toBe(1);
    expect(breakdownMap.get('parcels')).toBe(1);
    expect(breakdownMap.get('both')).toBe(1);

    const rollingWindowExpected = (() => {
      const window = new Date();
      window.setDate(window.getDate() - 30);
      return window.toISOString().slice(0, 10);
    })();
    expect(stats.rollingWindowStart).toBe(rollingWindowExpected);
  });
});

describe('getNearbySectorSummaries', () => {
  it('returns active sector stats within the outward area', async () => {
    const todayIso = new Date().toISOString().slice(0, 10);

    const makeSubmission = async (postcode: string, deliveryTime: string) => {
      await submitReport({
        postcode,
        deliveryDate: todayIso,
        deliveryTime,
        deliveryType: 'letters'
      });
    };

    await Promise.all([
      makeSubmission('QA3A 1AB', '08:00'),
      makeSubmission('QA3A 1AB', '08:30'),
      makeSubmission('QA3A 1AB', '09:15'),
      makeSubmission('QA3A 2AB', '07:15'),
      makeSubmission('QA3A 2AB', '07:45'),
      makeSubmission('ZZ9Z 9ZZ', '10:00')
    ]);

    const summaries = await getNearbySectorSummaries('QA3A');
    expect(summaries.length).toBeGreaterThanOrEqual(2);
    expect(summaries[0]).toMatchObject({ label: 'QA3A 1', count: 3 });
    expect(summaries[1]).toMatchObject({ label: 'QA3A 2', count: 2 });
  });
});
