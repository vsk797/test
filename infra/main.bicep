targetScope = 'subscription'

@description('The name of the environment (e.g., dev, prod)')
@allowed(['dev', 'prod'])
param environmentName string = 'dev'

@description('The azure location for resources')
param location string = 'eastus2'

@description('The unique suffix for resource names')
param resourceSuffix string = uniqueString(subscription().id, environmentName, location)

resource rg 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: 'rg-oxford-nexus-${environmentName}'
  location: location
}

module resources 'modules/resources.bicep' = {
  scope: rg
  name: 'resources-deployment'
  params: {
    location: location
    environmentName: environmentName
    resourceSuffix: resourceSuffix
  }
}

output acrLoginServer string = resources.outputs.acrLoginServer
output containerAppEnvironmentId string = resources.outputs.containerAppEnvironmentId
