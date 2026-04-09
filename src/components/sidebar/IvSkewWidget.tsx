'use client';

import { useActiveAsset } from '@/hooks/useActiveAsset';
import { formatPercent } from '@/lib/formatters';

export default function IvSkewWidget() {
  const { analytics: a } = useActiveAsset();
  if (!a) return null;

  return (
    <div className="card p-3">
      <div className="text-xs text-slate-500 tracking-wider mb-2">IV SKEW (OTM PUTS - CALLS)</div>
      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-400">OTM Puts IV</span>
          <span className="text-white">{formatPercent(a.ivPutsOtm)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">OTM Calls IV</span>
          <span className="text-white">{formatPercent(a.ivCallsOtm)}</span>
        </div>
        <div className="flex justify-between pt-1.5 border-t border-slate-700">
          <span className="text-slate-400">Skew</span>
          <span className="text-white font-medium">{formatPercent(a.ivSkew)}</span>
        </div>
      </div>
    </div>
  );
}
