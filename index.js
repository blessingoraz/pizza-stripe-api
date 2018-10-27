/*
 * Primary file for the API
 * 
*/

// Dependencies
const server = require('./lib/server')

// Declare the app
let app = {}

// Init function
app.init = () => {
    // Start the server
    server.init()
}

// Execute 
app.init()

// Export the app
module.exports = app
