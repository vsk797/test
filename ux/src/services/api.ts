// This file serves as the API Client. 
// Currently it routes to the Mock Data Service, but in the future 
// it will be replaced by real Axios/Fetch calls to the Python Backend.

import * as MockService from './mockDataService';

export const api = {
  kpis: {
    get: MockService.getKPIs
  },
  analytics: {
    waterfall: MockService.getWaterfallData,
    narrative: MockService.getNarrative,
    bankSummary: MockService.getBankSummary
  },
  officers: {
    leaderboard: MockService.getOfficerLeaderboard,
    raw: MockService.getRawOfficers
  },
  metadata: {
    filters: MockService.getFilterMetadata
  },
  dataQuality: {
    report: MockService.getDataQualityReport
  },
  // Legacy accessors for transitional components
  raw: {
    households: MockService.getRawHouseholds,
    teams: MockService.getRawTeams
  }
};
