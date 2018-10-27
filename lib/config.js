/**
 * Create and export configurations variables
 * 
 */

 // All environments
 const environments = {}

 // Staging environment(Default)
 environments.staging = {
    'httpPort': 3000,
    'httpsPort': 3001,
    'envName': 'staging',
    'hashingSecret': 'thisIsASecret'
 }

 // Production enviroment
 environments.production = {
    'httpPort': 5000,
    'httpsPort': 5001,
    'envName': 'production',
    'hashingSecret': 'thisIsASecret'
 }

 // Determine which env to was specified from CLI
 const currentEnv = typeof process.env.NODE_ENV == 'string' ? process.env.NODE_ENV : ''

 // Check if the environment from CLI is part of the environment object aove, hence default to staging
 const envToExport = typeof environments[currentEnv] == 'object' ? environments[currentEnv] : environments.staging

 // Export the module
 module.exports = envToExport