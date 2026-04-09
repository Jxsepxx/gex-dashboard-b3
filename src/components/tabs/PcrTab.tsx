'use client';

import { useActiveAsset } from '@/hooks/useActiveAsset';
import PcrDistributionBar from '@/components/charts/PcrDistributionBar';
import { formatK, sentimentColor } from '@/lib/formatters';

export default function PcrTab() {
  const { analytics: a, assetName } = useActiveAsset();
  if (!a) return null;

  return (
    <div className="p-4">
      <div className="text-sm text-slate-400 mb-4">
        PCR (Put/Call Ratio) by moneyness range — based on open interest in {assetName}
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-slate-500 text-xs tracking-wider border-b border-slate-800">
            <th className="text-left py-3 px-2">RANGE</th>
            <th className="text-right py-3 px-2">CALLS OI</th>
            <th className="text-right py-3 px-2">PUTS OI</th>
            <th className="text-right py-3 px-2">PCR</th>
            <th className="text-center py-3 px-2 w-32">OI DISTRIBUTION</th>
            <th className="text-left py-3 px-2">SENTIMENT</th>
          </tr>
        </thead>
        <tbody>
          {a.pcrByRange.map((row) => (
            <tr key={row.label} className="border-b border-slate-800/50 hover:bg-slate-800/30">
              <td className="py-4 px-2 text-slate-200 font-medium">{row.label}</td>
              <td className="py-4 px-2 text-right text-blue-400">{formatK(row.callsOi)}</td>
              <td className="py-4 px-2 text-right text-red-400">{formatK(row.putsOi)}</td>
              <td className="py-4 px-2 text-right font-bold text-white">
                {isNaN(row.pcr) ? '—' : row.pcr.toFixed(2)}
              </td>
              <td className="py-4 px-2">
                <PcrDistributionBar callsOi={row.callsOi} putsOi={row.putsOi} />
              </td>
              <td className={`py-4 px-2 font-medium ${sentimentColor(row.pcr)}`}>
                {row.sentiment}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* PCR Interpretation guide */}
      <div className="card p-4 mt-6 text-xs text-slate-400">
        <div className="font-medium text-slate-300 mb-2">PCR Interpretation</div>
        <div><span className="text-red-400">PCR &gt; 2.0</span> — Extreme put demand, strong bearish hedging</div>
        <div><span className="text-red-400">PCR 1.1-2.0</span> — Bearish bias, put dominance</div>
        <div>PCR 0.9-1.1 — Neutral / balanced market</div>
        <div><span className="text-emerald-400">PCR 0.7-0.9</span> — Bullish bias, call dominance</div>
        <div><span className="text-emerald-400">PCR &lt; 0.7</span> — Strong bullish / speculative call demand</div>
      </div>
    </div>
  );
}
