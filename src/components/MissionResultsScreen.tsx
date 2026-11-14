import React from 'react';
import { Award, AlertOctagon, RotateCcw, Sparkles, Shield, HeartPulse, Compass } from 'lucide-react';
import { MissionReport, ScreenId } from '../game/types';
import { DataTag } from './DataTag';

interface MissionResultsScreenProps {
  report: MissionReport;
  onReplayNewSeed: () => void;
  onNavigate: (screen: ScreenId) => void;
}

export const MissionResultsScreen: React.FC<MissionResultsScreenProps> = ({
  report,
  onReplayNewSeed,
  onNavigate,
}) => {
  const isWin = report.outcome === 'won';

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-7 w-full space-y-6">
      <section
        className={`rounded-2xl border p-6 sm:p-8 space-y-5 ${
          isWin
            ? 'bg-gradient-to-br from-teal-950/60 to-[#0e1526] border-teal-500/40'
            : 'bg-gradient-to-br from-rose-950/50 to-[#0e1526] border-rose-500/40'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-extrabold uppercase tracking-wider text-orange-300">
            Commander Grade: {report.overallGrade} · Seed {report.seed}
          </span>
          <DataTag type="GAMEPLAY VALUE" />
        </div>

        <h1 className="flex items-center gap-3 text-2xl sm:text-3xl font-extrabold text-white">
          {isWin ? (
            <>
              <Award size={30} className="text-emerald-300 shrink-0" />
              <span>OUTPOST 14 SURVIVED ALL 14 SOLS!</span>
            </>
          ) : (
            <>
              <AlertOctagon size={30} className="text-rose-400 shrink-0" />
              <span>MISSION ABORTED ON SOL {report.solsSurvived}</span>
            </>
          )}
        </h1>

        {report.failureReason && (
          <div className="rounded-lg bg-rose-950/60 border border-rose-500/50 p-4 text-sm text-rose-100">
            {report.failureReason}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-lg bg-[#070b17]/75 border border-slate-800 p-3.5">
            <div className="text-xs text-slate-400">Sols Survived</div>
            <div className="text-xl font-bold text-white font-mono-tabular mt-1">
              {report.solsSurvived} / 14
            </div>
          </div>
          <div className="rounded-lg bg-[#070b17]/75 border border-slate-800 p-3.5">
            <div className="text-xs text-slate-400">Crew Survivors</div>
            <div className="text-xl font-bold text-white font-mono-tabular mt-1">
              {report.crewSurvivors} / 4
            </div>
          </div>
          <div className="rounded-lg bg-[#070b17]/75 border border-slate-800 p-3.5">
            <div className="text-xs text-slate-400">Power / Life / Shelter</div>
            <div className="text-lg font-bold text-white font-mono-tabular mt-1">
              {report.finalResources.power} / {report.finalResources.lifeSupport} /{' '}
              {report.finalResources.shelterProtection}
            </div>
          </div>
          <div className="rounded-lg bg-[#070b17]/75 border border-slate-800 p-3.5">
            <div className="text-xs text-slate-400">Science Points</div>
            <div className="text-xl font-bold text-cyan-300 font-mono-tabular mt-1">
              {report.finalResources.sciencePoints} pts
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        <section className="md:col-span-7 bg-[#0e1526] border border-slate-800 rounded-xl p-5 space-y-3">
          <h2 className="inline-flex items-center gap-2 text-lg font-bold text-white">
            <Compass size={18} className="text-cyan-400" />
            Commander Performance Assessment
          </h2>
          <ul className="space-y-3 text-sm text-slate-200 leading-relaxed">
            <li>
              <strong className="text-white">Resource Management:</strong>{' '}
              {report.assessments.resourceManagement}
            </li>
            <li className="flex items-start gap-1.5">
              <Shield size={15} className="shrink-0 mt-1 text-teal-400" />
              <span>
                <strong className="text-white">Shelter Protection:</strong>{' '}
                {report.assessments.shelterProtection}
              </span>
            </li>
            <li className="flex items-start gap-1.5">
              <HeartPulse size={15} className="shrink-0 mt-1 text-cyan-400" />
              <span>
                <strong className="text-white">Crew Safety:</strong>{' '}
                {report.assessments.crewSafety}
              </span>
            </li>
            <li className="flex items-start gap-1.5">
              <Sparkles size={15} className="shrink-0 mt-1 text-amber-400" />
              <span>
                <strong className="text-white">Science Achievements:</strong>{' '}
                {report.assessments.scienceAchievements}
              </span>
            </li>
            <li>
              <strong className="text-white">Decision Quality:</strong>{' '}
              {report.assessments.decisionQuality}
            </li>
          </ul>
        </section>

        <section className="md:col-span-5 bg-[#0e1526] border border-slate-800 rounded-xl p-5 space-y-3">
          <h2 className="text-lg font-bold text-white">Key Decisions Analyzed</h2>
          <div className="rounded-lg bg-emerald-950/35 border border-emerald-500/35 p-3.5 text-sm">
            <strong className="text-emerald-300">Best Decision</strong>
            <p className="mt-1 text-slate-200">{report.bestDecision}</p>
          </div>
          <div className="rounded-lg bg-orange-950/35 border border-orange-500/40 p-3.5 text-sm">
            <strong className="text-orange-300">Most Dangerous Moment</strong>
            <p className="mt-1 text-slate-200">{report.mostDangerousDecision}</p>
          </div>
        </section>
      </div>

      <section className="bg-[#0e1526] border border-slate-800 rounded-xl p-5 space-y-3">
        <h2 className="text-lg font-bold text-white">Three Space-Science Lessons Learned</h2>
        <ol className="list-decimal pl-5 space-y-2 text-sm text-slate-200 leading-relaxed">
          {report.lessonsLearned.map((lesson, i) => (
            <li key={i}>{lesson}</li>
          ))}
        </ol>
      </section>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onReplayNewSeed}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm sm:text-base cursor-pointer min-h-[44px]"
        >
          <RotateCcw size={18} />
          Replay with New Seed
        </button>
        <button
          type="button"
          onClick={() => onNavigate('history')}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-cyan-500/15 border border-cyan-400 text-cyan-100 hover:bg-cyan-500/25 font-bold text-sm sm:text-base cursor-pointer min-h-[44px]"
        >
          Review Full Sol History
        </button>
      </div>
    </main>
  );
};
