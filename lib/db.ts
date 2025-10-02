import fs from 'node:fs';
import path from 'node:path';
import BetterSqlite3 from 'better-sqlite3';
import { Pool } from 'pg';
import { DeliveryReportRow, DeliveryType } from '@/lib/types';

export interface GlobalCountsRow {
  total_reports: number;
  unique_postcodes: number;
  unique_sectors: number;
  last_24h_reports: number;
  last_7d_reports: number;
  last_submission_at: string | null;
}

export interface DeliveryTypeCountRow {
  delivery_type: DeliveryType;
  count: number;
}

export interface DailyReportsRow {
  date: string;
  count: number;
}

type SqliteInstance = BetterSqlite3.Database;

const DATABASE_URL = process.env.DATABASE_URL;
const SQLITE_PATH = process.env.SQLITE_PATH ?? path.join(process.cwd(), 'data', 'delivery.sqlite');

const isPostgres = Boolean(DATABASE_URL && DATABASE_URL.startsWith('postgres'));

let sqliteInstance: SqliteInstance | null = null;
let pgPool: Pool | null = null;

function ensureSqlite(): SqliteInstance {
  if (sqliteInstance) {
    return sqliteInstance;
  }

  fs.mkdirSync(path.dirname(SQLITE_PATH), { recursive: true });
  const db = new BetterSqlite3(SQLITE_PATH);
  db.pragma('journal_mode = WAL');
  db.exec(`
    CREATE TABLE IF NOT EXISTS delivery_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      submitted_at TEXT DEFAULT (datetime('now')),
      postcode TEXT NOT NULL,
      outward_sector TEXT NOT NULL,
      delivery_date TEXT NOT NULL,
      minutes_since_midnight INTEGER NOT NULL,
      delivery_type TEXT NOT NULL CHECK (delivery_type IN ('letters','parcels','both')),
      note TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_delivery_reports_postcode ON delivery_reports(postcode);
    CREATE INDEX IF NOT EXISTS idx_delivery_reports_sector ON delivery_reports(outward_sector);
    CREATE INDEX IF NOT EXISTS idx_delivery_reports_date ON delivery_reports(delivery_date);
  `);

  sqliteInstance = db;
  return db;
}

async function ensurePostgres(): Promise<Pool> {
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL is required for Postgres mode');
  }
  if (pgPool) {
    return pgPool;
  }
  pgPool = new Pool({ connectionString: DATABASE_URL, max: 5 });
  await pgPool.query(`
    CREATE TABLE IF NOT EXISTS delivery_reports (
      id SERIAL PRIMARY KEY,
      submitted_at TIMESTAMPTZ DEFAULT NOW(),
      postcode TEXT NOT NULL,
      outward_sector TEXT NOT NULL,
      delivery_date DATE NOT NULL,
      minutes_since_midnight INTEGER NOT NULL,
      delivery_type TEXT NOT NULL CHECK (delivery_type IN ('letters','parcels','both')),
      note TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_delivery_reports_postcode ON delivery_reports(postcode);
    CREATE INDEX IF NOT EXISTS idx_delivery_reports_sector ON delivery_reports(outward_sector);
    CREATE INDEX IF NOT EXISTS idx_delivery_reports_date ON delivery_reports(delivery_date);
  `);
  return pgPool;
}

export interface InsertReportInput {
  postcode: string;
  outwardSector: string;
  deliveryDate: string; // ISO date (YYYY-MM-DD)
  minutesSinceMidnight: number;
  deliveryType: DeliveryType;
  note?: string | null;
}

export async function insertReport(input: InsertReportInput): Promise<void> {
  if (isPostgres) {
    const pool = await ensurePostgres();
    await pool.query(
      `
        INSERT INTO delivery_reports (postcode, outward_sector, delivery_date, minutes_since_midnight, delivery_type, note)
        VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [
        input.postcode,
        input.outwardSector,
        input.deliveryDate,
        input.minutesSinceMidnight,
        input.deliveryType,
        input.note ?? null
      ]
    );
    return;
  }

  const db = ensureSqlite();
  const statement = db.prepare(
    `INSERT INTO delivery_reports (postcode, outward_sector, delivery_date, minutes_since_midnight, delivery_type, note)
     VALUES (?, ?, ?, ?, ?, ?)`
  );
  statement.run(
    input.postcode,
    input.outwardSector,
    input.deliveryDate,
    input.minutesSinceMidnight,
    input.deliveryType,
    input.note ?? null
  );
}

export interface QueryFilters {
  outwardSector: string;
  postcode?: string;
  sinceDate: string; // ISO date
}

export async function fetchReports(filters: QueryFilters): Promise<DeliveryReportRow[]> {
  if (isPostgres) {
    const pool = await ensurePostgres();
    const params: Array<string | number> = [filters.outwardSector, filters.sinceDate];
    let whereClause = 'outward_sector = $1 AND delivery_date >= $2';

    if (filters.postcode) {
      params.push(filters.postcode);
      whereClause += ` AND postcode = $${params.length}`;
    }

    const result = await pool.query<DeliveryReportRow>(
      `SELECT id, submitted_at, postcode, outward_sector, delivery_date, minutes_since_midnight, delivery_type, note
       FROM delivery_reports
       WHERE ${whereClause}
       ORDER BY delivery_date DESC, minutes_since_midnight DESC`,
      params
    );
    return result.rows;
  }

  const db = ensureSqlite();
  const params: Array<string | number> = [filters.outwardSector, filters.sinceDate];
  let whereClause = 'outward_sector = ? AND delivery_date >= ?';

  if (filters.postcode) {
    params.push(filters.postcode);
    whereClause += ' AND postcode = ?';
  }

  const statement = db.prepare(
    `SELECT id, submitted_at, postcode, outward_sector, delivery_date, minutes_since_midnight, delivery_type, note
     FROM delivery_reports
     WHERE ${whereClause}
     ORDER BY delivery_date DESC, minutes_since_midnight DESC`
  );
  return statement.all(...params) as DeliveryReportRow[];
}

export async function fetchLatestTimestamp(outwardSector: string): Promise<string | null> {
  if (isPostgres) {
    const pool = await ensurePostgres();
    const result = await pool.query<{ submitted_at: string }>(
      `SELECT submitted_at FROM delivery_reports WHERE outward_sector = $1 ORDER BY submitted_at DESC LIMIT 1`,
      [outwardSector]
    );
    return result.rows[0]?.submitted_at ?? null;
  }

  const db = ensureSqlite();
  const statement = db.prepare(
    `SELECT submitted_at FROM delivery_reports WHERE outward_sector = ? ORDER BY submitted_at DESC LIMIT 1`
  );
  const row = statement.get(outwardSector) as { submitted_at: string } | undefined;
  return row?.submitted_at ?? null;
}

export async function fetchGlobalCounts(): Promise<GlobalCountsRow> {
  if (isPostgres) {
    const pool = await ensurePostgres();
    const result = await pool.query<GlobalCountsRow>(
      `
        SELECT
          COUNT(*)::int AS total_reports,
          COUNT(DISTINCT postcode)::int AS unique_postcodes,
          COUNT(DISTINCT outward_sector)::int AS unique_sectors,
          COUNT(*) FILTER (WHERE submitted_at >= NOW() - INTERVAL '1 day')::int AS last_24h_reports,
          COUNT(*) FILTER (WHERE submitted_at >= NOW() - INTERVAL '7 days')::int AS last_7d_reports,
          MAX(submitted_at) AS last_submission_at
        FROM delivery_reports
      `
    );
    const row = result.rows[0];
    return {
      total_reports: Number(row?.total_reports ?? 0),
      unique_postcodes: Number(row?.unique_postcodes ?? 0),
      unique_sectors: Number(row?.unique_sectors ?? 0),
      last_24h_reports: Number(row?.last_24h_reports ?? 0),
      last_7d_reports: Number(row?.last_7d_reports ?? 0),
      last_submission_at: row?.last_submission_at ?? null
    };
  }

  const db = ensureSqlite();
  const statement = db.prepare(
    `
      SELECT
        COUNT(*) AS total_reports,
        COUNT(DISTINCT postcode) AS unique_postcodes,
        COUNT(DISTINCT outward_sector) AS unique_sectors,
        SUM(CASE WHEN submitted_at >= datetime('now', '-1 day') THEN 1 ELSE 0 END) AS last_24h_reports,
        SUM(CASE WHEN submitted_at >= datetime('now', '-7 day') THEN 1 ELSE 0 END) AS last_7d_reports,
        MAX(submitted_at) AS last_submission_at
      FROM delivery_reports
    `
  );
  const row = statement.get() as Record<string, number | string | null> | undefined;
  return {
    total_reports: Number(row?.total_reports ?? 0),
    unique_postcodes: Number(row?.unique_postcodes ?? 0),
    unique_sectors: Number(row?.unique_sectors ?? 0),
    last_24h_reports: Number(row?.last_24h_reports ?? 0),
    last_7d_reports: Number(row?.last_7d_reports ?? 0),
    last_submission_at: (row?.last_submission_at as string | null) ?? null
  };
}

export async function fetchDeliveryTypeCounts(): Promise<DeliveryTypeCountRow[]> {
  if (isPostgres) {
    const pool = await ensurePostgres();
    const result = await pool.query<DeliveryTypeCountRow>(
      `SELECT delivery_type, COUNT(*)::int AS count FROM delivery_reports GROUP BY delivery_type`
    );
    return result.rows.map((row) => ({
      delivery_type: row.delivery_type,
      count: Number(row.count)
    }));
  }

  const db = ensureSqlite();
  const statement = db.prepare(
    `SELECT delivery_type, COUNT(*) AS count FROM delivery_reports GROUP BY delivery_type`
  );
  return statement.all() as DeliveryTypeCountRow[];
}

export async function fetchDailyReportCounts(sinceDate: string): Promise<DailyReportsRow[]> {
  if (isPostgres) {
    const pool = await ensurePostgres();
    const result = await pool.query<DailyReportsRow>(
      `
        SELECT delivery_date::text AS date, COUNT(*)::int AS count
        FROM delivery_reports
        WHERE delivery_date >= $1
        GROUP BY delivery_date
        ORDER BY delivery_date ASC
      `,
      [sinceDate]
    );
    return result.rows.map((row) => ({
      date: row.date,
      count: Number(row.count)
    }));
  }

  const db = ensureSqlite();
  const statement = db.prepare(
    `
      SELECT delivery_date AS date, COUNT(*) AS count
      FROM delivery_reports
      WHERE delivery_date >= ?
      GROUP BY delivery_date
      ORDER BY delivery_date ASC
    `
  );
  return statement.all(sinceDate) as DailyReportsRow[];
}

export async function fetchMinutesSince(sinceDate: string): Promise<number[]> {
  if (isPostgres) {
    const pool = await ensurePostgres();
    const result = await pool.query<{ minutes_since_midnight: number }>(
      `
        SELECT minutes_since_midnight
        FROM delivery_reports
        WHERE delivery_date >= $1
        ORDER BY minutes_since_midnight ASC
      `,
      [sinceDate]
    );
    return result.rows.map((row) => Number(row.minutes_since_midnight));
  }

  const db = ensureSqlite();
  const statement = db.prepare(
    `
      SELECT minutes_since_midnight
      FROM delivery_reports
      WHERE delivery_date >= ?
      ORDER BY minutes_since_midnight ASC
    `
  );
  const rows = statement.all(sinceDate) as Array<{ minutes_since_midnight: number }>;
  return rows.map((row) => Number(row.minutes_since_midnight));
}
