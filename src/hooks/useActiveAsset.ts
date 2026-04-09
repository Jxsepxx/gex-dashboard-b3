'use client';

import { useOptionsData } from '@/context/OptionsDataContext';

export function useActiveAsset() {
  const { state } = useOptionsData();
  const tab = state.assetTabs.find(t => t.id === state.activeAssetTabId) ?? null;
  return {
    tab,
    assetName: tab?.assetName ?? null,
    rawData: tab?.rawData ?? null,
    spotPrice: tab?.spotPrice ?? null,
    analytics: tab?.analytics ?? null,
  };
}
