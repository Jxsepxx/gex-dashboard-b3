'use client';

import { useActiveAsset } from '@/hooks/useActiveAsset';
import { formatPercent } from '@/lib/formatters';
import { Zap } from 'lucide-react';

export default function VolatilitySkewCard() {
  const { analytics: a } = useActiveAsset();
  if (!a) return null;

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-3">
        <Zap className="w-4 h-4" /> Volatility Skew
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-400">OTM Puts IV</span>
          <span className="text-white">{formatPercent(a.ivPutsOtm)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">OTM Calls IV</span>
          <span className="text-white">{formatPercent(a.ivCallsOtm)}</span>
        </div>
        <div className="flex justify-between pt-2 border-t border-slate-700">
          <span className="text-slate-400">Net Skew</span>
          <span className="text-white font-medium">{formatPercent(a.ivSkew)}</span>
        </div>
      </div>
    </div>
  );
}
