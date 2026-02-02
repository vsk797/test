import argparse
import sys
import traceback
from backend.etl.config import init_lakehouse_dirs
from backend.etl.ingest import ingest_excel_to_bronze
from backend.etl.transform import transform_silver
from backend.etl.aggregate import aggregate_gold
from backend.shared.logging_config import configure_logger, get_logger

logger = get_logger("etl_runner")


def main():
    configure_logger()  # Defaults to JSON for prod, can be parameterized

    parser = argparse.ArgumentParser(description="Oxford Nexus ETL Pipeline")
    parser.add_argument(
        "--stage",
        choices=["all", "ingest", "transform", "aggregate"],
        default="all",
        help="Stage to run",
    )
    args = parser.parse_args()

    logger.info("etl_job_started", stage=args.stage)
    logger.info("init_directories", status="started")
    init_lakehouse_dirs()
    logger.info("init_directories", status="completed")

    try:
        if args.stage in ["all", "ingest"]:
            ingest_excel_to_bronze()

        if args.stage in ["all", "transform"]:
            transform_silver()

        if args.stage in ["all", "aggregate"]:
            aggregate_gold()

        logger.info("etl_job_completed", status="success")

    except Exception as e:
        logger.error("etl_job_failed", error=str(e), exc_info=True)
        sys.exit(1)


if __name__ == "__main__":
    main()
