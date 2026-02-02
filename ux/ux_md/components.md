# Oxford Nexus - Components

## Dashboard Widgets

### `KPICard.tsx`
Displays a single high-level metric.
- **Props**: `title`, `value`, `change` (percent), `trend` ('up'/'down'), `icon`.
- **Features**: Color-coded trend indicators (Green for up, Red for down).

### `WaterfallChart.tsx`
Visualizes the flow of deposits from Prior Month to Current Month.
- **Logic**: Uses a stacked bar chart with transparent segments to create "floating" bars.
- **Segments**: Start -> Increases (Green) -> Decreases (Red) -> End (Gold).

### `OfficerScatterChart.tsx`
A 3-dimensional view of officer performance.
- **X-Axis**: Portfolio Balance.
- **Y-Axis**: Deposit to Loan Ratio (capped at 150%).
- **Bubble Size (Z)**: YTD Growth magnitude.
- **Color**: Green for positive growth, Red for negative.

### `NarrativeCard.tsx`
Generates natural language summaries of the data.
- **Function**: Analyzes the raw data to produce text like "Deposits are up $5M, driven primarily by Business Banking."

### `DashboardFilters.tsx`
Controls the global filtering state.
- **Inputs**: Select dropdowns for Team, Officer, Tier, and Sliders for Min Balance.
- **Output**: Updates the `FilterState` object used by `Index.tsx`.

### `DataQualityReport.tsx`
A dedicated view for data ingestion health.
- **Features**: Lists specific rows with errors (Excel formula errors, swapped columns, zero balances).
- **Stats**: Shows Total Rows vs. Valid Rows vs. Filtered Rows.

## UI Components (`src/components/ui/*`)
Standard **shadcn/ui** components built on Radix UI primitives.
- `Card`, `Button`, `Select`, `Table`, `Dialog`, `Sheet`.
- Customized via `tailwind.config.ts` to match the Oxford Nexus theme.
