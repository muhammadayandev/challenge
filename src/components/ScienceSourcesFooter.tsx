import React from 'react';
import { ExternalLink, Info } from 'lucide-react';
import { DataTag } from './DataTag';

export const ScienceSourcesFooter: React.FC = () => {
  return (
    <footer
      id="science-sources"
      className="mt-auto bg-[#050811] border-t border-slate-800 px-4 sm:px-6 py-7"
    >
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex items-center gap-2 text-white font-bold text-base">
          <Info size={18} className="text-cyan-400 shrink-0" />
          <h3>Science Sources &amp; Data Transparency</h3>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 max-w-4xl leading-relaxed">
          OUTPOST 14 is an educational Mars survival strategy game for ages 7–12. Gameplay resources
          use simplified 0–100 units, while real space-weather observations come from official NASA
          open data APIs. <strong className="text-white">NASA does not endorse or sponsor this project.</strong>
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          <div className="space-y-1">
            <DataTag type="LIVE NASA OBSERVATION" />
            <p className="text-xs text-slate-400">
              Real solar flares (FLR) &amp; Solar Energetic Particle (SEP) records from NASA DONKI.
            </p>
          </div>
          <div className="space-y-1">
            <DataTag type="ARCHIVED NASA MEASUREMENT" />
            <p className="text-xs text-slate-400">
              Real ISS radiation dosimetry telemetry from NASA OSDR RadLab.
            </p>
          </div>
          <div className="space-y-1">
            <DataTag type="SIMULATED MISSION EVENT" />
            <p className="text-xs text-slate-400">
              Fictional Mars outpost weather, equipment glitches, and story choices.
            </p>
          </div>
          <div className="space-y-1">
            <DataTag type="GAMEPLAY VALUE" />
            <p className="text-xs text-slate-400">
              Simplified 0–100 strategy meters created for interactive learning.
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800/80 flex flex-wrap gap-5 text-xs sm:text-sm">
          <a
            href="https://api.nasa.gov/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-cyan-300 hover:underline font-semibold"
          >
            NASA Open APIs <ExternalLink size={13} />
          </a>
          <a
            href="https://ccmc.gsfc.nasa.gov/tools/DONKI/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-cyan-300 hover:underline font-semibold"
          >
            NASA CCMC DONKI <ExternalLink size={13} />
          </a>
          <a
            href="https://visualization.osdr.nasa.gov/radlab/gui/data-api/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-cyan-300 hover:underline font-semibold"
          >
            NASA OSDR RadLab <ExternalLink size={13} />
          </a>
          <a
            href="https://osdr.nasa.gov/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-cyan-300 hover:underline font-semibold"
          >
            NASA OSDR Portal <ExternalLink size={13} />
          </a>
        </div>
      </div>
    </footer>
  );
};
