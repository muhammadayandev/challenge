import React, { useCallback, useEffect, useState } from 'react';
import { RefreshCw, ExternalLink, AlertTriangle, Sun, Activity, ShieldAlert } from 'lucide-react';
import {
  DonkiResponsePayload,
  RadLabResponsePayload,
  getDonkiSpaceWeather,
  getRadLabIssComparison,
} from '../services/nasaService';
import { GameState } from '../game/types';
import { formatNasaTimestamp } from '../utils/format';
import { DataTag } from './DataTag';

interface SpaceWeatherScreenProps {
  gameState: GameState | null;
}

export const SpaceWeatherScreen: React.FC<SpaceWeatherScreenProps> = ({ gameState }) => {
  const [donki, setDonki] = useState<DonkiResponsePayload | null>(null);
  const [radlab, setRadlab] = useState<RadLabResponsePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSpaceWeather = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [donkiRes, radlabRes] = await Promise.all([
        getDonkiSpaceWeather(),
        getRadLabIssComparison(),
      ]);
      setDonki(donkiRes);
      setRadlab(radlabRes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reach NASA proxy server');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSpaceWeather();
  }, [loadSpaceWeather]);

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-7 w-full space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            NASA Space Weather &amp; Radiation Monitor
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Real NASA open observations shown separately from simulated Outpost 14 gameplay events.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadSpaceWeather()}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-500/15 border border-cyan-400 text-cyan-100 hover:bg-cyan-500/25 disabled:opacity-50 font-semibold text-sm cursor-pointer min-h-[42px]"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh Observations
        </button>
      </div>

      {/* Scientific Accuracy Boundary */}
      <div className="flex items-start gap-3 rounded-xl bg-amber-950/30 border border-amber-500/40 p-4 text-sm text-amber-100">
        <ShieldAlert size={20} className="shrink-0 mt-0.5 text-amber-400" />
        <div>
          <strong>Important Science Rule:</strong> A NASA DONKI observation does{' '}
          <strong>not</strong> automatically measure the radiation dose at a Martian habitat, and
          ISS dosimetry telemetry is measured in Low Earth Orbit—not on Mars. Real records below
          inspire the story while your game events remain simulated.
        </div>
      </div>

      {/* Clearly Separated Simulated Game Weather */}
      {gameState && (
        <section className="bg-[#0e1526] border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-white">
              Current Outpost 14 Weather Status (Sol {gameState.sol})
            </h2>
            <DataTag type="SIMULATED MISSION EVENT" />
          </div>
          <p className="text-sm text-slate-300">
            {gameState.activeEvent
              ? `${gameState.activeEvent.title}: ${gameState.activeEvent.summary}`
              : gameState.dustStormActive
              ? 'Simulated Martian dust storm conditions are active around Jezero Crater.'
              : 'No simulated storm alert active right now—check Mission Control for Sol operations.'}
          </p>
        </section>
      )}

      {loading && (
        <div className="bg-[#0e1526] border border-slate-800 rounded-xl p-6 flex items-center gap-3 text-sm text-slate-200">
          <RefreshCw size={20} className="animate-spin text-cyan-400" />
          <span>Querying NASA DONKI &amp; OSDR RadLab server cache...</span>
        </div>
      )}

      {error && (
        <div className="bg-amber-950/35 border border-amber-500/40 rounded-xl p-5 flex items-start gap-3 text-sm text-amber-100">
          <AlertTriangle size={20} className="shrink-0 mt-0.5 text-amber-400" />
          <div>
            <strong>NASA Proxy Unavailable:</strong> {error}. Outpost 14 gameplay continues
            normally using simulated events—no fake NASA records were invented.
          </div>
        </div>
      )}

      {/* Primary Integration: NASA DONKI */}
      {!loading && donki && (
        <section className="bg-[#0e1526] border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="inline-flex items-center gap-2 text-lg font-bold text-white">
                <Sun size={20} className="text-amber-400" />
                NASA DONKI Solar Observations
              </h2>
              <p className="text-xs text-slate-400 font-mono-tabular mt-1">
                Window: {donki.dateRange.startDate} to {donki.dateRange.endDate} ·{' '}
                {donki.cached ? 'Served from 4h server cache' : 'Fresh server fetch'} · Retrieved{' '}
                {formatNasaTimestamp(donki.retrievedAt)}
              </p>
            </div>
            <DataTag type="LIVE NASA OBSERVATION" />
          </div>

          {donki.status === 'error' && (
            <div className="rounded-lg bg-amber-950/35 border border-amber-500/40 p-4 text-sm text-amber-100">
              DONKI API Error: {donki.errorMessage}. Check server <code>NASA_API_KEY</code> or try
              again later. No simulated data was substituted.
            </div>
          )}

          {donki.status === 'empty' && (
            <div className="rounded-lg bg-[#131d33] border border-slate-700 p-4 text-sm text-slate-200">
              No matching SEP or Solar Flare records were retrieved in this window from NASA DONKI.
              Outpost 14 uses its separately labeled simulated events for gameplay.
            </div>
          )}

          {(donki.status === 'ok' || donki.status === 'partial') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* SEP Events */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                  Solar Energetic Particle (SEP) Events ({donki.sepEvents.length})
                </h3>
                {donki.sepError ? (
                  <p className="text-sm text-amber-300">{donki.sepError}</p>
                ) : donki.sepEvents.length === 0 ? (
                  <p className="text-sm text-slate-400">
                    Connected to NASA DONKI SEP: 0 SEP events recorded in this 30-day window.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {donki.sepEvents.map((sep) => (
                      <div
                        key={sep.sepID}
                        className="bg-[#131d33] border border-slate-800 rounded-lg p-3.5 space-y-1"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                          <strong className="text-white font-mono-tabular">{sep.sepID}</strong>
                          <span className="text-xs text-slate-300 font-mono-tabular">
                            {formatNasaTimestamp(sep.eventTime)}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400">
                          Instruments: {sep.instruments.join(', ') || 'Reported by CCMC DONKI'}
                        </div>
                        <a
                          href={sep.link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-300 hover:underline pt-1"
                        >
                          Official NASA DONKI Record <ExternalLink size={12} />
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* FLR Events */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                  Solar Flare (FLR) Events ({donki.flrEvents.length})
                </h3>
                {donki.flrError ? (
                  <p className="text-sm text-amber-300">
                    {donki.flrError}. No flare records were fabricated.
                  </p>
                ) : donki.flrEvents.length === 0 ? (
                  <p className="text-sm text-slate-400">
                    Connected to NASA DONKI FLR: 0 flare events recorded in this 30-day window.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {donki.flrEvents.map((flr) => (
                      <div
                        key={flr.flrID}
                        className="bg-[#131d33] border border-slate-800 rounded-lg p-3.5 space-y-1"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                          <strong className="text-orange-300 font-mono-tabular">
                            Class {flr.classType}
                          </strong>
                          <span className="text-xs text-slate-300 font-mono-tabular">
                            {formatNasaTimestamp(flr.beginTime)}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 font-mono-tabular">
                          ID: {flr.flrID} · Location: {flr.sourceLocation || 'Solar Disk'}
                        </div>
                        <a
                          href={flr.link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-300 hover:underline pt-1"
                        >
                          Official NASA DONKI Record <ExternalLink size={12} />
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-slate-800 text-sm">
            <a
              href="https://ccmc.gsfc.nasa.gov/tools/DONKI/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 font-semibold text-cyan-300 hover:underline"
            >
              Open NASA CCMC DONKI Space Weather Database <ExternalLink size={14} />
            </a>
          </div>
        </section>
      )}

      {/* Secondary Integration: NASA OSDR RadLab */}
      {!loading && radlab && (
        <section className="bg-[#0e1526] border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="inline-flex items-center gap-2 text-lg font-bold text-white">
                <Activity size={20} className="text-cyan-400" />
                Educational Comparison: ISS Radiation Dosimetry
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl">{radlab.note}</p>
            </div>
            <DataTag type="ARCHIVED NASA MEASUREMENT" />
          </div>

          {radlab.status === 'ok' && radlab.records.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {radlab.records.map((rec, idx) => (
                <div
                  key={idx}
                  className="bg-[#131d33] border border-slate-800 rounded-lg p-3.5 space-y-1"
                >
                  <div className="text-xs font-bold text-slate-200">
                    {rec.spacecraft} · {rec.instrument}
                  </div>
                  <div className="text-xs text-slate-400 font-mono-tabular">
                    {formatNasaTimestamp(rec.timestamp)}
                  </div>
                  <div className="pt-1 text-xl font-bold text-cyan-300 font-mono-tabular">
                    {rec.absorbedDoseRate}{' '}
                    <span className="text-xs font-normal text-slate-400">{rec.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg bg-[#131d33] border border-slate-700 p-4 text-sm text-slate-200">
              <strong>NASA OSDR RadLab Resource:</strong> Live ISS dosimetry telemetry was
              unreachable right now. Explore authentic ISS, Lunar, and Deep Space radiation datasets
              directly at the{' '}
              <a
                href={radlab.portalUrl}
                target="_blank"
                rel="noreferrer"
                className="text-cyan-300 font-semibold hover:underline inline-flex items-center gap-1"
              >
                NASA RadLab Data Portal <ExternalLink size={13} />
              </a>
              .
            </div>
          )}
        </section>
      )}
    </main>
  );
};
