import { TtlCache } from './cache.ts';

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

const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;
const cache = new TtlCache(FOUR_HOURS_MS);

function formatDateIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getDateWindow(daysBack = 30): { startDate: string; endDate: string } {
  const end = new Date();
  const start = new Date(end.getTime() - daysBack * 24 * 60 * 60 * 1000);
  return {
    startDate: formatDateIso(start),
    endDate: formatDateIso(end),
  };
}

interface RawDonkiSep {
  sepID?: string;
  eventTime?: string;
  instruments?: Array<{ displayName?: string }>;
  link?: string;
}

interface RawDonkiFlr {
  flrID?: string;
  beginTime?: string;
  peakTime?: string;
  endTime?: string;
  classType?: string;
  sourceLocation?: string;
  activeRegionNum?: number;
  instruments?: Array<{ displayName?: string }>;
  link?: string;
}

export async function fetchDonkiSpaceWeather(): Promise<DonkiResponsePayload> {
  const apiKey = process.env.NASA_API_KEY?.trim() || 'DEMO_KEY';
  const usingDemoKey = apiKey === 'DEMO_KEY';
  const { startDate, endDate } = getDateWindow(30);
  const cacheKey = `donki:${startDate}:${endDate}:${usingDemoKey ? 'demo' : 'key'}`;

  const cached = cache.get<DonkiResponsePayload>(cacheKey);
  if (cached) {
    return {
      ...cached.value,
      cached: true,
      retrievedAt: cached.cachedAt,
    };
  }

  const sepUrl = `https://api.nasa.gov/DONKI/SEP?startDate=${startDate}&endDate=${endDate}&api_key=${encodeURIComponent(apiKey)}`;
  const flrUrl = `https://api.nasa.gov/DONKI/FLR?startDate=${startDate}&endDate=${endDate}&api_key=${encodeURIComponent(apiKey)}`;

  let sepEvents: DonkiSepRecord[] = [];
  let flrEvents: DonkiFlrRecord[] = [];
  let sepError: string | undefined;
  let flrError: string | undefined;

  const [sepResult, flrResult] = await Promise.allSettled([
    fetch(sepUrl, { signal: AbortSignal.timeout(8000) }),
    fetch(flrUrl, { signal: AbortSignal.timeout(8000) }),
  ]);

  if (sepResult.status === 'fulfilled') {
    if (sepResult.value.ok) {
      const rawSep = (await sepResult.value.json()) as unknown;
      if (Array.isArray(rawSep)) {
        sepEvents = (rawSep as RawDonkiSep[])
          .filter((item) => item.sepID && item.eventTime)
          .slice(-8)
          .reverse()
          .map((item) => ({
            sepID: String(item.sepID),
            eventTime: String(item.eventTime),
            instruments: Array.isArray(item.instruments)
              ? item.instruments.map((i) => i.displayName || 'Unknown instrument')
              : [],
            link: item.link || 'https://ccmc.gsfc.nasa.gov/tools/DONKI/',
          }));
      }
    } else {
      sepError = `NASA DONKI SEP endpoint returned HTTP ${sepResult.value.status}`;
    }
  } else {
    sepError = sepResult.reason instanceof Error ? sepResult.reason.message : 'SEP request failed';
  }

  if (flrResult.status === 'fulfilled') {
    if (flrResult.value.ok) {
      const rawFlr = (await flrResult.value.json()) as unknown;
      if (Array.isArray(rawFlr)) {
        flrEvents = (rawFlr as RawDonkiFlr[])
          .filter((item) => item.flrID && item.beginTime && item.classType)
          .slice(-10)
          .reverse()
          .map((item) => ({
            flrID: String(item.flrID),
            beginTime: String(item.beginTime),
            peakTime: item.peakTime,
            endTime: item.endTime,
            classType: String(item.classType),
            sourceLocation: item.sourceLocation,
            activeRegionNum: item.activeRegionNum,
            instruments: Array.isArray(item.instruments)
              ? item.instruments.map((i) => i.displayName || 'Unknown instrument')
              : [],
            link: item.link || 'https://ccmc.gsfc.nasa.gov/tools/DONKI/',
          }));
      }
    } else {
      flrError = `NASA DONKI FLR endpoint returned HTTP ${flrResult.value.status}`;
    }
  } else {
    flrError = flrResult.reason instanceof Error ? flrResult.reason.message : 'FLR request failed';
  }

  let status: DonkiResponsePayload['status'] = 'ok';
  if (sepError && flrError) {
    status = 'error';
  } else if (sepEvents.length === 0 && flrEvents.length === 0) {
    status = sepError || flrError ? 'partial' : 'empty';
  }

  const payload: DonkiResponsePayload = {
    status,
    source: 'NASA DONKI API',
    classification: 'LIVE NASA OBSERVATION',
    dateRange: { startDate, endDate },
    cached: false,
    retrievedAt: new Date().toISOString(),
    usingDemoKey,
    sepEvents,
    flrEvents,
    sepError,
    flrError,
    errorMessage: sepError && flrError ? `${sepError}; ${flrError}` : undefined,
  };

  if (status !== 'error') {
    cache.set(cacheKey, payload);
  }
  return payload;
}

interface RadLabSplitResponse {
  columns?: string[];
  data?: unknown[][];
}

export async function fetchRadLabIssSample(): Promise<RadLabResponsePayload> {
  const cacheKey = 'radlab:iss:2022-04-01';
  const cached = cache.get<RadLabResponsePayload>(cacheKey);
  if (cached) {
    return {
      ...cached.value,
      cached: true,
      retrievedAt: cached.cachedAt,
    };
  }

  const radlabQueryUrl =
    'https://visualization.osdr.nasa.gov/radlab/api/?query=(timestamp>=2022-04-01T23:00)AND(timestamp<2022-04-01T23:15)AND(spacecraft=ISS)&fields+=timestamp,absorbed_dose_rate,instrument,spacecraft&format=json';

  try {
    const res = await fetch(radlabQueryUrl, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) {
      throw new Error(`RadLab API returned HTTP ${res.status}`);
    }

    const raw = (await res.json()) as unknown;
    const records: RadLabRecord[] = [];

    if (Array.isArray(raw)) {
      for (const row of raw.slice(0, 6)) {
        const rec = row as Record<string, unknown>;
        const rate = Number(rec.absorbed_dose_rate);
        if (rec.timestamp && Number.isFinite(rate)) {
          records.push({
            timestamp: String(rec.timestamp),
            instrument: String(rec.instrument || 'DosTel'),
            spacecraft: String(rec.spacecraft || 'ISS'),
            absorbedDoseRate: Number(rate.toFixed(2)),
            unit: 'µGy/h (absorbed_dose_rate)',
          });
        }
      }
    } else if (raw && typeof raw === 'object') {
      const split = raw as RadLabSplitResponse;
      if (Array.isArray(split.columns) && Array.isArray(split.data)) {
        const tsIdx = split.columns.indexOf('timestamp');
        const rateIdx = split.columns.indexOf('absorbed_dose_rate');
        const instIdx = split.columns.indexOf('instrument');
        const craftIdx = split.columns.indexOf('spacecraft');

        if (tsIdx !== -1 && rateIdx !== -1) {
          for (const row of split.data.slice(0, 6)) {
            const rate = Number(row[rateIdx]);
            const ts = row[tsIdx];
            if (ts && Number.isFinite(rate)) {
              records.push({
                timestamp: String(ts),
                instrument: instIdx !== -1 ? String(row[instIdx] || 'DosTel') : 'DosTel',
                spacecraft: craftIdx !== -1 ? String(row[craftIdx] || 'ISS') : 'ISS',
                absorbedDoseRate: Number(rate.toFixed(2)),
                unit: 'µGy/h (absorbed_dose_rate)',
              });
            }
          }
        }
      }
    }

    if (records.length === 0) {
      throw new Error('No RadLab telemetry rows parsed from API response');
    }

    const payload: RadLabResponsePayload = {
      status: 'ok',
      source: 'NASA OSDR RadLab API',
      classification: 'ARCHIVED NASA MEASUREMENT',
      cached: false,
      retrievedAt: new Date().toISOString(),
      records,
      note: 'Real International Space Station (Low Earth Orbit) dosimetry telemetry from NASA OSDR RadLab. Earth’s magnetic field still partially shields the ISS—Mars surface radiation behaves differently.',
      portalUrl: 'https://visualization.osdr.nasa.gov/radlab/gui/data-api/',
      apiUrl: 'https://visualization.osdr.nasa.gov/radlab/api',
    };

    cache.set(cacheKey, payload);
    return payload;
  } catch {
    return {
      status: 'unavailable',
      source: 'NASA OSDR RadLab API',
      classification: 'ARCHIVED NASA MEASUREMENT',
      cached: false,
      retrievedAt: new Date().toISOString(),
      records: [],
      note: 'Live connection to NASA OSDR RadLab telemetry was unavailable or timed out. Visit the official RadLab portal to inspect real ISS radiation dosimetry datasets (e.g., DosTel1/2, REM, Liulin-5). No telemetry was fabricated.',
      portalUrl: 'https://visualization.osdr.nasa.gov/radlab/gui/data-api/',
      apiUrl: 'https://visualization.osdr.nasa.gov/radlab/api',
    };
  }
}
