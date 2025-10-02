import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const today = new Date().toISOString().slice(0, 10);

let tempDir: string;
let submitReport: (typeof import('@/lib/queries'))['submitReport'];
let getPostcodeSummary: (typeof import('@/lib/queries'))['getPostcodeSummary'];
let fetchReports: (typeof import('@/lib/db'))['fetchReports'];

beforeEach(async () => {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'royalmail-tests-'));
  const sqlitePath = path.join(tempDir, `${randomUUID()}.sqlite`);
  process.env.DATABASE_URL = '';
  process.env.SQLITE_PATH = sqlitePath;
  vi.resetModules();
  ({ submitReport, getPostcodeSummary } = await import('@/lib/queries'));
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
    expect(
      await submitReport({
        postcode: 'not-a-postcode',
        deliveryDate: today,
        deliveryTime: '10:00',
        deliveryType: 'letters'
      })
    ).toBeNull();

    expect(
      await submitReport({
        postcode: 'SW1A 1AA',
        deliveryDate: '',
        deliveryTime: '10:00',
        deliveryType: 'letters'
      })
    ).toBeNull();

    expect(
      await submitReport({
        postcode: 'SW1A 1AA',
        deliveryDate: today,
        deliveryTime: '25:61',
        deliveryType: 'letters'
      })
    ).toBeNull();
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
