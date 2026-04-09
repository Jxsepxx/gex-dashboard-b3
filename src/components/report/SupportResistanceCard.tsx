'use client';

import { useActiveAsset } from '@/hooks/useActiveAsset';
import { formatBRL, formatMillions } from '@/lib/formatters';
import { Circle } from 'lucide-react';

export default function SupportResistanceCard() {
  const { analytics: a } = useActiveAsset();
  if (!a) return null;

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-3">
        <Circle className="w-4 h-4" /> Support & Resistance Clusters
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Resistances */}
        <div>
          <div className="text-xs text-slate-500 mb-2">RESISTANCES (+GEX)</div>
          <div className="space-y-1.5">
            {a.resistanceZones.map((z) => (
              <div key={z.strike} className="flex items-center justify-between text-xs">
                <span className="text-white font-mono">{formatBRL(z.strike)}</span>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">{formatMillions(z.gexMillions * 1e6)}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                    z.strength === 'Strong' ? 'bg-emerald-900/50 text-emerald-400' :
                    z.strength === 'Moderate' ? 'bg-slate-700 text-slate-300' :
                    'bg-slate-800 text-slate-500'
                  }`}>
                    {z.strength}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Supports */}
        <div>
          <div className="text-xs text-slate-500 mb-2">SUPPORTS (-GEX)</div>
          <div className="space-y-1.5">
            {a.supportZones.map((z) => (
              <div key={z.strike} className="flex items-center justify-between text-xs">
                <span className="text-white font-mono">{formatBRL(z.strike)}</span>
                <div className="flex items-center gap-2">
                  <span className="text-red-400">{formatMillions(z.gexMillions * 1e6)}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                    z.strength === 'Strong' ? 'bg-red-900/50 text-red-400' :
                    z.strength === 'Moderate' ? 'bg-slate-700 text-slate-300' :
                    'bg-slate-800 text-slate-500'
                  }`}>
                    {z.strength}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
