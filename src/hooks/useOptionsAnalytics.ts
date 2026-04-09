'use client';

import { useEffect } from 'react';
import { useOptionsData } from '@/context/OptionsDataContext';
import { useActiveAsset } from '@/hooks/useActiveAsset';
import { computeAnalytics } from '@/lib/analytics';

export function useOptionsAnalytics() {
  const { dispatch } = useOptionsData();
  const { tab } = useActiveAsset();

  const tabId = tab?.id ?? null;
  const rawData = tab?.rawData ?? null;
  const spotPrice = tab?.spotPrice ?? null;

  useEffect(() => {
    if (!tabId || !rawData || !spotPrice || spotPrice <= 0) return;

    dispatch({ type: 'SET_LOADING', payload: true });

    const timer = setTimeout(() => {
      try {
        if (rawData.length === 0) {
          dispatch({ type: 'SET_ERROR', payload: 'Nenhum dado válido no arquivo.' });
          return;
        }
        const result = computeAnalytics(rawData, spotPrice);
        dispatch({ type: 'SET_ASSET_ANALYTICS', payload: { id: tabId, analytics: result } });
      } catch (err) {
        dispatch({ type: 'SET_ERROR', payload: `Erro na análise: ${err}` });
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [tabId, rawData, spotPrice, dispatch]);
}
