'use client';

import { useActiveAsset } from '@/hooks/useActiveAsset';

export default function MarketRegimeWidget() {
  const { analytics: a } = useActiveAsset();
  if (!a) return null;

  const config = {
    'ALTA VOLATILIDADE': { bg: 'bg-red-900/40', text: 'text-red-400', border: 'border-red-800' },
    'BAIXA VOLATILIDADE': { bg: 'bg-emerald-900/40', text: 'text-emerald-400', border: 'border-emerald-800' },
    'TRANSITION': { bg: 'bg-amber-900/40', text: 'text-amber-400', border: 'border-amber-800' },
  }[a.regime];

  return (
    <div className="card p-3">
      <div className="text-xs text-slate-500 tracking-wider mb-2">MARKET REGIME</div>
      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium ${config.bg} ${config.text} ${config.border}`}>
        <span className="w-2 h-2 rounded-full bg-current" />
        {a.regime}
      </div>
    </div>
  );
}
