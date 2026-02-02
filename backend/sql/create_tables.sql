-- Bronze Layer
CREATE SCHEMA IF NOT EXISTS bronze;

CREATE TABLE IF NOT EXISTS bronze.raw_household_balances (
    ingestion_id VARCHAR,
    raw_content JSON,
    source_filename VARCHAR,
    ingestion_timestamp TIMESTAMP
);

-- Silver Layer
CREATE SCHEMA IF NOT EXISTS silver;

CREATE TABLE IF NOT EXISTS silver.teams (
    team_id VARCHAR PRIMARY KEY,
    team_name VARCHAR
);

CREATE TABLE IF NOT EXISTS silver.officers (
    officer_code VARCHAR PRIMARY KEY,
    officer_name VARCHAR,
    team_id VARCHAR REFERENCES silver.teams(team_id),
    status VARCHAR
);

CREATE TABLE IF NOT EXISTS silver.households (
    household_id VARCHAR PRIMARY KEY,
    household_name VARCHAR,
    officer_code VARCHAR REFERENCES silver.officers(officer_code),
    balance_current DECIMAL(18,2),
    balance_prior_month DECIMAL(18,2),
    balance_ytd_start DECIMAL(18,2),
    as_of_date DATE
);

-- Gold Layer
CREATE SCHEMA IF NOT EXISTS gold;

CREATE TABLE IF NOT EXISTS gold.fact_household_monthly (
    date_key INTEGER,
    household_key VARCHAR,
    officer_key VARCHAR,
    team_key VARCHAR,
    total_deposits DECIMAL(18,2),
    net_flow_mom DECIMAL(18,2),
    net_flow_ytd DECIMAL(18,2)
);

CREATE TABLE IF NOT EXISTS gold.dim_officer (
    officer_key VARCHAR PRIMARY KEY,
    current_team VARCHAR,
    effective_date DATE,
    end_date DATE
);

CREATE TABLE IF NOT EXISTS gold.agg_kpi_daily (
    report_date DATE,
    kpi_name VARCHAR,
    dimension_type VARCHAR,
    dimension_value VARCHAR,
    value DECIMAL(18,2)
);
