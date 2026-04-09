'use client';

import { useActiveAsset } from '@/hooks/useActiveAsset';
import { formatBRL } from '@/lib/formatters';
import { Target } from 'lucide-react';

export default function MarketRegimeCard() {
  const { analytics: a, spotPrice: spot } = useActiveAsset();
  if (!a || !spot) return null;

  const regimeColor =
    a.regime === 'ALTA VOLATILIDADE' ? 'text-red-400' :
    a.regime === 'BAIXA VOLATILIDADE' ? 'text-emerald-400' : 'text-amber-400';

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-3">
        <Target className="w-4 h-4" /> Market Regime & Targets
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-400">Spot Price</span>
          <span className="text-white font-medium">{formatBRL(spot)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Gamma Flip</span>
          <span className="text-red-400 font-medium">{formatBRL(a.gammaFlip)}</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-700">
        <div className="text-slate-500 text-xs mb-1">Market Regime</div>
        <div className={`text-sm font-semibold ${regimeColor}`}>
          {a.regime}
        </div>
      </div>
    </div>
  );
}
