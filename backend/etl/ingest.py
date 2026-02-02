import polars as pl
import uuid
from datetime import datetime
from backend.etl.config import BRONZE_PATH, SOURCE_FILE_PATH
from backend.shared.logging_config import get_logger

logger = get_logger("etl_ingest")


def ingest_excel_to_bronze():
    """
    Reads the Excel file and saves it as a raw Delta table in the Bronze layer.
    """
    logger.info("ingestion_started", source=str(SOURCE_FILE_PATH))

    if not SOURCE_FILE_PATH.exists():
        logger.error("source_file_not_found", path=str(SOURCE_FILE_PATH))
        raise FileNotFoundError(f"Source file not found: {SOURCE_FILE_PATH}")

    # Read Excel using Polars
    # Note: Requires 'fastexcel' or 'openpyxl' or 'xlsx2csv' installed in the environment
    try:
        df = pl.read_excel(source=SOURCE_FILE_PATH)
        row_count = len(df)
        logger.info("excel_read_success", row_count=row_count)
    except Exception as e:
        logger.error("excel_read_failed", error=str(e))
        raise

    # Add ingestion metadata
    ingestion_id = str(uuid.uuid4())
    timestamp = datetime.now()

    # We want to store the "raw content" ideally as JSON or similar struct
    # For Delta, we can store the columns as is, but mark them as raw.
    # Alternatively, to strictly follow the spec "raw_content: json", we could pack it.
    # For this implementation, we'll store the flattened columns but add metadata columns.

    df_with_meta = df.with_columns(
        [
            pl.lit(ingestion_id).alias("ingestion_id"),
            pl.lit(SOURCE_FILE_PATH.name).alias("source_filename"),
            pl.lit(timestamp).alias("ingestion_timestamp"),
        ]
    )

    output_path = BRONZE_PATH / "raw_household_balances"

    # Write to Delta Lake
    logger.info("writing_to_bronze", path=str(output_path))
    df_with_meta.write_delta(
        output_path,
        mode="append",  # Append for history, though usually raw is append-only
        overwrite_schema=True,  # Allow schema evolution if excel columns change
    )

    logger.info(
        "ingestion_completed", ingestion_id=ingestion_id, rows_ingested=row_count
    )
    return output_path
