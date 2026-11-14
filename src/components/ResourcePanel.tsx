import React from 'react';
import { Zap, HeartPulse, Shield } from 'lucide-react';
import { GameState } from '../game/types';
import { GAME_BALANCE } from '../game/balance';
import { DataTag } from './DataTag';

interface ResourcePanelProps {
  state: GameState;
}

export const ResourcePanel: React.FC<ResourcePanelProps> = ({ state }) => {
  const stormMult = state.dustStormActive ? GAME_BALANCE.dailyUpkeep.dustStormSolarMultiplier : 1;
  const estSolar = Math.round(
    GAME_BALANCE.dailyUpkeep.baseSolarGeneration * (state.solarPanelEfficiency / 100) * stormMult
  );
  const netPower = estSolar - GAME_BALANCE.dailyUpkeep.basePowerDrain;

  const getStatusText = (val: number, lowThreshold: number) => {
    if (val <= lowThreshold) return { label: 'Critical', cls: 'text-rose-400', bar: 'bg-rose-500' };
    if (val <= 55) return { label: 'Caution', cls: 'text-amber-300', bar: 'bg-amber-400' };
    return { label: 'Nominal', cls: 'text-teal-300', bar: 'bg-cyan-400' };
  };

  const pStatus = getStatusText(state.power, 25);
  const lStatus = getStatusText(state.lifeSupport, 30);
  const sStatus = getStatusText(state.shelterProtection, 35);

  return (
    <section
      aria-label="Outpost Resources"
      className="bg-[#0e1526] border border-slate-800 rounded-xl p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <span className="text-xs font-medium text-slate-400">
          Outpost Telemetry · Simplified 0–100 Game Units (not NASA engineering measurements)
        </span>
        <DataTag type="GAMEPLAY VALUE" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* POWER */}
        <div className="bg-[#131d33] border border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="inline-flex items-center gap-2 text-sm font-bold tracking-wide text-slate-100">
              <Zap size={18} className="text-amber-400" />
              POWER
            </span>
            <span className="font-mono-tabular text-base font-bold text-white">
              {state.power} / 100
            </span>
          </div>
          <div className="h-3 w-full rounded bg-slate-950 overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-300 ${pStatus.bar}`}
              style={{ width: `${state.power}%` }}
            />
          </div>
          <div className="mt-2.5 flex items-center justify-between gap-2 text-xs text-slate-300 font-mono-tabular">
            <span className={`font-semibold ${pStatus.cls}`}>{pStatus.label}</span>
            <span>
              Panels {state.solarPanelEfficiency}% · Net {netPower >= 0 ? `+${netPower}` : netPower}/sol
            </span>
          </div>
        </div>

        {/* LIFE SUPPORT */}
        <div className="bg-[#131d33] border border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="inline-flex items-center gap-2 text-sm font-bold tracking-wide text-slate-100">
              <HeartPulse size={18} className="text-cyan-400" />
              LIFE SUPPORT
            </span>
            <span className="font-mono-tabular text-base font-bold text-white">
              {state.lifeSupport} / 100
            </span>
          </div>
          <div className="h-3 w-full rounded bg-slate-950 overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-300 ${lStatus.bar}`}
              style={{ width: `${state.lifeSupport}%` }}
            />
          </div>
          <div className="mt-2.5 flex items-center justify-between gap-2 text-xs text-slate-300 font-mono-tabular">
            <span className={`font-semibold ${lStatus.cls}`}>{lStatus.label}</span>
            <span>
              {state.greenhouseQueue.length} crop batch · -{GAME_BALANCE.dailyUpkeep.baseLifeSupportDrain}/sol
            </span>
          </div>
        </div>

        {/* SHELTER PROTECTION */}
        <div className="bg-[#131d33] border border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="inline-flex items-center gap-2 text-sm font-bold tracking-wide text-slate-100">
              <Shield size={18} className="text-teal-400" />
              SHELTER PROTECTION
            </span>
            <span className="font-mono-tabular text-base font-bold text-white">
              {state.shelterProtection} / 100
            </span>
          </div>
          <div className="h-3 w-full rounded bg-slate-950 overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-300 ${sStatus.bar}`}
              style={{ width: `${state.shelterProtection}%` }}
            />
          </div>
          <div className="mt-2.5 flex items-center justify-between gap-2 text-xs text-slate-300 font-mono-tabular">
            <span className={`font-semibold ${sStatus.cls}`}>{sStatus.label}</span>
            <span>Science: {state.sciencePoints} pts</span>
          </div>
        </div>
      </div>
    </section>
  );
};
