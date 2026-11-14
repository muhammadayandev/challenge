import React, { useState } from 'react';
import { Zap, HeartPulse, Shield, Radio, ArrowRight, ArrowLeft, Rocket } from 'lucide-react';
import { DataTag } from './DataTag';

interface TutorialScreenProps {
  onBeginMission: () => void;
}

const STEPS = [
  {
    title: '1. Know Your Three Outpost Systems',
    kicker: 'Systems Check',
    body: 'Every sol (a Martian day, about 24 hours 39 minutes), you manage three simplified 0–100 resources:',
    bullets: [
      'POWER (Starts at 80/100): Runs water recyclers, greenhouses, and drills. Solar panels recharge batteries each sol unless red dust covers them.',
      'LIFE SUPPORT (Starts at 75/100): Represents breathable oxygen, clean water, and food. If this hits 0, the mission fails immediately.',
      'SHELTER PROTECTION (Starts at 35/100): Thick Martian soil (regolith) shields your 4 astronauts during solar radiation storms.',
    ],
  },
  {
    title: '2. Two Actions Per Sol & Future Planning',
    kicker: 'Commander Strategy',
    body: 'Each sol follows a clear Mission Cycle: Briefing -> Choose 2 Actions -> Daily Event -> Consequences & Science Lesson.',
    bullets: [
      'Every action has a COST, a BENEFIT, and a CONSEQUENCE.',
      'Operating the Greenhouse costs Power and Life Support today, then delivers a big harvest 3 sols later.',
      'Scientific Expeditions earn Science Points, but stepping outside adds mild radiation exposure.',
    ],
  },
  {
    title: '3. Watch Out for Space Hazards & Earth Delay',
    kicker: 'Survival Risks',
    body: 'Mars is unforgiving—and Earth is millions of kilometers away!',
    bullets: [
      'Dust Storms slash solar power. Keep panels clean and watch your battery reserve.',
      'Solar Particle Events blast space radiation. High Shelter Protection protects your crew.',
      'Earth Communication Delay: Radio messages take 3–22 minutes one-way, so Earth help arrives on the next sol (accelerated on-screen so you never wait 22 real minutes).',
    ],
  },
  {
    title: '4. Real NASA Science vs. Game Simulation',
    kicker: 'Data Transparency',
    body: 'In the NASA Weather screen, you can inspect real solar flare and Solar Energetic Particle records from NASA DONKI, plus ISS radiation telemetry from RadLab.',
    bullets: [
      'Real NASA observations are always tagged LIVE NASA OBSERVATION or ARCHIVED NASA MEASUREMENT.',
      'Game events and 0–100 bars are clearly tagged SIMULATED MISSION EVENT or GAMEPLAY VALUE.',
      'Ready to guide Crew Outpost 14 safely through Sol 14?',
    ],
  },
];

export const TutorialScreen: React.FC<TutorialScreenProps> = ({ onBeginMission }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const current = STEPS[stepIndex];

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full">
      <section className="bg-[#0e1526] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
            Mission Briefing Guide · Step {stepIndex + 1} of {STEPS.length} · {current.kicker}
          </span>
          <DataTag type="GAMEPLAY VALUE" />
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white text-balance">{current.title}</h1>
          <p className="mt-2 text-sm sm:text-base text-slate-300">{current.body}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs sm:text-sm font-semibold text-slate-200">
          <div className="flex items-center gap-2 bg-[#131d33] border border-slate-800 rounded-lg px-3 py-2.5">
            <Zap size={16} className="text-amber-400 shrink-0" />
            <span>Power</span>
          </div>
          <div className="flex items-center gap-2 bg-[#131d33] border border-slate-800 rounded-lg px-3 py-2.5">
            <HeartPulse size={16} className="text-cyan-400 shrink-0" />
            <span>Life Support</span>
          </div>
          <div className="flex items-center gap-2 bg-[#131d33] border border-slate-800 rounded-lg px-3 py-2.5">
            <Shield size={16} className="text-teal-400 shrink-0" />
            <span>Shielding</span>
          </div>
          <div className="flex items-center gap-2 bg-[#131d33] border border-slate-800 rounded-lg px-3 py-2.5">
            <Radio size={16} className="text-orange-400 shrink-0" />
            <span>3–22m Delay</span>
          </div>
        </div>

        <ul className="space-y-3 pl-5 list-disc text-sm sm:text-base text-slate-200 leading-relaxed">
          {current.bullets.map((line, idx) => (
            <li key={idx}>{line}</li>
          ))}
        </ul>

        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2" role="tablist" aria-label="Tutorial steps">
            {STEPS.map((step, i) => (
              <button
                key={step.title}
                type="button"
                onClick={() => setStepIndex(i)}
                aria-label={`Step ${i + 1}`}
                className={`h-2.5 rounded transition-all cursor-pointer ${
                  i === stepIndex ? 'w-7 bg-orange-500' : 'w-2.5 bg-slate-700 hover:bg-slate-500'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-3">
            {stepIndex > 0 && (
              <button
                type="button"
                onClick={() => setStepIndex((s) => s - 1)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#131d33] border border-slate-700 hover:border-slate-500 text-slate-100 font-semibold text-sm cursor-pointer min-h-[42px]"
              >
                <ArrowLeft size={16} />
                Previous
              </button>
            )}
            {stepIndex < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() => setStepIndex((s) => s + 1)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm cursor-pointer min-h-[42px]"
              >
                Next
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={onBeginMission}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm cursor-pointer min-h-[42px]"
              >
                <Rocket size={16} />
                Launch Mission
              </button>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};
