import React from 'react';
import { GameState, ScreenId } from '../game/types';

interface HeaderNavProps {
  screen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  gameState: GameState | null;
  onNewMission: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  screen,
  onNavigate,
  gameState,
  onNewMission,
}) => {
  const navItemClass = (active: boolean) =>
    `whitespace-nowrap shrink-0 py-2 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
      active
        ? 'text-cyan-300 border-cyan-400'
        : 'text-slate-300 border-transparent hover:text-white hover:border-slate-500'
    }`;

  return (
    <header className="sticky top-0 z-30 bg-[#070b17]/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Single-line Brand Wordmark */}
        <button
          type="button"
          onClick={() => onNavigate('landing')}
          className="text-lg sm:text-xl font-extrabold tracking-tight text-white whitespace-nowrap shrink-0 cursor-pointer hover:text-orange-300 transition-colors"
        >
          OUTPOST 14
        </button>

        {/* Zone 2: Concise single-line navigation links */}
        <nav className="flex items-center gap-4 sm:gap-7 overflow-x-auto" aria-label="Main Navigation">
          {gameState && (
            <button
              type="button"
              onClick={() => onNavigate('mission')}
              className={navItemClass(screen === 'mission')}
            >
              Mission Control
            </button>
          )}
          <button
            type="button"
            onClick={() => onNavigate('weather')}
            className={navItemClass(screen === 'weather')}
          >
            NASA Weather
          </button>
          <button
            type="button"
            onClick={() => onNavigate('history')}
            className={navItemClass(screen === 'history')}
          >
            History
          </button>
          <button
            type="button"
            onClick={() => onNavigate('tutorial')}
            className={navItemClass(screen === 'tutorial')}
          >
            How to Play
          </button>
          {gameState?.report && (
            <button
              type="button"
              onClick={() => onNavigate('results')}
              className={navItemClass(screen === 'results')}
            >
              Report
            </button>
          )}
        </nav>

        {/* Zone 3: Single primary CTA */}
        <div className="shrink-0">
          <button
            type="button"
            onClick={onNewMission}
            className="whitespace-nowrap shrink-0 px-4 py-2 text-sm font-bold rounded-lg bg-orange-600 hover:bg-orange-500 text-white transition-colors cursor-pointer min-h-[40px]"
          >
            New Mission
          </button>
        </div>
      </div>
    </header>
  );
};
