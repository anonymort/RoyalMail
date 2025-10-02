export type DeliveryType = 'letters' | 'parcels' | 'both';

export interface DeliveryReportRow {
  id: number;
  submitted_at: string;
  postcode: string;
  outward_sector: string;
  delivery_date: string;
  minutes_since_midnight: number;
  delivery_type: DeliveryType;
  note: string | null;
}

export interface AggregatedStats {
  label: string;
  count: number;
  medianMinutes: number | null;
  minMinutes: number | null;
  maxMinutes: number | null;
  histogram: Array<{ binStart: number; binEnd: number; count: number }>;
  confidence: 'high' | 'medium' | 'low';
}

export interface PostcodePayload {
  outwardSector: AggregatedStats | null;
  fullPostcode: AggregatedStats | null;
  lastUpdated: string | null;
}

export interface DailyReportPoint {
  date: string;
  count: number;
}

export interface DeliveryTypeBreakdownEntry {
  type: DeliveryType;
  count: number;
}

export interface GlobalStats {
  totals: {
    totalReports: number;
    uniquePostcodes: number;
    uniqueSectors: number;
    last24hReports: number;
    last7dReports: number;
  };
  lastSubmissionAt: string | null;
  medianMinutesLast30Days: number | null;
  dailyReports: DailyReportPoint[];
  deliveryTypeBreakdown: DeliveryTypeBreakdownEntry[];
  rollingWindowStart: string;
}
