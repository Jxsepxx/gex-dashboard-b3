'use client';

import { useActiveAsset } from '@/hooks/useActiveAsset';
import { formatBRL } from '@/lib/formatters';

export default function GammaWallsWidget() {
  const { analytics: a } = useActiveAsset();
  if (!a) return null;

  return (
    <div className="card p-3">
      <div className="text-xs text-slate-500 tracking-wider mb-2">GAMMA WALLS (ALL EXPIRES)</div>
      <div className="grid grid-cols-2 gap-3">
        <div className="border-l-2 border-emerald-500 pl-2">
          <div className="text-[10px] text-slate-500">CALL WALL</div>
          <div className="text-lg font-bold text-white">{formatBRL(a.callWall)}</div>
        </div>
        <div className="border-l-2 border-red-500 pl-2">
          <div className="text-[10px] text-slate-500">PUT WALL</div>
          <div className="text-lg font-bold text-white">{formatBRL(a.putWall)}</div>
        </div>
      </div>
    </div>
  );
}
