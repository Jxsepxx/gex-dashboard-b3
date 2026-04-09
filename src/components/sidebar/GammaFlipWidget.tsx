'use client';

import { useActiveAsset } from '@/hooks/useActiveAsset';
import { formatBRL } from '@/lib/formatters';

export default function GammaFlipWidget() {
  const { analytics: a, spotPrice: spot } = useActiveAsset();
  if (!a || !spot) return null;

  const flip = a.gammaFlip;
  const dist = !isNaN(flip) ? ((spot - flip) / flip * 100) : null;

  return (
    <div className="card p-3">
      <div className="text-xs text-slate-500 tracking-wider mb-2">GAMMA FLIP</div>
      <div className="text-lg font-bold text-white mb-1">
        {isNaN(flip) ? '—' : formatBRL(flip)}
      </div>
      {dist !== null && (
        <div className={`text-xs ${dist > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
          Spot {dist > 0 ? 'acima' : 'abaixo'} {Math.abs(dist).toFixed(2)}% do flip
          {dist > 0 ? ' → Dealers short gamma' : ' → Dealers long gamma'}
        </div>
      )}
    </div>
  );
}
