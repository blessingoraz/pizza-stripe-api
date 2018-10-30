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
    
    // Check for optional fields
    const name = typeof data.payload.name == 'string' && data.payload.name.trim().length > 0
        ? data.payload.name.trim() : false
    
    const password = typeof data.payload.password == 'string' && data.payload.password.trim().length > 0
        ? data.payload.password.trim() : false
    
    const street = typeof data.payload.street == 'number' && data.payload.street % 1 == 0 && data.payload.street > 0
        ? data.payload.street : false

    const address = typeof data.payload.address == 'string' && data.payload.address.trim().length > 0
        ? data.payload.address.trim() : false
    
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
                            if(street) {
                                userData.street = street
                            }
                            if(password) {
                                userData.hashedPassword = helpers.hash(password)
                            }
                            // Store the new update
                            _data.update('users', email, userData, (err) => {
                                if(!err) {
                                    callback(200)
                                } else {
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
        callback(400, {'Error': 'Missing required field'})
    }
}

/**
 * USERS - DELETE
 * Required data: email
 * @param {*} data 
 * @param {*} callback 
 */
handlers._users.delete = (data, callback) => {
    // Check the email is valid
    let email = typeof data.queryStringObject.email == 'string' && data.queryStringObject.email.trim().length > 0 && helpers.validateEmail(data.queryStringObject.email)
        ? data.queryStringObject.email.trim() : false

    if(email) {
        // Get the token from the headers
        const token = typeof data.headers.token == 'string' ? data.headers.token : false
        // Verify that the given token is valid for the email
         handlers._tokens.verifyTokens(token, email, (tokenIsValid) => {
            if(tokenIsValid) {
                // Lookup user
                _data.read('users', email, (err, userData) => {
                    if(!err && userData) {
                        _data.delete('users', email, (err) => {
                            if(!err) {
                               callback(200, {'Success': 'User was successfully deleted'})
                            } else {
                                callback(500, {'Error': 'Could not delete the specified user'})
                            }
                        })
                    } else {
                        callback(400, {'Error': 'Could not find the user'})
                    }
                })
            } else {
                callback(403, {'Error': 'Missing required token in header or token is invalid'})
            }
         })
    } else {
        callback(400, {'Error': 'Missing required field'})
    }
}

// TOKENS HANDLER
handlers.tokens = (data, callback) => {
    let acceptableMethods = ['post', 'get', 'put', 'delete']
    if(acceptableMethods.indexOf(data.method) > -1) {
        handlers._tokens[data.method](data, callback)
    } else {
        callback(405) // Method not allowed
    }
}

// Container for all methods
handlers._tokens = {}

/**
 * TOKENS - POST
 * Required data: email, password
 * @param {*} data 
 * @param {*} callback 
 */
handlers._tokens.post = (data, callback) => {
    const email = typeof data.payload.email == 'string' && data.payload.email.trim().length > 0 && helpers.validateEmail(data.payload.email)
        ? data.payload.email.trim() : false
    
    const password = typeof data.payload.password == 'string' && data.payload.password.trim().length > 1 ?
        data.payload.password.trim() : false

    if (email && password) {
        // Lookup users that match the email and password
        _data.read('users', email, (err, userData) => {
            if(!err) {
                // Hash the password sent and compare it to the one us user data obj
                const hashedPassword = helpers.hash(password)
                if(hashedPassword == userData.hashedPassword) {
                    // If valid, create a token with random string that has an expiration date of 1 hour from the time it was created
                    const tokenId = helpers.createRandomString(20)
                    const expires = Date.now() + 1000 * 60 * 60
                    let tokenObj = {
                        email,
                        id: tokenId,
                        expires
                    }

                    // Store the token
                    _data.create('tokens', tokenId, tokenObj, (err) => {
                        if(!err) {
                            callback(200, tokenObj)
                        } else {
                            callback(500, {'Error': 'Could not create token'})
                        }
                    })
                } else {
                    callback(400, {'Error': 'Password did not match the user\'s stored password'})
                }
            } else {
                callback(400, {'Error': 'Could not find the specified user'})
            }
        })

    } else {
        callback(400, {'Error': 'Missing required fields'})
    }
}

/**
 * TOKENS - GET
 * Required data: id
 * @param {*} data 
 * @param {*} callback 
 */
handlers._tokens.get = (data, callback) => {
    // Check that the id is valid
    let id = typeof data.queryStringObject.id == 'string' && data.queryStringObject.id.trim().length == 20
        ? data.queryStringObject.id.trim() : false

    if(id) {
        // Lookup token
        _data.read('tokens', id, (err, tokenData) => {
            if(!err && tokenData) {
                callback(200, tokenData)
            } else {
                callback(404, {'Error': 'Token doesn\'t exist'})
            }
        })
    } else {
        callback(400, {'Error': 'Missing required field'})
    }
}

/**
 * TOKENS - PUT
 * Required data: id, extend
 * @param {*} data 
 * @param {*} callback
 */
handlers._tokens.put = (data, callback) => {
    // Check that the id is valid
    let id = typeof data.payload.id == 'string' && data.payload.id.trim().length == 20
        ? data.payload.id.trim() : false
    
    let extend = typeof data.payload.extend == 'boolean' && data.payload.extend == true
        ? true : false
    
    if(id && extend) {
        // Lookup the token
        _data.read('tokens', id, (err, tokenData) => {
            if(!err && tokenData) {
                // Check to make sure token is not expired
                if(tokenData.expires > Date.now()) {
                    // Set expiration of 1 hour from the time it was created
                    tokenData.expires = Date.now() + 1000 * 60 * 60

                    // Store new update
                    _data.update('tokens', id, tokenData, (err) => {
                        if(!err) {
                            callback(200)
                        } else {
                            callback(500, {'Error': 'Could not update token\s expiration'})
                        }
                    })
                } else {
                    callback(400, {'Error': 'Token has already expired'})
                }
            } else {
                callback(400, {'Error': ''})
            }
        })
    } else {
        callback(400, {'Errror': 'Missing required fields or fields are invalid '})
    }
}

/**
 * TOKENS - DELETE
 * Required data: id, extend
 * @param {*} data 
 * @param {*} callback
 */
handlers._tokens.delete = (data, callback) => {
    // Check the id is valid
    let id = typeof data.queryStringObject.id == 'string' && data.queryStringObject.id.trim().length == 20
        ? data.queryStringObject.id.trim() : false

    if(id) {
        // Lookup id
        _data.read('tokens', id, (err, data) => {
            if(!err && data) {
                _data.delete('tokens', id, (err) => {
                    if(!err) {
                        callback(200, {'Success': 'Token was successfully deleted'})
                    } else {
                        callback(500, {'Error': 'Could not delete the specified token'})
                    }
                })
            } else {
                callback(400, {'Error': 'Could not find the token'})
            }
        })
    } else {
        callback(400, {'Error': 'Missing required field'})
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
        handlers._menuItems[data.method](data, callback)
    } else {
        callback(405) // Method not allowed
    }
}

// Container for all methods
handlers._menuItems = {}

/**
 * MENUITEM - POST
 * Required data: name, toppings
 * @param {*} data 
 * @param {*} callback
 */
handlers._menuItems.post = (data, callback) => {
    // Check required data
    const name = typeof data.payload.name == 'string' && data.payload.name.trim().length > 0 ? 
        data.payload.name.trim() : false
    
    const toppings = typeof data.payload.toppings == 'object' && data.payload.toppings instanceof Array && data.payload.toppings.length > 0 ?
        data.payload.toppings : false
    
    // If name and toppings are valid
    if(name && toppings) {
        // If valid, create an id with random string 
        const menuId = helpers.createRandomString(20)
        const menuObj = {
            id: menuId,
            name,
            toppings
        }

         // Store the token
        _data.create('menuItems', menuId, menuObj, (err) => {
            if(!err) {
                callback(200, menuObj)
            } else {
                callback(500, {'Error': 'Could not create menu item'})
            }
        })

    } else {
        callback(400, {'Error': 'Missing required field'})
    }
}

/**
 * MENUITEM - GET
 * Required data: none
 * @param {*} data 
 * @param {*} callback
 */
handlers._menuItems.get = (data, callback) => {
    // Get all menuItems
    _data.list('menuItems', (err, menuItems) => {
        let menuItemList = []

        if(!err && menuItems && menuItems.length > 0) {
            menuItems.forEach((menuItem) => {
                // Read the menu item data
                _data.read('menuItems', menuItem, (err, orginalMenuItem) => {
                    if(!err && orginalMenuItem) {
                        menuItemList.push(orginalMenuItem)

                    } else {
                        callback(500, {'Error': 'Could not read menu items'})
                    }
                })
            })
            //TODO: Check the menulist
            callback(200, menuItemList)
        } else {
            callback(400, {'Error': 'Could not get menuItems'} )
        }
    })
}

/**
 * MENUITEM - PUT
 * Required data: id
 * @param {*} data 
 * @param {*} callback
 */
handlers._menuItems.put = (data, callback) => {
    // Check if id is valid
    const id = typeof data.queryStringObject.id == 'string' && data.queryStringObject.id.trim().length == 20 ?
        data.queryStringObject.id.trim() : false
    
    // Check for optional fields
    const name = typeof data.payload.name == 'string' && data.payload.name.trim().length > 0
        ? data.payload.name.trim() : false

    const toppings = typeof data.payload.toppings == 'object' && data.payload.toppings instanceof Array && data.payload.toppings.length > 0
        ? data.payload.toppings : false
    
    if(id) {
        if(name || toppings) {
            // Lookup the menuItem
            _data.read('menuItems', id, (err, menuItemData) => {
                if(!err && menuItemData) {
                    if(name) {
                        menuItemData.name = name
                    }
                    if(toppings) {
                        menuItemData.toppings = toppings
                    }
                    // Store the new update
                    _data.update('menuItems', id, menuItemData, (err) => {
                        if(!err) {
                            callback(200)
                        } else {
                            callback(500, {'Error': 'Could not update menu item'})
                        }
                    })
                } else {
                    callback(400, {'Error': 'This menu item does not exist'})
                }
            })
        }
    } else {
        callback(400, {'Error': 'Missing required field'})
    }
}

/**
 * MENUITEM - DELETE
 * Required data: id
 * @param {*} data 
 * @param {*} callback
 */
 handlers._menuItems.delete = (data, callback) => {
    // Check that id is valid
    const id = typeof data.queryStringObject.id == 'string' && data.queryStringObject.id.trim().length == 20 ?
        data.queryStringObject.id.trim() : false
    
    if(id) {
        //Lookup menu item
        _data.read('menuItems', id, (err, menuItemData) => {
            if(!err && menuItemData) {
                _data.delete('menuItems', id, (err) => {
                    if(!err) {
                        callback(200, {'Succes': 'Menu item was successfully deleted'})
                    } else {
                        callback(500, {'Error': 'Could not delete the specified menu item'})
                    }
                })
            } else {
                callback(400, {'Error': 'Could not find token'})
            }
        })
    } else {
        callback(400, {'Error': 'Missing required field'})
    }
 }

// ORDERS HANDLER
handlers.orders = (data, callback) => {
    let acceptableMethods = ['post', 'get', 'put', 'delete']
    if(acceptableMethods.indexOf(data.method) > -1) {
        handlers._orders[data.method](data, callback)
    } else {
        callback(405) // Method not allowed
    }
}

// Containers for orders sub-methods
handlers._orders = {}
/**
 * ORDERS - POST
 * Required data: email,menuId, size, quantity
 * @param {*} data 
 * @param {*} callback 
 */
handlers._orders.post = (data, callback) => {
    // Check all required fields are present
    const email = typeof data.queryStringObject.email == 'string' && data.queryStringObject.email.trim().length > 0 && helpers.validateEmail(data.queryStringObject.email)
        ? data.queryStringObject.email.trim() : false
    
    const menuId = typeof data.payload.menuId == 'string' && data.payload.menuId.trim().length > 0
        ? data.payload.menuId.trim() : false
    
    const size = typeof data.payload.size == 'string' && ['small', 'medium', 'large'].indexOf(data.payload.size) > -1
        ? data.payload.size : false
    
    const quantity = typeof data.payload.quantity == 'number' && data.payload.quantity % 1 == 0 &&
        data.payload.quantity >= 1 && data.payload.quantity <= 5 ? data.payload.quantity : false

    if(email && menuId && size && quantity) {
        // Get the token from the headers
        const token = typeof data.headers.token == 'string' ? data.headers.token : false
        // Verify that the token is vlaid for the email
        handlers._tokens.verifyTokens(token, email, (tokenIsValid) => {
            if(tokenIsValid) {
                //Get menu data using menuId
                _data.read('menuItems', menuId, (err, menuItemData) => {
                    if(!err) {
                        // Create an orderID with random string
                        const orderId = helpers.createRandomString(20)
                        const orderObj = {
                            orderId,
                            email,
                            size,
                            quantity,
                            menu: menuItemData
                        }

                        // Store the order
                        _data.create('orders', orderId, orderObj, (err) => {
                            if(!err) {
                                callback(200, orderObj)
                            } else {
                                callback(400, {'Error': 'Could not create the order'})
                            }
                        })
                    } else {
                        callback(404, {'Error': 'Menu item with id does not exist'})
                    }
                })  
            } else {
                callback(403, {'Error': 'Missing required token in header or token is invalid'})
            }
        })
    } else {
        callback(400, {'Error': 'Missing required fields or email is not valid'})
    }
}

/**
 * ORDERS - GET
 * Required data: email
 * @param {*} data 
 * @param {*} callback 
 */
handlers._orders.get = (data, callback) => {
    // Check that the email is valid
    let email = typeof data.queryStringObject.email == 'string' && data.queryStringObject.email.trim().length > 0 && helpers.validateEmail(data.queryStringObject.email)
        ? data.queryStringObject.email.trim() : false

    if(email) {
        // Get the token from the headers
        const token = typeof data.headers.token == 'string' ? data.headers.token : false
        // Verify that the given token is valid for the email
         handlers._tokens.verifyTokens(token, email, (tokenIsValid) => {
            if(tokenIsValid) {
                // Lookup orders
                _data.list('orders', (err, orders) => {
                    let userOrdersList = []
            
                    if(!err && orders && orders.length > 0) {
                        orders.forEach((order) => {
                            // Read the menu item data
                            _data.read('orders', order, (err, originalOrder) => {
                                if(!err && originalOrder.email == email) {
                                    // Remove the user email
                                    delete originalOrder.email
                                    userOrdersList.push(originalOrder)

                                } else {
                                    callback(500, {'Error': 'Could not read menu items'})
                                }
                            })
                        })
                        //TODO: Check the orderList
                        callback(200, userOrdersList)
                    } else {
                        callback(400, {'Error': 'Could not get menuItems'} )
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

// Not found handler
handlers.notFound = (data, callback) => {
    callback(404)
}

module.exports = handlers