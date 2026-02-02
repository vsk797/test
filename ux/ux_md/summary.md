# Oxford Nexus - Project Summary

## Overview
Oxford Nexus is a React-based executive dashboard for analyzing banking deposit data, officer performance, and household balance trends. It allows users to visualize MoM (Month-over-Month) and YTD (Year-to-Date) changes, track liquidity ratios, and identify data quality issues.

## Technology Stack
- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React State (Local) + TanStack Query
- **Data Visualization**: Recharts (Scatter, Bar, Waterfall, Pie charts)
- **Icons**: Lucide React

## Key Features
1.  **Executive Dashboard**: High-level KPIs for deposits, net flow, and liquidity.
2.  **Officer Performance**: Leaderboards, scatter plots (Growth vs. Liquidity), and detailed metrics per officer.
3.  **Team Analysis**: Aggregated performance metrics for Business Banking, OCF, and Personal Banking.
4.  **Portfolio Flow**: Waterfall charts showing the bridge from prior to current month balances.
5.  **Data Quality**: Automated detection of excel errors, swapped fields, and outliers.
6.  **AI Assistant**: Placeholder for future AI-driven insights (currently using a basic UI).

## Data Processing
- **Source**: Local Excel file (`/data/household-balance-report.xlsx`).
- **Processing**: Client-side parsing using `xlsx` library.
- **Normalization**: Handles inconsistent officer codes/names and currency formatting.
- **Outliers**: Uses IQR (Interquartile Range) to identify and filter outliers in growth data.

## Team Configuration
- **Teams**: Business Banking, OCF (Oxford Capital Finance), Personal Banking.
- **Color Coding**: 
  - Business Banking: Primary Blue
  - OCF: Accent Gold
  - Personal Banking: Secondary Grey

## Project Structure
- `src/pages`: Main application views.
- `src/components/dashboard`: specialized visualizations and widgets.
- `src/lib`: Core logic for data processing and configuration.
- `src/components/ui`: Reusable UI components (shadcn/ui).
