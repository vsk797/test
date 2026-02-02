import duckdb
from backend.etl.config import SILVER_PATH, GOLD_PATH
from backend.shared.logging_config import get_logger
import polars as pl

logger = get_logger("etl_aggregate")


def aggregate_gold():
    """
    Reads from Silver, aggregates KPIs, and writes to Gold.
    """
    logger.info("aggregation_started", stage="gold")

    try:
        con = duckdb.connect()

        # Register Silver tables as Views for DuckDB
        # Note: DuckDB's delta scan might need the 'delta' extension loaded
        con.execute("INSTALL delta; LOAD delta;")

        silver_households = str(SILVER_PATH / "households")

        # Create Fact Table: Monthly Snapshots
        # Logic: Calculate MoM and YTD flow
        logger.info("building_fact_table", table="fact_household_monthly")
        con.execute(f"""
            CREATE OR REPLACE TABLE fact_household_monthly AS
            SELECT 
                strftime(as_of_date, '%Y%m') as date_key,
                household_id as household_key,
                officer_code as officer_key,
                balance_current as total_deposits,
                (balance_current - balance_prior_month) as net_flow_mom,
                (balance_current - balance_ytd_start) as net_flow_ytd
            FROM delta_scan('{silver_households}')
        """)

        # Write Fact Table to Delta (via Parquet then convert, or use delta-rs writer if DuckDB support is partial)
        # For simplicity in this script, we'll export to Parquet and let a final step convert,
        # or just use DuckDB's experimental delta write if available.
        # We will assume we can write parquet to the Gold path for now, as DuckDB->Delta write is newer.

        # Alternative: Use Polars to read the DuckDB result and write Delta
        fact_df = con.table("fact_household_monthly").pl()

        # Write Gold Fact
        fact_df.write_delta(
            GOLD_PATH / "fact_household_monthly",
            mode="overwrite",
            overwrite_schema=True,
        )
        logger.info(
            "fact_table_written", table="fact_household_monthly", rows=len(fact_df)
        )

        # Calculate Daily KPIs (Bank Wide)
        logger.info("calculating_kpis")
        kpi_df = con.execute(f"""
            SELECT 
                as_of_date as report_date,
                'total_deposits' as kpi_name,
                'Bank' as dimension_type,
                'All' as dimension_value,
                SUM(balance_current) as value
            FROM delta_scan('{silver_households}')
            GROUP BY 1
        """).pl()

        kpi_df.write_delta(
            GOLD_PATH / "agg_kpi_daily", mode="append", overwrite_schema=True
        )
        logger.info(
            "kpis_calculated_and_written", table="agg_kpi_daily", rows=len(kpi_df)
        )

        logger.info("aggregation_completed", stage="gold")

    except Exception as e:
        logger.error("aggregation_failed", error=str(e), exc_info=True)
        raise
