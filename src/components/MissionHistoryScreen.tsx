import React from 'react';
import { History, Award, CheckCircle2 } from 'lucide-react';
import { GameState, MissionReport } from '../game/types';
import { formatNasaTimestamp } from '../utils/format';
import { DataTag } from './DataTag';

interface MissionHistoryScreenProps {
  gameState: GameState | null;
  pastReports: MissionReport[];
}

export const MissionHistoryScreen: React.FC<MissionHistoryScreenProps> = ({
  gameState,
  pastReports,
}) => {
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-7 w-full space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="inline-flex items-center gap-2.5 text-2xl sm:text-3xl font-extrabold text-white">
            <History size={24} className="text-cyan-400" />
            Mission Log &amp; Past Reports
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Review every sol’s engineering decisions, resource changes, events, and science lessons.
          </p>
        </div>
        <DataTag type="GAMEPLAY VALUE" />
      </div>

      {gameState && gameState.history.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white">
            Current Mission Log · Seed {gameState.seed}
          </h2>
          {gameState.history
            .slice()
            .reverse()
            .map((entry) => (
              <article
                key={entry.sol}
                className="bg-[#0e1526] border border-slate-800 rounded-xl p-5 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    Sol {entry.sol} — {entry.eventTitle}
                  </h3>
                  <span className="text-xs font-mono-tabular text-cyan-300">
                    Power {entry.endResources.power} · Life {entry.endResources.lifeSupport} ·
                    Shelter {entry.endResources.shelterProtection} · Science{' '}
                    {entry.endResources.sciencePoints}
                  </span>
                </div>

                <div className="text-sm text-slate-200">
                  <strong className="text-white">Actions Taken:</strong>{' '}
                  {entry.actions.length > 0
                    ? entry.actions.map((a) => a.label).join(' + ')
                    : 'No actions taken'}
                </div>

                <p className="text-sm text-slate-300">
                  <strong className="text-white">Event Outcome:</strong>{' '}
                  {entry.eventChoiceLabel ? `[${entry.eventChoiceLabel}] ` : ''}
                  {entry.eventOutcome}
                </p>

                {entry.harvestsDelivered > 0 && (
                  <p className="inline-flex items-center gap-1.5 text-sm text-emerald-300">
                    <CheckCircle2 size={14} /> Bio-dome delivered {entry.harvestsDelivered} harvest
                    batch(es)!
                  </p>
                )}

                {entry.earthReplyDelivered && (
                  <p className="inline-flex items-center gap-1.5 text-sm text-cyan-200">
                    <CheckCircle2 size={14} /> {entry.earthReplyDelivered}
                  </p>
                )}

                <div className="rounded-lg bg-[#131d33] border border-slate-800 p-3 text-xs sm:text-sm text-slate-300">
                  <strong className="text-amber-300">Lesson Learned:</strong> {entry.lesson.title}{' '}
                  — {entry.lesson.explanation}
                </div>
              </article>
            ))}
        </section>
      ) : (
        <div className="bg-[#0e1526] border border-slate-800 rounded-xl p-6 text-sm text-slate-300">
          No completed sols yet in the active mission. Complete Sol 1 in Mission Control to start
          recording your log.
        </div>
      )}

      {pastReports.length > 0 && (
        <section className="space-y-3 pt-4 border-t border-slate-800">
          <h2 className="inline-flex items-center gap-2 text-lg font-bold text-white">
            <Award size={20} className="text-orange-400" />
            Archived Completed Missions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pastReports.map((rep) => (
              <div
                key={rep.id}
                className="bg-[#0e1526] border border-slate-800 rounded-xl p-4 space-y-1"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <strong className={rep.outcome === 'won' ? 'text-emerald-300' : 'text-rose-300'}>
                    {rep.outcome === 'won' ? 'VICTORY' : 'MISSION FAILED'} · Grade{' '}
                    {rep.overallGrade}
                  </strong>
                  <span className="text-xs text-slate-400 font-mono-tabular">
                    {formatNasaTimestamp(rep.completedAt)}
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-mono-tabular">
                  Seed: {rep.seed} · Sols: {rep.solsSurvived}/14 · Crew: {rep.crewSurvivors}/4 ·
                  Science: {rep.finalResources.sciencePoints} pts
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
};
