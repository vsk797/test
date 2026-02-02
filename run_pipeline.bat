# Run this script to execute the full workflow setup and run

# 1. Generate Data
echo "Generating dummy data..."
python scripts/create_dummy_data.py

# 2. Run ETL
echo "Running ETL Pipeline..."
python -m backend.etl.run --stage all

echo "Done!"
