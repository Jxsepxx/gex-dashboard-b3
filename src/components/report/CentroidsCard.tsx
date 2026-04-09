'use client';

import { useActiveAsset } from '@/hooks/useActiveAsset';
import { formatBRL } from '@/lib/formatters';
import { Crosshair } from 'lucide-react';

export default function CentroidsCard() {
  const { analytics: a } = useActiveAsset();
  if (!a) return null;

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-3">
        <Crosshair className="w-4 h-4" /> Centroids Identification
      </div>

      <div className="text-xs text-slate-500 mb-2">Open Interest Weighted</div>
      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
        <div>
          <div className="text-slate-500 text-xs">Calls</div>
          <div className="text-white font-medium">{formatBRL(a.centroidsOiCalls)}</div>
        </div>
        <div>
          <div className="text-slate-500 text-xs">Puts</div>
          <div className="text-white font-medium">{formatBRL(a.centroidsOiPuts)}</div>
        </div>
      </div>

      <div className="text-xs text-slate-500 mb-2">Gamma Weighted</div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <div className="text-slate-500 text-xs">Calls</div>
          <div className="text-white font-medium">{formatBRL(a.centroidsGammaCalls)}</div>
        </div>
        <div>
          <div className="text-slate-500 text-xs">Puts</div>
          <div className="text-white font-medium">{formatBRL(a.centroidsGammaPuts)}</div>
        </div>
      </div>
    </div>
  );
}
