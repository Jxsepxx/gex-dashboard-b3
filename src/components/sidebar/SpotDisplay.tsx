'use client';

import { useActiveAsset } from '@/hooks/useActiveAsset';
import { formatBRL } from '@/lib/formatters';

export default function SpotDisplay() {
  const { assetName, spotPrice } = useActiveAsset();

  return (
    <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-sm font-bold text-white">
        {assetName?.substring(0, 2) || 'GX'}
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="text-white font-semibold">{assetName || '—'}</span>
        </div>
        <div className="text-2xl font-bold text-white">
          {spotPrice ? formatBRL(spotPrice) : '—'}
        </div>
      </div>
    </div>
  );
}
