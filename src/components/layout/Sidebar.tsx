'use client';

import { useActiveAsset } from '@/hooks/useActiveAsset';
import SpotDisplay from '@/components/sidebar/SpotDisplay';
import PcrRatioWidget from '@/components/sidebar/PcrRatioWidget';
import GammaWallsWidget from '@/components/sidebar/GammaWallsWidget';
import IvSkewWidget from '@/components/sidebar/IvSkewWidget';
import MarketRegimeWidget from '@/components/sidebar/MarketRegimeWidget';
import GammaFlipWidget from '@/components/sidebar/GammaFlipWidget';
import ZonesWidget from '@/components/sidebar/ZonesWidget';

export default function Sidebar() {
  const { analytics } = useActiveAsset();

  return (
    <aside className="w-80 border-l border-slate-800 bg-[#0d1525] overflow-y-auto p-4 flex flex-col gap-3">
      <SpotDisplay />

      {analytics && (
        <>
          <div className="text-xs text-slate-500 font-medium tracking-wider mt-1">
            OPTIONS ANALYTICS
          </div>

          <PcrRatioWidget />
          <GammaWallsWidget />
          <IvSkewWidget />
          <MarketRegimeWidget />
          <GammaFlipWidget />
          <ZonesWidget />
        </>
      )}
    </aside>
  );
}
