'use client';

import { useCallback } from 'react';
import { useOptionsData } from '@/context/OptionsDataContext';
import { parseExcel, extractAssetFromFilename } from '@/lib/parser';

export function useFileUpload() {
  const { dispatch } = useOptionsData();

  const handleFile = useCallback(async (file: File) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const buffer = await file.arrayBuffer();
      const rows = parseExcel(buffer);
      if (rows.length === 0) {
        dispatch({ type: 'SET_ERROR', payload: 'Nenhum dado válido encontrado no arquivo.' });
        return;
      }
      const assetName = extractAssetFromFilename(file.name);
      const id = crypto.randomUUID();
      dispatch({ type: 'ADD_ASSET_TAB', payload: { id, assetName, rawData: rows } });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: `Erro ao ler arquivo: ${err}` });
    }
  }, [dispatch]);

  return { handleFile };
}
