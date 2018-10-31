/**
 * Helpers for various tasks
 * 
 */

// Dependencies
const crypto = require('crypto')
const queryString = require('querystring')
const https = require('https')
const config = require('./config')
const SECRET = require('../secrets')

// Container for the helpers
let helpers = {}

// Create a SHA256 hash
helpers.hash = (str) => {
    if(typeof str == 'string' && str.trim().length > 0) {
        const hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex') // hashing with sha256
        return hash
    } else {
        return false
    }
}

// Parse a JSON string to an object in all cases without throwing
helpers.parseJSONToObject = (str) => {
    try {
        const obj = JSON.parse(str)
        return obj
    }catch(err) {
        return {}
    }
}

// Create a string of random characters of a given length
helpers.createRandomString = (strLength) => {
    strLength = typeof strLength == 'number' && strLength > 0 ? strLength : false
    if(strLength) {
        // Possible characters that can be in the random string
        let possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789'

        // Final string
        let str = ''
        for(let i = 1; i <= strLength; i++) {
            // Get a random character from possibleCharacters
            let randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length))
            // Append random characters to final strinf
            str+=randomCharacter
        }
        // Return final string
        return str
    } else {
        return false
    }
}

// Validate email address given by user
helpers.validateEmail = (email) => {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

// Send email message via Mailgun
helpers.sendEmail = (email, msg, callback) => {
    // Validate parameters
    phone = typeof phone == 'string' && phone.trim().length == 10 ? phone.trim(): false
    msg = typeof msg == 'string' && msg.trim().length > 0 && msg.trim().length <= 1600 ? msg.trim() : false
    if(phone && msg) {
        //TODO: Do something here
    } else {
        callback('Paramters are missing or invalid')
    }

}

// Make request to stripe API 
helpers.makePayment = (amount, stripeToken, callback) => {
    // Validate parameters
    amount = typeof amount == 'number' && amount % 1 == 0 && amount > 0 ? amount : false
    stripeToken = typeof stripeToken == 'string' && stripeToken.trim().length > 0 ? stripeToken.trim() : false
    

    if(amount && stripeToken) {
        // Configure the request payload to send to Stripe
        let payload = {
            'amount' : 400,
            'currency' : 'usd',
            'source' : stripeToken,
            'description' : 'Charge for pizza'
        }
        let stringPayload = queryString.stringify(payload)

        // Configure the request details
        const requestDetails = {
            'protocol': 'https:',
            'hostname': 'api.stripe.com',
            'method': 'POST',
            'path': `/v1/charges`,
            'headers': {
                'Content-Length': Buffer.byteLength(stringPayload), // Buffer is a global variable 
                'Authorization': `Bearer ${SECRET.stripeSecret}`
            }
        }

        // Instantiate the request object
        const req = https.request(requestDetails, (res) => {
            // Grab the status of the sent request
            const status = res.statusCode
            // Successfully callback if request went through
            if(status == 200 || status == 201) {
                callback(false)
            } else {
                callback(`Status code returned was ${status}`)
            }
        })
        
        // Bind to the error event so it doesn't throw(We don't want any error to kill event)
        req.on('error', (e) => {
            callback(e)
        })

        // Add payload to the request
        req.write(stringPayload)

        // End thr request
        req.end()
    } else {
        callback('Paramters are missing or invalid')
    }

}

module.exports = helpers