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
        handlers._users[data.method](data, callback)
    } else {
        callback(405) // Method not allowed
    }
}

// Containers for the users sub-methods
handlers._users = {}

/**
 * USERS - POST
 * Required data: name, email, password, street, address
 * @param {*} data 
 * @param {*} callback 
 */
handlers._users.post = (data, callback) => { 
    // Check all required fields are present
    const name = typeof data.payload.name == 'string' && data.payload.name.trim().length > 0
        ? data.payload.name.trim() : false
    
    const email = typeof data.payload.email == 'string' && data.payload.email.trim().length > 0 && helpers.validateEmail(data.payload.email)
        ? data.payload.email.trim() : false
        
    const password = typeof data.payload.password == 'string' && data.payload.password.trim().length > 0
        ? data.payload.password.trim() : false
    
    const street = typeof data.payload.street == 'number' && data.payload.street % 1 == 0 && data.payload.street > 0
        ? data.payload.street : false

    const address = typeof data.payload.address == 'string' && data.payload.address.trim().length > 0
        ? data.payload.address.trim() : false
    
    const admin = typeof data.payload.admin == 'boolean' && data.payload.admin == true
        ? true : false
    
    if(name && email && password && street && address) {
        // Make sure user doesn't exist
        _data.read('users', email, (err, data) => {
            if(err) {
                // Hash the password
                const hashedPassword = helpers.hash(password)
                // Create user object
                if (hashedPassword) {
                    const userObject = {
                        name,
                        email,
                        hashedPassword,
                        street,
                        address,
                        admin
                    }
                     // Store user
                    _data.create('users', email, userObject, (err) => {
                        if(!err) {
                            callback(200)
                        } else {
                            callback(500, {'Error': 'Could not create the user'})
                        }
                    })
                } else {
                    callback(500, {'Error': 'Could not hash user\'s password'})
                }
            } else {
                // User already exist
                callback(400, {'Error': 'A user with the email address already exist'})
            }
        })
    } else {
        callback(400, {'Error': 'Missing required fields or Email is not valid'})
    }
}

/**
 * USERS - GET
 * Required data: email
 * @param {*} data 
 * @param {*} callback 
 */
handlers._users.get = (data, callback) => {
    // Check that the email is valid
    let email = typeof data.queryStringObject.email == 'string' && data.queryStringObject.email.trim().length > 0 && helpers.validateEmail(data.queryStringObject.email)
        ? data.queryStringObject.email.trim() : false

    if(email) {
        // Get the token from the headers
        const token = typeof data.headers.token == 'string' ? data.headers.token : false
        // Verify that the given token is valid for the email
         handlers._tokens.verifyTokens(token, email, (tokenIsValid) => {
            if(tokenIsValid) {
                // Lookup user
                _data.read('users', email, (err, data) => {
                    if(!err && data) {
                        // Remove the hashedpassword from user object before returning the object as a response
                        delete data.hashedPassword
                        callback(200, data)
                    } else {
                        callback(404, {'Error': 'User doesn\'t exist'})
                    }
                })
            } else {
                callback(403, {'Error': 'Missing required token in header or token is invalid'})
            }
         })
    } else {
        callback(400, {'Error': 'Missing required field or Email is not valid'})
    }
}

/**
 * USERS - PUT
 * Required data: email
 * Optional data: name, street, address, password
 * @param {*} data 
 * @param {*} callback 
 */
handlers._users.put = (data, callback) => {
    let email = typeof data.queryStringObject.email == 'string' && data.queryStringObject.email.trim().length > 0 && helpers.validateEmail(data.queryStringObject.email)
        ? data.queryStringObject.email.trim() : false

    const isAdim = typeof data.queryStringObject.admin == 'boolean' && data.queryStringObject.admin == true
        ? true : false
    
    // Check for optional fields
    const name = typeof data.payload.name == 'string' && data.payload.name.trim().length > 0
        ? data.payload.name.trim() : false
    
    const password = typeof data.payload.password == 'string' && data.payload.password.trim().length > 0
        ? data.payload.password.trim() : false
    
    const street = typeof data.payload.street == 'number' && data.payload.street % 1 == 0 && data.payload.street > 0
        ? data.payload.street : false

    const address = typeof data.payload.address == 'string' && data.payload.address.trim().length > 0
        ? data.payload.address.trim() : false
    
    const admin = typeof data.queryStringObject.admin == 'boolean' && data.queryStringObject.admin == true
        ? true : false
    
    // Error if the email is invalid
    if(email) {
        // Error if nothing is sent to update
        if(name || street || address || password) {
            // Get the token from the headers
            const token = typeof data.headers.token == 'string' ? data.headers.token : false
            // Verify that the given token is valid for the email
            handlers._tokens.verifyTokens(token, email, (tokenIsValid) => {
                if(tokenIsValid) {
                    //Lookup the user
                    _data.read('users', email, (err, userData) => {
                        if(!err && userData) {
                            if(name) {
                                userData.name = name
                            }
                            if(street) {
                                userData.street = street
                            }
                            if(admin) {
                                userData.admin = admin
                            }
                            if(street) {
                                userData.street = street
                            }
                            if(password) {
                                userData.hashedPassword = helpers.hash(password)
                            }
                            // Store the new update
                            _data.update('users', phone, userData, (err) => {
                                if(!err) {
                                    callback(200)
                                } else {
                                    console.log(err)
                                    callback(500, {'Error': 'Could not update user'}) // 500 because nothing is wrong with user's request
                                }
                            })
                        } else {
                            callback(400, {'Error': 'This user does not exist'}) // No 404 on a put
                        }
                    })
                } else {
                    callback(403, {'Error': 'Missing required token in header or token is invalid'})
                }
            })
        } else {
            callback(400, {'Error': 'Missing fields to update'})
        }
    } else {
        callback(400, {Error: 'Missing required field'})
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

// Verify if a given token is valid for a user
handlers._tokens.verifyTokens = (id, email, callback) => {
    _data.read('tokens', id, (err, tokenData) => {
        if(!err && tokenData) {
            // check if token is for given user and it isn't expired
            if(tokenData.email == email && tokenData.expires > Date.now()) {
                callback(true)
            } else {
                callback(false)
            }
        } else {
           callback(false)
        }
    })
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