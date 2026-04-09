'use client';

import { useActiveAsset } from '@/hooks/useActiveAsset';

export default function PcrRatioWidget() {
  const { analytics: a } = useActiveAsset();
  if (!a) return null;

  const pcr = a.pcrGlobal;
  // Map PCR to a percentage position on the bar (0% = bullish, 100% = bearish)
  // PCR range roughly 0 to 2+, normalized
  const pct = Math.min(Math.max((pcr / 2) * 100, 0), 100);

  const label = pcr < 0.7 ? 'Strong Bullish' :
    pcr < 0.9 ? 'Bullish' :
    pcr < 1.1 ? 'Neutral' :
    pcr < 2.0 ? 'Bearish' : 'Extreme Bearish';

  const labelColor = pcr < 0.9 ? 'text-emerald-400' :
    pcr < 1.1 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="card p-3">
      <div className="text-xs text-slate-500 tracking-wider mb-1">PUT/CALL RATIO</div>
      <div className="text-2xl font-bold text-white mb-2">{pcr.toFixed(2)}</div>
      <div className="relative h-2 rounded-full overflow-hidden mb-1.5"
           style={{ background: 'linear-gradient(to right, #10b981, #eab308, #ef4444)' }}>
        <div
          className="absolute top-0 w-1.5 h-full bg-white rounded-full shadow"
          style={{ left: `${pct}%`, transform: 'translateX(-50%)' }}
        />
      </div>
      <div className={`text-right text-xs font-medium ${labelColor}`}>{label}</div>
    </div>
  );
}
