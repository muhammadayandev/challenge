import React from 'react';
import { Users, ShieldAlert } from 'lucide-react';
import { Astronaut } from '../game/types';

interface CrewStatusPanelProps {
  crew: Astronaut[];
}

export const CrewStatusPanel: React.FC<CrewStatusPanelProps> = ({ crew }) => {
  const activeCount = crew.filter((c) => c.health > 0).length;

  return (
    <section className="bg-[#0e1526] border border-slate-800 rounded-xl p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h3 className="inline-flex items-center gap-2 text-base font-bold text-white">
          <Users size={18} className="text-orange-400" />
          Outpost Crew
        </h3>
        <span className="text-xs font-mono-tabular text-slate-300">{activeCount} / 4 Active</span>
      </div>

      <div className="divide-y divide-slate-800/90">
        {crew.map((member) => {
          const statusColor =
            member.status === 'Healthy'
              ? 'text-emerald-300'
              : member.status === 'Tired'
              ? 'text-amber-300'
              : 'text-rose-300';

          return (
            <div key={member.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-bold text-white">{member.name}</div>
                <div className="text-xs text-slate-400">{member.role}</div>
              </div>
              <div className="text-right">
                <div className={`inline-flex items-center gap-1 text-xs font-bold ${statusColor}`}>
                  {member.status === 'Radiation Alert' && <ShieldAlert size={12} />}
                  <span>{member.status}</span>
                </div>
                <div className="text-xs text-slate-300 font-mono-tabular">
                  HP {member.health} · Rad {member.radiationExposure}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
