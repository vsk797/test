# Oxford Nexus Data Catalog

## Domain: Oxford Nexus
**Description**: Data model specification for the Oxford Nexus Lakehouse (Bronze -> Silver -> Gold).

---

## 🥉 Bronze Layer
**Description**: Raw immutable snapshots from source systems (SharePoint/Excel).
**Format**: delta

### Table: `raw_household_balances`
**Source**: `sharepoint/household-balance-report.xlsx`
**Partition By**: `['ingestion_date']`

| Column Name | Type | Description |
|---|---|---|
| `ingestion_id` | `string` | UUID for the ingestion batch |
| `raw_content` | `json` | Full row as JSON from Excel |
| `source_filename` | `string` | Source filename |
| `ingestion_timestamp` | `timestamp` | Timestamp of ingestion |

---

## 🥈 Silver Layer
**Description**: Cleaned, validated, and typed data with enforced schemas.
**Format**: delta

### Table: `households`
**Primary Key**: `household_id`

| Column Name | Type | Description | Validation | Foreign Key |
|---|---|---|---|---|
| `household_id` | `string` | - | `regex(^\d{6,10}$)` | - |
| `household_name` | `string` | - | - | - |
| `officer_code` | `string` | - | - | `officers.officer_code` |
| `balance_current` | `decimal(18,2)` | - | - | - |
| `balance_prior_month` | `decimal(18,2)` | - | - | - |
| `balance_ytd_start` | `decimal(18,2)` | - | - | - |
| `as_of_date` | `date` | - | - | - |

### Table: `officers`
**Primary Key**: `officer_code`

| Column Name | Type | Description | Validation | Foreign Key |
|---|---|---|---|---|
| `officer_code` | `string` | - | - | - |
| `officer_name` | `string` | - | - | - |
| `team_id` | `string` | - | - | `teams.team_id` |
| `status` | `string` | - | `enum: [Active, Inactive]` | - |

### Table: `teams`
**Primary Key**: `team_id`

| Column Name | Type | Description | Validation | Foreign Key |
|---|---|---|---|---|
| `team_id` | `string` | - | `enum: [BB, OCF, PB]` | - |
| `team_name` | `string` | - | - | - |

---

## 🥇 Gold Layer
**Description**: Semantic model for consumption by FastAPI (Facts & Dimensions).
**Format**: delta

### Table: `fact_household_monthly`
**Description**: Monthly snapshots of household performance.
**Granularity**: monthly

| Column Name | Type | Description | Formula | Example |
|---|---|---|---|---|
| `date_key` | `integer` | - | - | `202401` |
| `household_key` | `string` | - | - | - |
| `officer_key` | `string` | - | - | - |
| `team_key` | `string` | - | - | - |
| `total_deposits` | `decimal(18,2)` | - | - | - |
| `net_flow_mom` | `decimal(18,2)` | - | `balance_current - balance_prior_month` | - |
| `net_flow_ytd` | `decimal(18,2)` | - | `balance_current - balance_ytd_start` | - |

### Table: `dim_officer`
**Description**: Slowly Changing Dimension (Type 2) for officers.

| Column Name | Type | Description |
|---|---|---|
| `officer_key` | `string` | - |
| `current_team` | `string` | - |
| `effective_date` | `date` | - |
| `end_date` | `date` | - |

### Table: `agg_kpi_daily`
**Description**: Pre-calculated daily KPIs for the dashboard.

| Column Name | Type | Description | Enum |
|---|---|---|---|
| `report_date` | `date` | - | - |
| `kpi_name` | `string` | - | `[total_deposits, net_flow_mom, liquidity_ratio]` |
| `dimension_type` | `string` | - | `[Bank, Team, Officer]` |
| `dimension_value` | `string` | - | - |
| `value` | `decimal(18,2)` | - | - |
