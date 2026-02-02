import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

// Hook for high-level KPIs
export const useKPIs = () => {
  return useQuery({
    queryKey: ['kpis'],
    queryFn: () => api.kpis.get()
  });
};

// Hook for Waterfall Chart data
export const useWaterfallData = () => {
  return useQuery({
    queryKey: ['waterfall'],
    queryFn: () => api.analytics.waterfall()
  });
};

// Hook for Officer Leaderboard
export const useOfficerLeaderboard = () => {
  return useQuery({
    queryKey: ['officers-leaderboard'],
    queryFn: () => api.officers.leaderboard()
  });
};

// Hook for Filter Metadata
export const useFilterMetadata = () => {
  return useQuery({
    queryKey: ['filters'],
    queryFn: () => api.metadata.filters()
  });
};

// Hook for Data Quality Report
export const useDataQuality = () => {
  return useQuery({
    queryKey: ['data-quality'],
    queryFn: () => api.dataQuality.report()
  });
};

// Hook for Bank Summary
export const useBankSummary = () => {
  return useQuery({
    queryKey: ['bank-summary'],
    queryFn: () => api.analytics.bankSummary()
  });
};

// --- Transitional Hooks (loading raw data until components are granular) ---

export const useRawHouseholds = () => {
  return useQuery({
    queryKey: ['households-raw'],
    queryFn: () => api.raw.households()
  });
};

export const useRawOfficers = () => {
  return useQuery({
    queryKey: ['officers-raw'],
    queryFn: () => api.officers.raw()
  });
};

export const useRawTeams = () => {
  return useQuery({
    queryKey: ['teams-raw'],
    queryFn: () => api.raw.teams()
  });
};
