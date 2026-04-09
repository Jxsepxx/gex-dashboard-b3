'use client';

import { useActiveAsset } from '@/hooks/useActiveAsset';
import { formatBRL, formatMillions } from '@/lib/formatters';
import { MapPin } from 'lucide-react';

export default function PinCandidatesCard() {
  const { analytics: a } = useActiveAsset();
  if (!a) return null;

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-3">
        <MapPin className="w-4 h-4" /> Pin Candidates (Dealer Long Trap)
      </div>

      <div className="space-y-2">
        {a.pinCandidates.map((p) => (
          <div key={p.strike} className="flex justify-between text-sm">
            <span className="text-white font-mono">{formatBRL(p.strike)}</span>
            <span className="text-cyan-400 font-mono text-xs">
              {formatMillions(p.gexMillions * 1e6)} GEX
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
