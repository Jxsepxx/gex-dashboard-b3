'use client';

import { useState, useEffect } from 'react';
import { useOptionsData } from '@/context/OptionsDataContext';
import { useActiveAsset } from '@/hooks/useActiveAsset';

export default function SpotPriceInput() {
  const { dispatch } = useOptionsData();
  const { tab } = useActiveAsset();
  const [value, setValue] = useState('');

  // Sync input when switching tabs
  useEffect(() => {
    setValue(tab?.spotPrice?.toString() || '');
  }, [tab?.id, tab?.spotPrice]);

  const handleSubmit = () => {
    if (!tab) return;
    const num = parseFloat(value.replace(',', '.'));
    if (!isNaN(num) && num > 0) {
      dispatch({ type: 'SET_ASSET_SPOT', payload: { id: tab.id, spotPrice: num } });
    }
  };

  return (
    <div className="flex items-center gap-3">
      <label className="text-sm text-slate-400 font-medium">Spot (R$):</label>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        onBlur={handleSubmit}
        placeholder="Ex: 37.50"
        className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm
                   text-slate-200 w-28 focus:outline-none focus:border-cyan-500"
      />
    </div>
  );
}
