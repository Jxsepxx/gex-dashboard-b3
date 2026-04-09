'use client';

import { useOptionsData } from '@/context/OptionsDataContext';
import { useActiveAsset } from '@/hooks/useActiveAsset';
import TabBar from './TabBar';
import Sidebar from './Sidebar';
import VolatilidadeTab from '@/components/tabs/VolatilidadeTab';
import GexProfileTab from '@/components/tabs/GexProfileTab';
import NotionalTab from '@/components/tabs/NotionalTab';
import PcrTab from '@/components/tabs/PcrTab';
import ReportTab from '@/components/tabs/ReportTab';

const tabComponents = {
  volatilidade: VolatilidadeTab,
  'gex-profile': GexProfileTab,
  notional: NotionalTab,
  pcr: PcrTab,
  report: ReportTab,
};

export default function DashboardLayout() {
  const { state } = useOptionsData();
  const { analytics } = useActiveAsset();
  const ActiveTab = tabComponents[state.activeTab];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Main content */}
      <div className="flex-1 flex flex-col p-4 overflow-hidden">
        <TabBar />
        <div className="flex-1 mt-3 overflow-auto">
          {analytics ? (
            <ActiveTab />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500">
              {state.isLoading ? 'Processando...' : 'Insira o preço spot acima para gerar a análise'}
            </div>
          )}
        </div>
      </div>

      {/* Right sidebar */}
      <Sidebar />
    </div>
  );
}
