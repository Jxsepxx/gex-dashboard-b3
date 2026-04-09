'use client';

import React, { createContext, useContext, useReducer, type ReactNode } from 'react';
import { AppState, AppAction } from '@/lib/types';

const initialState: AppState = {
  assetTabs: [],
  activeAssetTabId: null,
  activeTab: 'gex-profile',
  isLoading: false,
  error: null,
};

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_ASSET_TAB': {
      const newTab = {
        id: action.payload.id,
        assetName: action.payload.assetName,
        rawData: action.payload.rawData,
        spotPrice: null,
        analytics: null,
      };
      return {
        ...state,
        assetTabs: [...state.assetTabs, newTab],
        activeAssetTabId: newTab.id,
        error: null,
        isLoading: false,
      };
    }
    case 'REMOVE_ASSET_TAB': {
      const remaining = state.assetTabs.filter(t => t.id !== action.payload);
      const needSwitch = state.activeAssetTabId === action.payload;
      return {
        ...state,
        assetTabs: remaining,
        activeAssetTabId: needSwitch
          ? (remaining.length > 0 ? remaining[remaining.length - 1].id : null)
          : state.activeAssetTabId,
      };
    }
    case 'SELECT_ASSET_TAB':
      return { ...state, activeAssetTabId: action.payload };
    case 'SET_ASSET_SPOT':
      return {
        ...state,
        assetTabs: state.assetTabs.map(t =>
          t.id === action.payload.id
            ? { ...t, spotPrice: action.payload.spotPrice, analytics: null }
            : t
        ),
      };
    case 'SET_ASSET_ANALYTICS':
      return {
        ...state,
        assetTabs: state.assetTabs.map(t =>
          t.id === action.payload.id
            ? { ...t, analytics: action.payload.analytics }
            : t
        ),
        isLoading: false,
      };
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

const Ctx = createContext<{ state: AppState; dispatch: React.Dispatch<AppAction> } | null>(null);

export function OptionsDataProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>;
}

export function useOptionsData() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useOptionsData must be used within OptionsDataProvider');
  return ctx;
}
