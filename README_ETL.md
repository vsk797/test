# ETL Pipeline Execution Guide

Due to environment restrictions, I cannot execute the shell commands directly. However, I have prepared all the necessary scripts for you to run the end-to-end pipeline.

Please follow these steps in your terminal:

## 1. Install Dependencies
Install the backend dependencies and the tools needed for data generation.

```bash
# Using pip directly (if not using uv)
pip install fastapi uvicorn pydantic pydantic-settings duckdb polars deltalake python-dotenv azure-identity azure-storage-file-datalake structlog rich pandas openpyxl

# OR using uv if you have it
# uv pip install -r backend/pyproject.toml
# uv pip install pandas openpyxl
```

## 2. Generate Dummy Data
I've created a script to generate the Excel file required by the ingestion step.

```bash
python scripts/create_dummy_data.py
```
*This will create `ux/public/data/household-balance-report.xlsx`.*

## 3. Run the ETL Pipeline
Now you can run the full ETL pipeline (Ingest -> Transform -> Aggregate).

```bash
python -m backend.etl.run --stage all
```

## 4. Verify Output
Check the logs in your terminal. You should see structured logs indicating success for each stage:
- `ingestion_completed`
- `transformation_completed`
- `aggregation_completed`

You can then verify the created Delta tables in `lakehouse/bronze`, `lakehouse/silver`, and `lakehouse/gold`.
