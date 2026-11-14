import React from 'react';
import { AlertTriangle, Sparkles } from 'lucide-react';
import { MissionEventDefinition } from '../game/types';
import { DataTag } from './DataTag';

interface EventModalProps {
  event: MissionEventDefinition;
  onChoose: (choiceId: string) => void;
}

export const EventModal: React.FC<EventModalProps> = ({ event, onChoose }) => {
  const severityColor =
    event.severity === 'danger'
      ? 'text-rose-300'
      : event.severity === 'warning'
      ? 'text-amber-300'
      : 'text-cyan-300';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className={`inline-flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase ${severityColor}`}>
          {event.severity === 'danger' ? <AlertTriangle size={15} /> : <Sparkles size={15} />}
          Daily Mission Event
        </span>
        <DataTag type="SIMULATED MISSION EVENT" />
      </div>

      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white">{event.title}</h2>
        <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">{event.summary}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {event.choices?.map((choice) => (
          <button
            key={choice.id}
            type="button"
            onClick={() => onChoose(choice.id)}
            className="text-left rounded-lg border border-orange-500/40 bg-[#131d33] hover:bg-[#1a2845] hover:border-orange-400 p-4 transition-colors cursor-pointer min-h-[112px]"
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <span className="font-display font-bold text-base text-white">{choice.label}</span>
            </div>
            <div className="text-xs font-semibold text-orange-300 mb-1.5">{choice.riskTag}</div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{choice.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};
