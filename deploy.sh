#!/bin/bash
set -e

# Configuration
LOCATION="eastus2"
ENV_NAME="dev"
SUB_ID=$(az account show --query id -o tsv)

echo "Deploying to Subscription: $SUB_ID"
echo "Location: $LOCATION"
echo "Environment: $ENV_NAME"

# Login check
az account show > /dev/null || az login

# Deploy Infrastructure
echo "Running Bicep Deployment..."
az deployment sub create \
  --location $LOCATION \
  --template-file infra/main.bicep \
  --parameters environmentName=$ENV_NAME location=$LOCATION

echo "Deployment finished."
echo "Don't forget to push the Docker image to the new ACR!"
