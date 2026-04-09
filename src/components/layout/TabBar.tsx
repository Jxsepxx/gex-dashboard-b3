'use client';

import { useOptionsData } from '@/context/OptionsDataContext';
import { TabId } from '@/lib/types';
import { TrendingUp, Sparkles, BarChart3, Grid3X3, FileText } from 'lucide-react';

const tabs: { id: TabId; label: string; icon: React.ReactNode; color: string }[] = [
  { id: 'volatilidade', label: 'Volatilidade', icon: <TrendingUp className="w-4 h-4" />, color: 'bg-cyan-600' },
  { id: 'gex-profile', label: 'GEX Profile', icon: <Sparkles className="w-4 h-4" />, color: 'bg-purple-600' },
  { id: 'notional', label: 'Notional', icon: <BarChart3 className="w-4 h-4" />, color: 'bg-blue-600' },
  { id: 'pcr', label: 'PCR', icon: <Grid3X3 className="w-4 h-4" />, color: 'bg-emerald-600' },
  { id: 'report', label: 'Report', icon: <FileText className="w-4 h-4" />, color: 'bg-amber-600' },
];

export default function TabBar() {
  const { state, dispatch } = useOptionsData();

  return (
    <div className="flex items-center gap-1 pb-3 border-b border-slate-800">
      {tabs.map(tab => {
        const active = state.activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: tab.id })}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
              transition-colors
              ${active
                ? `${tab.color} text-white`
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }
            `}
          >
            {tab.icon}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
