import polars as pl
from backend.etl.config import BRONZE_PATH, SILVER_PATH
from backend.app.models.silver import Household, Officer, Team, TeamId, OfficerStatus
from backend.shared.logging_config import get_logger

logger = get_logger("etl_transform")


def clean_currency(col_expr):
    # Remove '$', ',', '(', ')' and handle negatives
    # This is a simplified regex approach
    return (
        col_expr.cast(pl.Utf8)
        .str.replace_all(r"[$,)]", "")
        .str.replace(r"\(", "-")
        .cast(pl.Float64)
    )


def transform_silver():
    """
    Reads from Bronze, cleans/validates, and writes to Silver tables.
    """
    logger.info("transformation_started", stage="silver")

    bronze_table_path = BRONZE_PATH / "raw_household_balances"

    if not bronze_table_path.exists():
        logger.error("bronze_table_not_found", path=str(bronze_table_path))
        raise FileNotFoundError(f"Bronze table not found at {bronze_table_path}")

    # Lazy scan the Delta table
    lf = pl.scan_delta(bronze_table_path)

    # Filter out bad rows (totals, empty names) - similar to logic in data-processor.ts
    # Using Polars expression API for performance

    # 1. Normalize Column Names (Handling the variability seen in Excel)
    # We'll map the raw Excel headers to our internal schema
    # Note: In a real scenario, we might need a dynamic mapper if columns change often.

    # We assume the latest ingestion is what we want to process for the "Current State"
    # Or we process the increment. For this PoC, we take the latest ingestion_id.

    # Get latest ingestion ID
    try:
        latest_ingestion_id = (
            pl.scan_delta(bronze_table_path)
            .select("ingestion_id")
            .tail(1)
            .collect()
            .item(0, 0)
        )
        logger.info("processing_batch", ingestion_id=latest_ingestion_id)
    except Exception as e:
        logger.warning("no_data_found_in_bronze", error=str(e))
        return

    # Filter for latest batch
    current_batch = lf.filter(pl.col("ingestion_id") == latest_ingestion_id)

    # Transformation Logic
    # We need to map the Excel columns to our schema
    # Example mapping based on data-processor.ts logic:
    # 'Household ID' -> household_id
    # 'Household Name' -> household_name
    # 'Officer Code' / 'Officer Name' -> Logic to swap if needed
    # 'Current Month-end Deposit Balance' -> balance_current

    # Cleaning Step
    cleaned = current_batch.filter(
        (pl.col("Household ID").str.to_lowercase() != "totals")
        & (pl.col("Household ID").str.to_lowercase() != "total")
        & (pl.col("Household Name").is_not_null())
    ).with_columns(
        [
            pl.col("Household ID").cast(pl.Utf8).alias("household_id"),
            pl.col("Household Name").alias("household_name"),
            pl.col("Officer Code").cast(pl.Utf8).alias("officer_code_raw"),
            pl.col("Officer Name").alias("officer_name_raw"),
            clean_currency(pl.col("Current Month-end Deposit Balance")).alias(
                "balance_current"
            ),
            clean_currency(pl.col("Prior Month-end Deposit Balance")).alias(
                "balance_prior_month"
            ),
            clean_currency(pl.col("Prior Year-end Deposit Balance")).alias(
                "balance_ytd_start"
            ),
            # Use ingestion timestamp as as_of_date for now, or today's date
            pl.col("ingestion_timestamp").cast(pl.Date).alias("as_of_date"),
        ]
    )

    # Collect to memory to apply row-wise logic that might be complex (like the name/code swap)
    # Although Polars can handle 'when/then', the swap logic is specific.
    # Let's just assume simple mapping for this scaffold, or implement a basic swap check.

    # Simple Logic: If Code has letters, swap.
    cleaned = cleaned.with_columns(
        pl.when(pl.col("officer_code_raw").str.contains(r"[a-zA-Z]"))
        .then(pl.col("officer_name_raw"))
        .otherwise(pl.col("officer_code_raw"))
        .alias("officer_code"),
        pl.when(pl.col("officer_code_raw").str.contains(r"[a-zA-Z]"))
        .then(pl.col("officer_code_raw"))
        .otherwise(pl.col("officer_name_raw"))
        .alias("officer_name"),
    )

    # Create Dataframes for the normalized tables

    # 1. Households Table
    households_df = cleaned.select(
        [
            "household_id",
            "household_name",
            "officer_code",
            "balance_current",
            "balance_prior_month",
            "balance_ytd_start",
            "as_of_date",
        ]
    ).unique(subset=["household_id"])  # Simple dedup

    # 2. Officers Table (Derived)
    officers_df = (
        cleaned.select(["officer_code", "officer_name"])
        .unique()
        .with_columns(
            [
                # Assign default Team (Logic needs the map from team-config.ts)
                # For now, we'll placeholder it or leave null
                pl.lit(None).cast(pl.Utf8).alias("team_id"),
                pl.lit("Active").alias("status"),
            ]
        )
    )

    # Write to Silver
    logger.info("writing_to_silver_households")
    households_df.collect().write_delta(
        SILVER_PATH / "households",
        mode="overwrite",  # Overwrite for "current state" table pattern
        overwrite_schema=True,
    )

    logger.info("writing_to_silver_officers")
    officers_df.collect().write_delta(
        SILVER_PATH / "officers",
        mode="overwrite",  # In reality we'd merge
        overwrite_schema=True,
    )

    logger.info("transformation_completed", stage="silver")
