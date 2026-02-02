import os
from pathlib import Path

# Base paths for the Lakehouse
# In a real app, these would come from env vars or Azure blob paths (abfss://)
BASE_DIR = Path(os.getenv("LAKEHOUSE_ROOT", "./lakehouse"))
BRONZE_PATH = BASE_DIR / "bronze"
SILVER_PATH = BASE_DIR / "silver"
GOLD_PATH = BASE_DIR / "gold"

# Source configuration
# For the transitional phase, we point to the local file in the frontend public dir
SOURCE_FILE_PATH = Path("../../ux/public/data/household-balance-report.xlsx")


# Ensure directories exist for local development
def init_lakehouse_dirs():
    BRONZE_PATH.mkdir(parents=True, exist_ok=True)
    SILVER_PATH.mkdir(parents=True, exist_ok=True)
    GOLD_PATH.mkdir(parents=True, exist_ok=True)
