import React, { useEffect, useState } from 'react';
import {
  Play,
  ArrowRight,
  Lightbulb,
  CheckCircle,
  AlertOctagon,
  Award,
  Sprout,
  Volume2,
  VolumeX,
  History,
} from 'lucide-react';
import { ACTION_DEFINITIONS, canPerformAction } from '../game/actions';
import { GAME_BALANCE } from '../game/balance';
import { ActionId, GameState, ScreenId } from '../game/types';
import { formatDelta } from '../utils/format';
import { playGameTone } from '../utils/sound';
import { ResourcePanel } from './ResourcePanel';
import { MarsHabitatScene } from './MarsHabitatScene';
import { ActionCards } from './ActionCards';
import { EventModal } from './EventModal';
import { CrewStatusPanel } from './CrewStatusPanel';
import { EarthCommsPanel } from './EarthCommsPanel';
import { DataTag } from './DataTag';

interface MissionControlScreenProps {
  state: GameState;
  soundMuted: boolean;
  onToggleSound: () => void;
  onStartOperations: () => void;
  onPerformAction: (actionId: ActionId) => void;
  onTriggerEvent: () => void;
  onResolveEventChoice: (choiceId: string) => void;
  onAdvanceSol: () => void;
  onNavigate: (screen: ScreenId) => void;
}

export const MissionControlScreen: React.FC<MissionControlScreenProps> = ({
  state,
  soundMuted,
  onToggleSound,
  onStartOperations,
  onPerformAction,
  onTriggerEvent,
  onResolveEventChoice,
  onAdvanceSol,
  onNavigate,
}) => {
  const [transmitting, setTransmitting] = useState(false);
  const [transmitProgress, setTransmitProgress] = useState(0);

  useEffect(() => {
    if (!transmitting) return;
    setTransmitProgress(0);
    const start = Date.now();
    const duration = 2600;
    const timer = window.setInterval(() => {
      const pct = Math.min(100, ((Date.now() - start) / duration) * 100);
      setTransmitProgress(pct);
      if (pct >= 100) {
        window.clearInterval(timer);
        window.setTimeout(() => setTransmitting(false), 350);
      }
    }, 60);
    return () => window.clearInterval(timer);
  }, [transmitting]);

  const handleActionClick = (actionId: ActionId) => {
    if (actionId === 'contact_earth') {
      setTransmitting(true);
      playGameTone('transmit', soundMuted);
    } else {
      playGameTone('action', soundMuted);
    }
    onPerformAction(actionId);
  };

  const handleTriggerEventClick = () => {
    playGameTone('alert', soundMuted);
    onTriggerEvent();
  };

  const handleEventChoiceClick = (choiceId: string) => {
    onResolveEventChoice(choiceId);
  };

  useEffect(() => {
    if (state.phase === 'consequence') {
      if (state.status === 'won') {
        playGameTone('victory', soundMuted);
      } else if (state.lastHarvestSummary) {
        playGameTone('harvest', soundMuted);
      }
    }
  }, [state.phase, state.status, state.lastHarvestSummary, soundMuted]);

  const anyActionAffordable = ACTION_DEFINITIONS.some(
    (def) => canPerformAction(state, def.id).allowed
  );
  const progressPct = Math.min(
    100,
    Math.round((state.sol / GAME_BALANCE.mission.totalSols) * 100)
  );

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-5 w-full space-y-5">
      {/* Mission Progress & Settings Ribbon */}
      <div className="bg-[#0e1526] border border-slate-800 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="font-mono-tabular text-sm font-bold text-white">
            Sol {state.sol} of {GAME_BALANCE.mission.totalSols}
          </div>
          <div className="w-36 sm:w-48 h-2.5 rounded bg-slate-950 overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-cyan-400 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-xs font-mono-tabular text-cyan-300">Seed: {state.seed}</span>
        </div>

        <div className="flex items-center gap-3">
          {state.history.length > 0 && (
            <button
              type="button"
              onClick={() => onNavigate('history')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#131d33] border border-slate-700 hover:border-cyan-400 text-xs font-semibold text-slate-200 cursor-pointer min-h-[38px]"
            >
              <History size={14} />
              Past Sols ({state.history.length})
            </button>
          )}
          <button
            type="button"
            onClick={onToggleSound}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#131d33] border border-slate-700 hover:border-cyan-400 text-xs font-semibold text-slate-200 cursor-pointer min-h-[38px]"
            aria-label={soundMuted ? 'Unmute sound effects' : 'Mute sound effects'}
          >
            {soundMuted ? <VolumeX size={14} className="text-slate-400" /> : <Volume2 size={14} className="text-cyan-300" />}
            <span>{soundMuted ? 'Sound Off' : 'Sound On'}</span>
          </button>
        </div>
      </div>

      {/* Resource Gauges */}
      <ResourcePanel state={state} />

      {/* Main 2-Column Mission Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-8 space-y-5">
          <MarsHabitatScene state={state} transmitting={transmitting} />

          {/* Daily Decision Cycle Stage */}
          <section className="bg-[#0e1526] border border-slate-800 rounded-xl p-5 space-y-4">
            {/* Step Indicator */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold border-b border-slate-800 pb-3">
              {[
                { id: 'briefing', label: '1. Briefing' },
                { id: 'actions', label: `2. Actions (${state.actionPoints} left)` },
                { id: 'event', label: '3. Event' },
                { id: 'consequence', label: '4. Summary' },
              ].map((step) => (
                <span
                  key={step.id}
                  className={`px-2.5 py-1 rounded ${
                    state.phase === step.id
                      ? 'bg-orange-600 text-white font-bold'
                      : 'text-slate-400 bg-[#131d33]'
                  }`}
                >
                  {step.label}
                </span>
              ))}
            </div>

            {state.phase === 'briefing' && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white">Sol {state.sol} Morning Briefing</h2>
                <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                  {state.currentBriefing}
                </p>

                {state.greenhouseQueue.length > 0 && (
                  <div className="flex items-start gap-2 rounded-lg bg-emerald-950/35 border border-emerald-500/35 p-3 text-xs sm:text-sm text-emerald-200">
                    <Sprout size={16} className="shrink-0 mt-0.5 text-emerald-400" />
                    <span>
                      Growing in Bio-Dome:{' '}
                      {state.greenhouseQueue
                        .map((c) => `${c.cropName} (Ready Sol ${c.readyOnSol})`)
                        .join(' · ')}
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={onStartOperations}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm sm:text-base transition-colors cursor-pointer min-h-[44px]"
                >
                  <Play size={18} />
                  Begin Sol {state.sol} Operations
                </button>
              </div>
            )}

            {state.phase === 'actions' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Choose Your Actions ({state.actionPoints} Remaining)
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400">
                      Every engineering choice has a cost, a benefit, and a consequence.
                    </p>
                  </div>

                  {(state.actionPoints === 0 || !anyActionAffordable) && (
                    <button
                      type="button"
                      disabled={transmitting}
                      onClick={handleTriggerEventClick}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold text-sm transition-colors cursor-pointer min-h-[44px]"
                    >
                      Continue to Sol {state.sol} Event
                      <ArrowRight size={16} />
                    </button>
                  )}
                </div>

                {state.currentSolActions.length > 0 && (
                  <div className="space-y-2">
                    {state.currentSolActions.map((rec, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 rounded-lg bg-cyan-950/35 border border-cyan-500/35 p-3 text-xs sm:text-sm text-cyan-100"
                      >
                        <CheckCircle size={15} className="shrink-0 mt-0.5 text-cyan-300" />
                        <span>
                          <strong>{rec.label}:</strong> {rec.summary}{' '}
                          {rec.deltas.power ? `(Power ${formatDelta(rec.deltas.power)}) ` : ''}
                          {rec.deltas.lifeSupport
                            ? `(Life ${formatDelta(rec.deltas.lifeSupport)}) `
                            : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <ActionCards
                  state={state}
                  onSelectAction={handleActionClick}
                  disabledGlobal={transmitting}
                />

                {state.actionPoints > 0 && !anyActionAffordable && (
                  <div className="rounded-lg bg-amber-950/40 border border-amber-500/40 p-3 text-xs sm:text-sm text-amber-200">
                    No actions are currently affordable with remaining Power/systems. Click{' '}
                    <strong>Continue to Sol {state.sol} Event</strong> above to proceed.
                  </div>
                )}
              </div>
            )}

            {state.phase === 'event' && state.activeEvent && (
              <EventModal event={state.activeEvent} onChoose={handleEventChoiceClick} />
            )}

            {state.phase === 'consequence' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-xl font-bold text-white">
                    Sol {state.sol} Summary &amp; Consequences
                  </h2>
                  <DataTag type="SIMULATED MISSION EVENT" />
                </div>

                {state.activeEvent && (
                  <div className="rounded-lg bg-[#131d33] border border-slate-700 p-4 text-sm text-slate-200">
                    <strong className="text-white">{state.activeEvent.title}:</strong>{' '}
                    {state.lastEventOutcome}
                  </div>
                )}

                {state.lastHarvestSummary && (
                  <div className="flex items-start gap-2 rounded-lg bg-emerald-950/40 border border-emerald-500/40 p-3.5 text-sm text-emerald-200">
                    <Sprout size={17} className="shrink-0 mt-0.5 text-emerald-400" />
                    <span>{state.lastHarvestSummary}</span>
                  </div>
                )}

                {state.lastEarthReply && (
                  <div className="rounded-lg bg-cyan-950/40 border border-cyan-500/40 p-3.5 text-sm text-cyan-100">
                    {state.lastEarthReply}
                  </div>
                )}

                {state.status === 'lost' && (
                  <div className="flex items-start gap-3 rounded-lg bg-rose-950/50 border border-rose-500 p-4 text-sm text-rose-100">
                    <AlertOctagon size={22} className="shrink-0 mt-0.5 text-rose-400" />
                    <div>
                      <strong>MISSION FAILED ON SOL {state.sol}:</strong> {state.failureReason}
                    </div>
                  </div>
                )}

                {state.status === 'won' && (
                  <div className="flex items-start gap-3 rounded-lg bg-emerald-950/50 border border-emerald-400 p-4 text-sm text-emerald-100">
                    <Award size={22} className="shrink-0 mt-0.5 text-emerald-300" />
                    <div>
                      <strong>MISSION ACCOMPLISHED!</strong> All 14 sols survived. Open your final
                      Commander Report below.
                    </div>
                  </div>
                )}

                {state.status === 'active' ? (
                  <button
                    type="button"
                    onClick={onAdvanceSol}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm sm:text-base transition-colors cursor-pointer min-h-[44px]"
                  >
                    Continue to Sol {state.sol + 1}
                    <ArrowRight size={18} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onNavigate('results')}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm sm:text-base transition-colors cursor-pointer min-h-[44px]"
                  >
                    View Final Mission Report
                    <Award size={18} />
                  </button>
                )}
              </div>
            )}
          </section>

          {/* Educational "WHY DOES THIS MATTER IN REAL SPACE EXPLORATION?" Box */}
          {state.lastEducationNote && (
            <section className="bg-[#0e1a29] border border-teal-500/35 rounded-xl p-5 space-y-2.5">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300">
                <Lightbulb size={16} />
                <span>Why Does This Matter in Real Space Exploration?</span>
              </div>
              <h3 className="text-lg font-bold text-white">{state.lastEducationNote.title}</h3>
              <p className="text-sm text-slate-200 leading-relaxed">
                {state.lastEducationNote.explanation}
              </p>
              <div className="rounded-lg bg-[#070b17]/75 border border-slate-800 p-3 text-xs sm:text-sm text-slate-300">
                <strong className="text-cyan-300">
                  Science Term — {state.lastEducationNote.scienceTerm}:
                </strong>{' '}
                {state.lastEducationNote.termDefinition}
              </div>
            </section>
          )}
        </div>

        {/* Right Info Column */}
        <aside className="lg:col-span-4 space-y-5">
          <CrewStatusPanel crew={state.crew} />
          <EarthCommsPanel
            comms={state.earthComms}
            currentSol={state.sol}
            transmitting={transmitting}
            transmitProgress={transmitProgress}
          />
        </aside>
      </div>
    </main>
  );
};
