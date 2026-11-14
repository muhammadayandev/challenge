import React, { useState } from 'react';
import { Rocket, BookOpen, CloudLightning, Play, Compass } from 'lucide-react';
import { GameState, ScreenId } from '../game/types';

interface LandingScreenProps {
  existingGame: GameState | null;
  onStartNewMission: (customSeed?: string) => void;
  onResumeMission: () => void;
  onNavigate: (screen: ScreenId) => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({
  existingGame,
  onStartNewMission,
  onResumeMission,
  onNavigate,
}) => {
  const [seedInput, setSeedInput] = useState('');

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full">
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch bg-[#0e1526] border border-slate-800 rounded-2xl p-6 sm:p-10">
        {/* Left Hero Copy */}
        <div className="lg:col-span-6 flex flex-col justify-between gap-6">
          <div>
            <div className="text-xs font-bold tracking-wider uppercase text-cyan-300 mb-2">
              Mars Survival Strategy Game · Ages 7–12
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white text-balance">
              OUTPOST 14
            </h1>
            <p className="mt-1 text-lg sm:text-xl font-bold text-orange-400 tracking-wide">
              THE RED PLANET MISSION
            </p>
            <p className="mt-3 text-base sm:text-lg font-semibold text-cyan-100 text-balance">
              One Planet. Four Astronauts. Fourteen Sols. Can You Survive?
            </p>

            <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              Step into the boots of a Mars Base Commander. Balance solar electricity, water
              recycling, greenhouse harvests, regolith radiation shielding, and 3–22 minute Earth
              radio delays to guide your crew safely to Sol 14.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {existingGame && existingGame.status === 'active' && (
                <button
                  type="button"
                  onClick={onResumeMission}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm sm:text-base transition-colors cursor-pointer min-h-[44px]"
                >
                  <Play size={18} />
                  Resume Sol {existingGame.sol} ({existingGame.seed})
                </button>
              )}

              <button
                type="button"
                onClick={() => onStartNewMission(seedInput.trim() || undefined)}
                className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-bold text-sm sm:text-base transition-colors cursor-pointer min-h-[44px] ${
                  existingGame && existingGame.status === 'active'
                    ? 'bg-cyan-500/15 border border-cyan-400 text-cyan-100 hover:bg-cyan-500/25'
                    : 'bg-orange-600 hover:bg-orange-500 text-white'
                }`}
              >
                <Rocket size={18} />
                Start Mission
              </button>

              <button
                type="button"
                onClick={() => onNavigate('tutorial')}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#131d33] border border-slate-700 hover:border-slate-500 text-slate-100 font-bold text-sm sm:text-base transition-colors cursor-pointer min-h-[44px]"
              >
                <BookOpen size={18} />
                How to Play
              </button>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex flex-wrap items-center gap-3">
              <label htmlFor="seed-input" className="text-xs sm:text-sm text-slate-300">
                Optional Mission Seed:
              </label>
              <input
                id="seed-input"
                type="text"
                placeholder="e.g. JEZERO-402"
                value={seedInput}
                onChange={(e) => setSeedInput(e.target.value)}
                className="px-3 py-2 rounded-lg bg-[#070b17] border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 min-h-[40px]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-6 text-sm">
              <button
                type="button"
                onClick={() => onNavigate('weather')}
                className="inline-flex items-center gap-2 text-cyan-300 hover:text-cyan-200 font-semibold cursor-pointer"
              >
                <CloudLightning size={16} />
                Explore NASA Space Weather
              </button>
              <a
                href="#science-sources"
                className="inline-flex items-center gap-2 text-cyan-300 hover:text-cyan-200 font-semibold"
              >
                <Compass size={16} />
                NASA Science Sources
              </a>
            </div>
          </div>
        </div>

        {/* Right Mars Illustration */}
        <div className="lg:col-span-6 flex flex-col justify-between gap-4">
          <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-gradient-to-br from-orange-950 via-slate-900 to-slate-950 min-h-[260px] lg:h-full">
            <img
              src="/src/assets/images/mars_landing_vista_1794636847283.jpg"
              alt="Outpost 14 Mars research base in Jezero Crater with geodesic domes, greenhouse, solar panels, and Earth visible in the starry sky"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/45 to-transparent p-4">
              <div className="text-xs font-mono-tabular text-slate-200">
                4 Astronauts · 14 Martian Sols · Real NASA DONKI &amp; RadLab Open Data
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};
