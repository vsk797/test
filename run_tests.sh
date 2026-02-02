#!/bin/bash
set -e

echo "Running Backend Tests..."
# Ensure backend dependencies are installed
# pip install -r backend/requirements.txt (or from pyproject.toml)
python -m pytest tests/

echo "Running Frontend Tests..."
cd ux
# Ensure frontend dependencies are installed
# npm install
npm test -- run
