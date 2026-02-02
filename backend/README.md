# Backend - Oxford Nexus

This directory contains the FastAPI backend and ETL pipeline for Oxford Nexus.

## Setup

1. Install Python 3.13+.
2. Install dependencies:
   ```bash
   pip install -e .
   ```

## ETL Pipeline

The ETL pipeline ingests the Excel report and processes it into a Delta Lakehouse (Bronze/Silver/Gold).

### Running the ETL

To run the full pipeline:
```bash
python -m backend.etl.run
```

To run a specific stage:
```bash
python -m backend.etl.run --stage ingest
python -m backend.etl.run --stage transform
python -m backend.etl.run --stage aggregate
```

### Configuration

See `backend/etl/config.py` for path configurations. By default, it looks for the Excel file in `../../ux/public/data/`.

## API

(Coming soon)
