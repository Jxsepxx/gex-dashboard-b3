'use client';

import { useRef } from 'react';
import { useOptionsData } from '@/context/OptionsDataContext';
import { useActiveAsset } from '@/hooks/useActiveAsset';
import { useOptionsAnalytics } from '@/hooks/useOptionsAnalytics';
import { useFileUpload } from '@/hooks/useFileUpload';
import FileUpload from '@/components/upload/FileUpload';
import SpotPriceInput from '@/components/upload/SpotPriceInput';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { BarChart3, X, Plus } from 'lucide-react';

export default function HomePage() {
  const { state, dispatch } = useOptionsData();
  const { tab } = useActiveAsset();
  const { handleFile } = useFileUpload();
  const addInputRef = useRef<HTMLInputElement>(null);

  // Dispara analytics quando rawData/spot mudam
  useOptionsAnalytics();

  const hasTabs = state.assetTabs.length > 0;

  // Tela de upload (nenhum arquivo importado)
  if (!hasTabs) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-xl w-full">
          <div className="flex items-center gap-3 mb-8 justify-center">
            <BarChart3 className="w-8 h-8 text-cyan-400" />
            <h1 className="text-3xl font-bold text-white">GEX Dashboard B3</h1>
          </div>
          <p className="text-slate-400 text-center mb-6">
            Análise de Gamma Exposure para opções da B3/Bovespa
          </p>
          <FileUpload />
          {state.error && (
            <div className="mt-4 p-3 rounded-lg bg-red-900/30 border border-red-800 text-red-400 text-sm">
              {state.error}
            </div>
          )}
          {state.isLoading && (
            <div className="mt-4 text-center text-slate-400 text-sm">Processando arquivo...</div>
          )}
        </div>
      </div>
    );
  }

  // Dashboard com abas de ativos
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-[#0d1525]">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-cyan-400" />
          <span className="text-sm font-semibold text-white mr-2">GEX Dashboard B3</span>

          {/* Asset tabs */}
          <div className="flex items-center gap-1">
            {state.assetTabs.map(t => {
              const isActive = t.id === state.activeAssetTabId;
              return (
                <button
                  key={t.id}
                  onClick={() => dispatch({ type: 'SELECT_ASSET_TAB', payload: t.id })}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                    ${isActive
                      ? 'bg-cyan-900/50 text-cyan-400 border border-cyan-800'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }
                  `}
                >
                  {t.assetName}
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch({ type: 'REMOVE_ASSET_TAB', payload: t.id });
                    }}
                    className="ml-1 hover:text-red-400 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </span>
                </button>
              );
            })}

            {/* Add tab button */}
            <button
              onClick={() => addInputRef.current?.click()}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs
                         text-slate-500 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
              title="Importar novo arquivo"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <input
              ref={addInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
                e.target.value = '';
              }}
              className="hidden"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <SpotPriceInput />
        </div>
      </div>

      {/* Error banner */}
      {state.error && (
        <div className="px-4 py-2 bg-red-900/30 border-b border-red-800 text-red-400 text-sm">
          {state.error}
        </div>
      )}

      {/* Main dashboard */}
      <div className="flex-1 overflow-hidden">
        <DashboardLayout />
      </div>
    </div>
  );
}
