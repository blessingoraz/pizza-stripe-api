/**
 * Server related tasks
 * 
 */

// Dependencies
const http = require('http')
const https = require('https')
const url = require('url')
const fs = require('fs')
const path = require('path')
const StringDecoder = require('string_decoder').StringDecoder

const config = require('./config')
// const handlers = require('./handlers')
const helpers = require('./helpers')

const util = require('util')
const debug = util.debuglog('server')

// Instantiate the server module object
let server = {}

// Instatiate HTTP server
server.httpServer = http.createServer((req, res) => {
    server.unifiedServer(req, res)
})

// Instatiate HTTPS server
server.httpServerOptions = {
    'key': fs.readFileSync(path.join(__dirname, '/../https/key.pem')),
    'cert': fs.readFileSync(path.join(__dirname, '/../https/cert.pem'))
}

server.httpsServer = https.createServer(server.httpServerOptions, (req, res) => {
    server.unifiedServer(req, res)
}) 

// All server logic for both http and https
server.unifiedServer = (req, res) => {
    // Get url and parse it
    const parsedUrl = url.parse(req.url, true)

    // Get the path
    const path = parsedUrl.pathname
    const trimmedPath = path.replace( /^\/+|\/+$/g, '')

    // Get the queryString
    const queryStringObject = parsedUrl.query

    // Get the HTTP method
    const method = req.method.toLowerCase()

    // Get the headers
    const headers = req.headers

    // Get the payload, if it exist
    let decoder = new StringDecoder('utf-8')
    let buffer = ''

    req.on('data', (data) => {
        buffer += decoder.write(data)
    })

    req.on('end', () => {
        buffer += decoder.end()

        // Choose handler which request should go to
        let chosenHandler = typeof server.router[trimmedPath] !== 'undefined' ? server.router[trimmedPath] : handlers.notFound

        // Construct data object to send to handler
        const data = {
            trimmedPath,
            queryStringObject,
            method,
            headers,
            // payload: helpers.parseJSONToObject(buffer)
        }
        console.log('data ====', data)

        // Route request to the handler specified in the router
        chosenHandler(data, (statusCode, payload) => {
            // Default statuscode if it's not present
            statusCode = typeof statusCode === 'number' ? statusCode : 200

            // Default payload if it's not present
            payload = typeof payload === 'object' ? payload : {}
            let payloadString = JSON.stringify(payload)

            // Return the response
            res.setHeader('Content-Type', 'application/json')
            res.writeHead(statusCode)
            res.end(payloadString)
            
            // If response is 200, print green otherwise pring red
            if(statusCode == 200) {
                debug('\x1b[32m%s\x1b[0m', `${method.toUppercase}/${trimmedPath} ${statusCode}`)
            } else {
                debug('\x1b[31m%s\x1b[0m', `${method.toUppercase}/${trimmedPath} ${statusCode}`)
            }
        })
    })
}

// Define a request handler
server.router = {
    'users': handlers.users,
    'tokens': handlers.tokens,
    'menuItems': handlers.menuItems,
    'orders': handlers.orders
}

// Init method
server.init = () => {
    // Start HTTP server
    server.httpServer.listen(config.httpPort, () => {
        console.log('\x1b[35m%s\x1b[0m', `Listening to PORT ${config.httpPort}`)
    })

    // Start HTTPS server
    server.httpsServer.listen(config.httpsPort, () => {
        console.log('\x1b[36m%s\x1b[0m', `Listening to PORT ${config.httpsPort}`)
    })
}

// Export the module
module.exports = server