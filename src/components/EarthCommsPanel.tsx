import React from 'react';
import { Radio, Clock, WifiOff, CheckCircle2 } from 'lucide-react';
import { EarthCommsState } from '../game/types';

interface EarthCommsPanelProps {
  comms: EarthCommsState;
  currentSol: number;
  transmitting: boolean;
  transmitProgress: number;
}

export const EarthCommsPanel: React.FC<EarthCommsPanelProps> = ({
  comms,
  currentSol,
  transmitting,
  transmitProgress,
}) => {
  return (
    <section className="bg-[#0e1526] border border-slate-800 rounded-xl p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="inline-flex items-center gap-2 text-base font-bold text-white">
          <Radio size={18} className="text-cyan-400" />
          Earth Comms Delay
        </h3>
        <span className="inline-flex items-center gap-1 text-xs font-mono-tabular font-semibold text-cyan-300">
          <Clock size={13} />
          {comms.oneWayMinutes} min one-way
        </span>
      </div>

      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
        Real Mars–Earth one-way radio travel time is currently{' '}
        <strong className="text-white">{comms.oneWayMinutes} minutes</strong> (3–22 min depending on
        orbital distance). On-screen transmissions are accelerated to a few seconds for gameplay.
      </p>

      {transmitting && (
        <div className="bg-[#131d33] border border-cyan-500/40 rounded-lg p-3 space-y-2">
          <div className="text-xs font-semibold text-cyan-300 font-mono-tabular">
            Beaming telemetry across deep space... {Math.round(transmitProgress)}%
          </div>
          <div className="h-2.5 w-full rounded bg-slate-950 overflow-hidden">
            <div
              className="h-full bg-cyan-400 transition-all duration-75"
              style={{ width: `${transmitProgress}%` }}
            />
          </div>
        </div>
      )}

      {comms.blackoutActive ? (
        <div className="flex items-start gap-2 rounded-lg bg-amber-950/40 border border-amber-500/40 p-3 text-xs sm:text-sm text-amber-200">
          <WifiOff size={16} className="shrink-0 mt-0.5 text-amber-400" />
          <span>Radio interference blackout active! Make decisions without Earth this sol.</span>
        </div>
      ) : comms.pendingReplyOnSol !== null ? (
        <div className="flex items-start gap-2 rounded-lg bg-cyan-950/40 border border-cyan-500/40 p-3 text-xs sm:text-sm text-cyan-100">
          <Radio size={16} className="shrink-0 mt-0.5 text-cyan-300" />
          <span>
            Queued Request: <strong>{comms.pendingRequestTopic}</strong> · Reply arrives Sol{' '}
            {comms.pendingReplyOnSol} (in {Math.max(1, comms.pendingReplyOnSol - currentSol)} sol).
          </span>
        </div>
      ) : (
        <div className="flex items-start gap-2 rounded-lg bg-emerald-950/35 border border-emerald-500/35 p-3 text-xs sm:text-sm text-emerald-200">
          <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-400" />
          <span>Deep Space Network antenna ready to transmit.</span>
        </div>
      )}

      {comms.lastReplyMessage && (
        <div className="pt-2 border-t border-slate-800 text-xs text-slate-300">
          <strong className="text-white">Latest Earth Reply:</strong> {comms.lastReplyMessage}
        </div>
      )}
    </section>
  );
};
