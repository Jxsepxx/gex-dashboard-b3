'use client';

import { useActiveAsset } from '@/hooks/useActiveAsset';
import { generateTextReport } from '@/lib/analytics';
import { Copy } from 'lucide-react';
import MarketRegimeCard from '@/components/report/MarketRegimeCard';
import VolatilitySkewCard from '@/components/report/VolatilitySkewCard';
import WallEstimatesCard from '@/components/report/WallEstimatesCard';
import CentroidsCard from '@/components/report/CentroidsCard';
import PcrRangeCard from '@/components/report/PcrRangeCard';
import PinCandidatesCard from '@/components/report/PinCandidatesCard';
import SupportResistanceCard from '@/components/report/SupportResistanceCard';

export default function ReportTab() {
  const { analytics: a, assetName, spotPrice } = useActiveAsset();

  const copyReport = async () => {
    if (!a || !assetName || !spotPrice) return;
    const text = generateTextReport(a, assetName, spotPrice);
    await navigator.clipboard.writeText(text);
  };

  if (!a) return null;

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-200">GEX Report</h2>
        <button
          onClick={copyReport}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500
                     text-white text-sm font-medium transition-colors"
        >
          <Copy className="w-4 h-4" />
          Copiar Formato Texto
        </button>
      </div>

      {/* Row 1: 3 cards */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <MarketRegimeCard />
        <VolatilitySkewCard />
        <WallEstimatesCard />
      </div>

      {/* Row 2: 2 cards */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <CentroidsCard />
        <PcrRangeCard />
      </div>

      {/* Row 3: 2 cards */}
      <div className="grid grid-cols-2 gap-3">
        <PinCandidatesCard />
        <SupportResistanceCard />
      </div>
    </div>
  );
}
