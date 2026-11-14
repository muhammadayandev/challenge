import React from 'react';
import { GameState } from '../game/types';
import { DataTag } from './DataTag';

interface MarsHabitatSceneProps {
  state: GameState;
  transmitting: boolean;
}

export const MarsHabitatScene: React.FC<MarsHabitatSceneProps> = ({ state, transmitting }) => {
  const hasCrops = state.greenhouseQueue.length > 0;
  const highShielding = state.shelterProtection >= 60;
  const mediumShielding = state.shelterProtection >= 45;
  const dustyPanels = state.solarPanelEfficiency < 75;
  const solarAlert = state.activeEvent?.category === 'solar_particle';
  const expeditionDoneToday = state.currentSolActions.some(
    (a) => a.actionId === 'scientific_expedition'
  );

  return (
    <div
      className={`rounded-xl overflow-hidden border bg-[#0e1526] ${
        solarAlert ? 'border-orange-500' : 'border-slate-800'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-[#090e1a] border-b border-slate-800">
        <span className="text-xs font-semibold tracking-wide text-slate-300">
          Jezero Crater Base · Outpost 14 Habitat View
        </span>
        <DataTag type={state.activeEvent ? 'SIMULATED MISSION EVENT' : 'GAMEPLAY VALUE'} />
      </div>

      {/* Layered 2.5D Mars backdrop image + reactive SVG Outpost modules */}
      <div className="relative w-full aspect-[16/7] min-h-[210px] bg-gradient-to-b from-[#0b1329] via-[#3c1e26] to-[#7c301c] overflow-hidden">
        <img
          src="/src/assets/images/mars_crater_horizon_1794636847817.jpg"
          alt="Jezero Crater Martian horizon backdrop"
          referrerPolicy="no-referrer"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            state.dustStormActive ? 'opacity-55 brightness-75 sepia-[.35]' : 'opacity-90'
          }`}
        />

        {/* Atmospheric Scrim for crisp SVG habitat legibility */}
        <div
          className={`absolute inset-0 transition-colors duration-500 ${
            state.dustStormActive
              ? 'bg-gradient-to-t from-orange-950/75 via-orange-800/35 to-amber-950/55'
              : solarAlert
              ? 'bg-gradient-to-t from-slate-950/45 via-orange-900/20 to-amber-500/15'
              : 'bg-gradient-to-t from-slate-950/45 via-transparent to-slate-950/25'
          }`}
        />

        <svg
          viewBox="0 0 760 280"
          className="relative z-10 w-full h-full"
          role="img"
          aria-label="Interactive Outpost 14 Mars habitat showing solar panels, shielded living dome, hydroponic greenhouse, and deep-space communications dish"
        >
          <defs>
            <linearGradient id="domeGlass" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#0891b2" stopOpacity="0.22" />
            </linearGradient>
          </defs>

          {/* Pale Blue Earth indicator in upper sky */}
          {!state.dustStormActive && (
            <g>
              <circle cx="635" cy="40" r="4.5" fill="#38bdf8" />
              <circle cx="635" cy="40" r="8" fill="#38bdf8" opacity="0.2" />
              <text x="647" y="44" fill="#e0f2fe" fontSize="11" fontWeight="600" fontFamily="sans-serif">
                Earth ({state.earthComms.oneWayMinutes}m light-time)
              </text>
            </g>
          )}

          {/* Solar Particle Alert Flare */}
          {solarAlert && (
            <g>
              <circle cx="100" cy="54" r="24" fill="#fde047" opacity="0.85" />
              <circle
                cx="100"
                cy="54"
                r="38"
                fill="none"
                stroke="#f97316"
                strokeWidth="2.5"
                strokeDasharray="6 4"
              />
            </g>
          )}

          {/* Ground Contact Shadows */}
          <ellipse cx="108" cy="216" rx="56" ry="8" fill="#1c0d07" opacity="0.55" />
          <ellipse cx="270" cy="224" rx="76" ry="11" fill="#1c0d07" opacity="0.6" />
          <ellipse cx="485" cy="224" rx="68" ry="10" fill="#1c0d07" opacity="0.6" />
          <ellipse cx="614" cy="222" rx="32" ry="7" fill="#1c0d07" opacity="0.55" />

          {/* Solar Panel Array (Left) */}
          <g transform="translate(54, 152)">
            <rect x="44" y="34" width="10" height="28" fill="#64748b" />
            <polygon points="0,12 96,4 108,36 12,44" fill="#1e3a8a" stroke="#93c5fd" strokeWidth="2" />
            <line x1="25" y1="10" x2="35" y2="42" stroke="#60a5fa" strokeWidth="1" />
            <line x1="50" y1="8" x2="60" y2="40" stroke="#60a5fa" strokeWidth="1" />
            <line x1="75" y1="6" x2="85" y2="38" stroke="#60a5fa" strokeWidth="1" />
            {dustyPanels && (
              <polygon points="2,14 94,6 104,34 14,42" fill="#c25e31" opacity="0.62" />
            )}
          </g>

          {/* Pressurized Tunnel */}
          <rect
            x="315"
            y="188"
            width="126"
            height="24"
            rx="4"
            fill="#cbd5e1"
            stroke="#334155"
            strokeWidth="2"
          />

          {/* Main Habitat Core + Reactive Regolith Shielding Armor */}
          <g transform="translate(205, 122)">
            {(mediumShielding || highShielding) && (
              <path
                d="M -12 100 C -12 20, 142 20, 142 100 Z"
                fill={highShielding ? '#7c2d12' : '#9a3412'}
                opacity="0.78"
                stroke="#fb923c"
                strokeWidth="2"
                strokeDasharray={highShielding ? 'none' : '5 4'}
              />
            )}
            <path d="M 4 100 C 4 32, 126 32, 126 100 Z" fill="#f1f5f9" stroke="#334155" strokeWidth="3" />
            <rect x="20" y="64" width="24" height="15" rx="3" fill="#22d3ee" opacity="0.9" />
            <rect x="86" y="64" width="24" height="15" rx="3" fill="#22d3ee" opacity="0.9" />
            <rect x="55" y="72" width="20" height="28" rx="2" fill="#475569" />
          </g>

          {/* Hydroponic Greenhouse Bio-Dome */}
          <g transform="translate(425, 136)">
            <path
              d="M 4 86 C 4 22, 118 22, 118 86 Z"
              fill="url(#domeGlass)"
              stroke="#67e8f9"
              strokeWidth="2.5"
            />
            <rect x="8" y="78" width="106" height="10" rx="2" fill="#475569" />
            <g fill={hasCrops ? '#4ade80' : '#166534'} opacity={hasCrops ? 1 : 0.5}>
              <circle cx="32" cy="71" r={hasCrops ? 10 : 4} />
              <circle cx="61" cy="68" r={hasCrops ? 12 : 5} />
              <circle cx="90" cy="71" r={hasCrops ? 10 : 4} />
            </g>
          </g>

          {/* Communications Dish & Animated Signal Waves */}
          <g transform="translate(592, 148)">
            <rect x="20" y="34" width="8" height="38" fill="#94a3b8" />
            <path d="M 4 24 Q 24 44 44 12" fill="none" stroke="#f8fafc" strokeWidth="5" strokeLinecap="round" />
            <line x1="24" y1="24" x2="36" y2="8" stroke="#38bdf8" strokeWidth="2" />
            {(transmitting || state.earthComms.pendingReplyOnSol !== null) && (
              <g className="animate-signal-sweep" stroke="#22d3ee" fill="none" strokeWidth="2.5">
                <path d="M 44 6 Q 55 -4 62 4" />
                <path d="M 52 -3 Q 68 -16 78 -4" opacity="0.7" />
              </g>
            )}
          </g>

          {/* EVA Astronaut visible during Scientific Expedition */}
          {expeditionDoneToday && (
            <g transform="translate(664, 200)">
              <circle cx="12" cy="8" r="6" fill="#f8fafc" stroke="#f97316" strokeWidth="2" />
              <rect x="7" y="14" width="10" height="15" rx="3" fill="#f8fafc" />
              <line x1="9" y1="29" x2="8" y2="38" stroke="#cbd5e1" strokeWidth="3" />
              <line x1="15" y1="29" x2="16" y2="38" stroke="#cbd5e1" strokeWidth="3" />
            </g>
          )}
        </svg>
      </div>

      {/* Unboxed Metadata Status Footer Strip */}
      <div className="px-4 py-2.5 bg-[#090e1a] border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300 font-mono-tabular">
        <span>
          Solar Arrays: <strong className="text-white">{dustyPanels ? 'Dusty' : 'Clean'} ({state.solarPanelEfficiency}%)</strong>
        </span>
        <span>
          Bio-Dome: <strong className="text-white">{hasCrops ? `${state.greenhouseQueue.length} batch growing` : 'Idle'}</strong>
        </span>
        <span>
          Shielding: <strong className="text-white">{highShielding ? 'Heavy Regolith' : mediumShielding ? 'Reinforced' : 'Basic Hull'}</strong>
        </span>
        <span>
          Conditions: <strong className={solarAlert ? 'text-orange-400' : state.dustStormActive ? 'text-amber-300' : 'text-teal-300'}>
            {state.dustStormActive ? 'Dust Storm' : solarAlert ? 'Solar Particle Alert' : 'Clear'}
          </strong>
        </span>
      </div>
    </div>
  );
};
