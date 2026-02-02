# Oxford Nexus - Pages

## Main Dashboard (`Index.tsx`)
The primary entry point for the application. It serves as a container for all dashboard widgets and manages the global state for data loading.

### Key Responsibilities
- **Data Loading**: Fetches and parses the Excel data on mount using `loadHouseholdData`.
- **State Management**: Holds `households`, `officers`, `teams`, and `filters` state.
- **Layout**: Arranges the dashboard into logical sections:
    1.  **Header**: App title and last updated date.
    2.  **Filters**: Global filters for Team, Officer, Balance Tier, etc.
    3.  **Bank Overview**: High-level bank summaries.
    4.  **KPI Cards**: 4 key metrics (Total Deposits, Net Flow MoM/YTD, Liquidity).
    5.  **Portfolio Flow**: Waterfall chart for month-over-month bridge.
    6.  **Team & Officer Performance**: Detailed charts and tables.
    7.  **Concentration & Risk**: Top household analysis.
    8.  **Action Items**: Attrition and gainers lists.
    9.  **Data Quality**: Report on data ingestion issues.

### Hooks & Data Flow
- `useEffect` triggers the async data load.
- Data is processed into `officerMetrics` and `teamMetrics` immediately after loading.
- `filteredOfficers` are derived from the main `officers` state based on active filters.

## Application Root (`App.tsx`)
Sets up the global providers and routing.
- **Providers**: `QueryClientProvider`, `TooltipProvider`.
- **Routing**: `react-router-dom` handles navigation (currently single page + 404).
- **Toasts**: Configures Sonner and standard Toaster for notifications.
