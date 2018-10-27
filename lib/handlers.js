/**
 * Request handlers
 * 
 */

 // Dependencies
 const _data = require('./data')
 const helpers = require('./helpers')
 const config = require('./config')
 
 // Define handlers 
 let handlers = {}

 // USERS HANDLER
handlers.users = (data, callback) => {
    let acceptableMethods = ['post', 'get', 'put', 'delete']
    if(acceptableMethods.indexOf(data.method) > -1) {
        console.log('hot here ====')
        // handlers._users[data.method](data, callback)
    } else {
        callback(405) // Method not allowed
    }
}

// TOKENS HANDLER
handlers.tokens = (data, callback) => {
    let acceptableMethods = ['post', 'get', 'put', 'delete']
    if(acceptableMethods.indexOf(data.method) > -1) {
        // handlers._tokens[data.method](data, callback)
    } else {
        callback(405) // Method not allowed
    }
}

// MENUITEMS HANDLER
handlers.menuItems = (data, callback) => {
    let acceptableMethods = ['post', 'get', 'put', 'delete']
    if(acceptableMethods.indexOf(data.method) > -1) {
        // handlers._menuItems[data.method](data, callback)
    } else {
        callback(405) // Method not allowed
    }
}

// ORDERS HANDLER
handlers.orders = (data, callback) => {
    let acceptableMethods = ['post', 'get', 'put', 'delete']
    if(acceptableMethods.indexOf(data.method) > -1) {
        // handlers._orders[data.method](data, callback)
    } else {
        callback(405) // Method not allowed
    }
}

// Not found handler
handlers.notFound = (data, callback) => {
    callback(404)
}

module.exports = handlers