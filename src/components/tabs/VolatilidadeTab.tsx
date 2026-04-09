'use client';

import { useActiveAsset } from '@/hooks/useActiveAsset';
import { formatBRL } from '@/lib/formatters';

export default function VolatilidadeTab() {
  const { analytics: a, spotPrice: spot, assetName } = useActiveAsset();
  if (!a || !spot) return null;

  const flipDist = !isNaN(a.gammaFlip)
    ? ((spot - a.gammaFlip) / a.gammaFlip * 100)
    : null;

  return (
    <div className="flex items-center justify-center h-full">
      <div className="card p-8 max-w-lg w-full text-center">
        <div className="text-slate-400 text-sm mb-2">{assetName}</div>
        <div className="text-5xl font-bold text-white mb-6">
          {formatBRL(spot)}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="card p-4">
            <div className="text-slate-400 mb-1">Call Wall</div>
            <div className="text-emerald-400 text-xl font-semibold">
              {formatBRL(a.callWall)}
            </div>
          </div>
          <div className="card p-4">
            <div className="text-slate-400 mb-1">Put Wall</div>
            <div className="text-red-400 text-xl font-semibold">
              {formatBRL(a.putWall)}
            </div>
          </div>
          <div className="card p-4">
            <div className="text-slate-400 mb-1">Gamma Flip</div>
            <div className="text-amber-400 text-xl font-semibold">
              {formatBRL(a.gammaFlip)}
            </div>
            {flipDist !== null && (
              <div className={`text-xs mt-1 ${flipDist > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                Spot {flipDist > 0 ? 'acima' : 'abaixo'} {Math.abs(flipDist).toFixed(1)}%
              </div>
            )}
          </div>
          <div className="card p-4">
            <div className="text-slate-400 mb-1">Regime</div>
            <div className={`text-lg font-semibold ${
              a.regime === 'ALTA VOLATILIDADE' ? 'text-red-400' :
              a.regime === 'BAIXA VOLATILIDADE' ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              {a.regime}
            </div>
          </div>
        </div>

        <div className="mt-6 text-xs text-slate-600">
          Análise estática baseada em dados importados do opcoes.net.br
        </div>
      </div>
    </div>
  );
}
