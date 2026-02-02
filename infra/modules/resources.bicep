param location string
param environmentName string
param resourceSuffix string

// 1. Container Registry
resource acr 'Microsoft.ContainerRegistry/registries@2023-01-01-preview' = {
  name: 'acr${resourceSuffix}'
  location: location
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: true
  }
}

// 2. Log Analytics Workspace
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: 'log-${resourceSuffix}'
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
}

// 3. Application Insights
resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: 'appi-${resourceSuffix}'
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalytics.id
  }
}

// 4. Container Apps Environment
resource caEnv 'Microsoft.App/managedEnvironments@2023-05-01' = {
  name: 'cae-${resourceSuffix}'
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalytics.properties.customerId
        sharedKey: logAnalytics.listKeys().primarySharedKey
      }
    }
    workloadProfiles: [
      {
        name: 'Consumption'
        workloadProfileType: 'Consumption'
      }
    ]
  }
}

// 5. Storage Account (Data Lake)
resource storage 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: 'st${resourceSuffix}'
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    isHnsEnabled: true // Hierarchical Namespace for Data Lake Gen2
    accessTier: 'Hot'
  }
}

// 6. Container App Job (ETL Pipeline)
resource etlJob 'Microsoft.App/jobs@2023-05-01' = {
  name: 'job-etl-${environmentName}'
  location: location
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    environmentId: caEnv.id
    configuration: {
      triggerType: 'Schedule'
      scheduleTriggerConfig: {
        cronExpression: '0 2 * * *' # 2 AM Daily
        parallelism: 1
        replicaCompletionCount: 1
      }
      replicaTimeout: 1800 # 30 minutes
      replicaRetryLimit: 1
      registries: [
        {
          server: acr.properties.loginServer
          username: acr.listCredentials().username
          passwordSecretRef: 'acr-password'
        }
      ]
      secrets: [
        {
          name: 'acr-password'
          value: acr.listCredentials().passwords[0].value
        }
        {
          name: 'azure-storage-key'
          value: storage.listKeys().keys[0].value
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'etl-runner'
          image: '${acr.properties.loginServer}/oxford-nexus-backend:latest'
          command: ['python', '-m', 'backend.etl.run', '--stage', 'all']
          env: [
            {
              name: 'LAKEHOUSE_ROOT'
              value: 'abfss://data@${storage.name}.dfs.core.windows.net/'
            }
            {
              name: 'AZURE_STORAGE_ACCOUNT'
              value: storage.name
            }
            {
              name: 'AZURE_STORAGE_KEY'
              secretRef: 'azure-storage-key'
            }
            {
              name: 'OTEL_SERVICE_NAME'
              value: 'etl-pipeline'
            }
            {
              name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
              value: appInsights.properties.ConnectionString
            }
          ]
          resources: {
            cpu: 1.0
            memory: '2.0Gi'
          }
        }
      ]
    }
  }
}

output acrLoginServer string = acr.properties.loginServer
output containerAppEnvironmentId string = caEnv.id
