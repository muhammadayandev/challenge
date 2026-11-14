export interface DonkiSepRecord {
  sepID: string;
  eventTime: string;
  instruments: string[];
  link: string;
}

export interface DonkiFlrRecord {
  flrID: string;
  beginTime: string;
  peakTime?: string;
  endTime?: string;
  classType: string;
  sourceLocation?: string;
  activeRegionNum?: number;
  instruments: string[];
  link: string;
}

export interface DonkiResponsePayload {
  status: 'ok' | 'empty' | 'partial' | 'error';
  source: 'NASA DONKI API';
  classification: 'LIVE NASA OBSERVATION';
  dateRange: { startDate: string; endDate: string };
  cached: boolean;
  retrievedAt: string;
  usingDemoKey: boolean;
  sepEvents: DonkiSepRecord[];
  flrEvents: DonkiFlrRecord[];
  sepError?: string;
  flrError?: string;
  errorMessage?: string;
}

export interface RadLabRecord {
  timestamp: string;
  instrument: string;
  spacecraft: string;
  absorbedDoseRate: number;
  unit: string;
}

export interface RadLabResponsePayload {
  status: 'ok' | 'unavailable';
  source: 'NASA OSDR RadLab API';
  classification: 'ARCHIVED NASA MEASUREMENT';
  cached: boolean;
  retrievedAt: string;
  records: RadLabRecord[];
  note: string;
  portalUrl: string;
  apiUrl: string;
}

export async function getDonkiSpaceWeather(): Promise<DonkiResponsePayload> {
  const response = await fetch('/api/nasa/donki');
  if (!response.ok) {
    throw new Error(`Proxy error (${response.status})`);
  }
  return (await response.json()) as DonkiResponsePayload;
}

export async function getRadLabIssComparison(): Promise<RadLabResponsePayload> {
  const response = await fetch('/api/nasa/radlab');
  if (!response.ok) {
    throw new Error(`Proxy error (${response.status})`);
  }
  return (await response.json()) as RadLabResponsePayload;
}
