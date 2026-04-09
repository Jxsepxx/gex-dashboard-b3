'use client';

import { useActiveAsset } from '@/hooks/useActiveAsset';
import { formatBRL, formatMillions } from '@/lib/formatters';

export default function ZonesWidget() {
  const { analytics: a } = useActiveAsset();
  if (!a) return null;

  return (
    <div className="card p-3">
      <div className="text-xs text-slate-500 tracking-wider mb-2">SUPPORT & RESISTANCE</div>

      <div className="mb-3">
        <div className="text-[10px] text-emerald-500 mb-1">RESISTANCE (+GEX)</div>
        {a.resistanceZones.slice(0, 3).map(z => (
          <div key={z.strike} className="flex justify-between text-xs py-0.5">
            <span className="text-slate-300 font-mono">{formatBRL(z.strike)}</span>
            <span className="text-emerald-400">{formatMillions(z.gexMillions * 1e6)}</span>
          </div>
        ))}
      </div>

      <div>
        <div className="text-[10px] text-red-500 mb-1">SUPPORT (-GEX)</div>
        {a.supportZones.slice(0, 3).map(z => (
          <div key={z.strike} className="flex justify-between text-xs py-0.5">
            <span className="text-slate-300 font-mono">{formatBRL(z.strike)}</span>
            <span className="text-red-400">{formatMillions(z.gexMillions * 1e6)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
