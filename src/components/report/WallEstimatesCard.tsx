'use client';

import { useActiveAsset } from '@/hooks/useActiveAsset';
import { formatBRL } from '@/lib/formatters';
import { Shield } from 'lucide-react';

export default function WallEstimatesCard() {
  const { analytics: a } = useActiveAsset();
  if (!a) return null;

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-3">
        <Shield className="w-4 h-4" /> Wall Estimates (Max Abs GEX)
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-400">Call Wall</span>
          <span className="text-emerald-400 font-bold text-lg">{formatBRL(a.callWall)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Put Wall</span>
          <span className="text-red-400 font-bold text-lg">{formatBRL(a.putWall)}</span>
        </div>
      </div>
    </div>
  );
}
