import React from 'react';

export type DataClassification =
  | 'LIVE NASA OBSERVATION'
  | 'ARCHIVED NASA MEASUREMENT'
  | 'SIMULATED MISSION EVENT'
  | 'GAMEPLAY VALUE';

interface DataTagProps {
  type: DataClassification;
}

export const DataTag: React.FC<DataTagProps> = ({ type }) => {
  const styles: Record<DataClassification, { color: string; glyph: string }> = {
    'LIVE NASA OBSERVATION': { color: 'text-emerald-400', glyph: '●' },
    'ARCHIVED NASA MEASUREMENT': { color: 'text-sky-400', glyph: '◆' },
    'SIMULATED MISSION EVENT': { color: 'text-orange-400', glyph: '▲' },
    'GAMEPLAY VALUE': { color: 'text-slate-300', glyph: '■' },
  };

  const { color, glyph } = styles[type];

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase whitespace-nowrap ${color}`}
    >
      <span aria-hidden="true">{glyph}</span>
      <span>{type}</span>
    </span>
  );
};
