'use client';

import { useActiveAsset } from '@/hooks/useActiveAsset';
import { formatK } from '@/lib/formatters';
import { BarChart3 } from 'lucide-react';

export default function PcrRangeCard() {
  const { analytics: a } = useActiveAsset();
  if (!a) return null;

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-3">
        <BarChart3 className="w-4 h-4" /> PCR By Strike Range (Global: {a.pcrGlobal.toFixed(2)})
      </div>

      <table className="w-full text-xs">
        <thead>
          <tr className="text-slate-500">
            <th className="text-left py-1">Range</th>
            <th className="text-right py-1">Calls OI</th>
            <th className="text-right py-1">Puts OI</th>
            <th className="text-right py-1">Ratio</th>
          </tr>
        </thead>
        <tbody>
          {a.pcrByRange.map((row) => (
            <tr key={row.label} className="border-t border-slate-800/50">
              <td className="py-1.5 text-slate-300">{row.label}</td>
              <td className="py-1.5 text-right text-blue-400">{formatK(row.callsOi)}</td>
              <td className="py-1.5 text-right text-red-400">{formatK(row.putsOi)}</td>
              <td className={`py-1.5 text-right font-medium ${
                row.pcr < 0.7 ? 'text-emerald-400' :
                row.pcr > 1.1 ? 'text-red-400' : 'text-yellow-400'
              }`}>
                {isNaN(row.pcr) ? '—' : row.pcr.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
