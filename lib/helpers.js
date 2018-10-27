/**
 * Helpers for various tasks
 * 
 */

// Dependencies
const crypto = require('crypto')
const queryString = require('querystring')
const https = require('https')
const config = require('./config')

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

module.exports = helpers