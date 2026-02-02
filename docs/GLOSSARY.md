# Business Glossary

## Terms

### Officer
**Definition**: A relationship manager responsible for a portfolio of households.
**Attributes**: `officer_code`, `team_id`, `status`.

### Household
**Definition**: A client entity (family or individual) holding one or more accounts.
**Key ID**: `household_id` (6-10 digit unique identifier).

### Net Flow (MoM)
**Definition**: Net Flow Month-over-Month. The change in balance from the prior month's close to the current date, excluding market performance (implied by this dashboard being deposit-focused).
**Formula**: `current_balance - prior_month_balance`.

### Liquidity Ratio
**Definition**: A calculated metric indicating the liquidity coverage of the bank or team.
**Formula**: (Specific formula definition pending business confirmation).

### Ingestion ID
**Definition**: A unique UUID assigned to every row during the ingestion process to track lineage back to the specific source file batch.

### Bronze Layer
**Definition**: The raw data landing zone. Data is stored exactly as received from the source (Excel/SharePoint) with only metadata columns added (`ingestion_id`, `timestamp`).

### Silver Layer
**Definition**: The conformed and cleansed data layer. Data types are cast, validation rules are applied, and duplicates are resolved.

### Gold Layer
**Definition**: The business-level data layer. Optimized for reporting (Star Schema) and API consumption.
