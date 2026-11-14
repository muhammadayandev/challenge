import React from 'react';
import { Droplets, Sprout, Shield, Sun, Compass, Radio, Lock } from 'lucide-react';
import { ACTION_DEFINITIONS, canPerformAction } from '../game/actions';
import { ActionId, GameState } from '../game/types';

interface ActionCardsProps {
  state: GameState;
  onSelectAction: (actionId: ActionId) => void;
  disabledGlobal: boolean;
}

const ACTION_ICONS: Record<ActionId, React.ReactNode> = {
  recycle_water: <Droplets size={20} />,
  operate_greenhouse: <Sprout size={20} />,
  improve_shielding: <Shield size={20} />,
  clean_solar_panels: <Sun size={20} />,
  scientific_expedition: <Compass size={20} />,
  contact_earth: <Radio size={20} />,
};

export const ActionCards: React.FC<ActionCardsProps> = ({
  state,
  onSelectAction,
  disabledGlobal,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {ACTION_DEFINITIONS.map((action) => {
        const check = canPerformAction(state, action.id);
        const isDisabled = disabledGlobal || !check.allowed;

        return (
          <button
            key={action.id}
            type="button"
            disabled={isDisabled}
            onClick={() => onSelectAction(action.id)}
            className={`text-left rounded-lg border p-4 transition-colors flex flex-col justify-between min-h-[132px] ${
              isDisabled
                ? 'bg-[#0b1120] border-slate-800/80 opacity-60 cursor-not-allowed'
                : 'bg-[#131d33] border-slate-700 hover:border-cyan-400 hover:bg-[#192642] cursor-pointer'
            }`}
          >
            <div>
              <div className="flex items-start gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 flex items-center justify-center shrink-0">
                  {ACTION_ICONS[action.id]}
                </div>
                <div>
                  <div className="font-display font-bold text-base text-white leading-snug">
                    {action.label}
                  </div>
                  <div className="text-xs font-semibold text-emerald-300 mt-0.5">
                    {action.shortBenefit}
                  </div>
                </div>
              </div>

              <div className="text-xs font-semibold text-orange-300 mb-1.5 font-mono-tabular">
                Cost: {action.costText}
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {action.consequenceText}
              </p>
            </div>

            {!check.allowed && check.reason && (
              <div className="mt-3 pt-2 border-t border-slate-800 flex items-start gap-1.5 text-xs font-medium text-rose-300">
                <Lock size={13} className="shrink-0 mt-0.5" />
                <span>{check.reason}</span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};
