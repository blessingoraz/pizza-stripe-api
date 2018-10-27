/**
 * Library for storing and editing data
 * 
 */

 // Dependencies
 const fs = require('fs')
 const path = require('path')
 const helpers = require('./helpers')

 // Container for the module
 let lib = {}

 // Base dir of the data folder
 // __dirname is where we are now
 lib.baseDir = path.join(__dirname, '/../.data/') //we want to get the path of the .data folder(making it into one clean path)
 
 // Write data to a file
 lib.create = (dir, file, data, callback) => {
    // Open the file for writing
    // wx means to open file for writing, but if file name exists, the writing fails
    fs.open(`${lib.baseDir}${dir}/${file}.json`, 'wx', (err, fileDescriptor) => {
        if(!err && fileDescriptor) {
            // Convert data to string
            const stringData = JSON.stringify(data)

            // Write to file and close afterwards
            fs.writeFile(fileDescriptor, stringData, (err) => {
                if (!err) {
                    fs.close(fileDescriptor, (err) => {
                        if(!err) {
                            callback(false)
                        } else {
                            callback('Error closing new file')
                        }
                    })
                } else {
                    callback('Error writing to a new file')
                }
            })

        } else {
            callback('Could not create new file, might already exist')
        }

    })
 }

 // Read data from a file
 lib.read = (dir, file, callback) => {
    fs.readFile(`${lib.baseDir}${dir}/${file}.json`, 'utf-8', (err, data) => {
        if(!err && data) {
            const parsedData = helpers.parseJSONToObject(data)
            callback(false, parsedData)
        } else {
            callback(err, data)
        }
    })
 }

 // Update an existing file
 // r+ will open for writing but error out when the file doesn't exist
 lib.update = (dir, file, data, callback) => {
    fs.open(`${lib.baseDir}${dir}/${file}.json`, 'r+', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            const stringData = JSON.stringify(data)

            // Truncate the content of a file before writing
            fs.truncate(fileDescriptor, (err) => {
                if (!err) {
                    // Write to file and close it
                    fs.writeFile(fileDescriptor, stringData, (err) => {
                        if (!err) {
                            fs.close(fileDescriptor, (err) => {
                                if (!err) {
                                    callback(false)
                                } else {
                                    callback('Error closing the file')
                                }
                            })
                        } else {
                            callback('Error updating the file')
                        }
                    })
                } else {
                    callback('Error truncating file')
                }
            })
        } else {
            callback('File could not be opened, it might not exist yet')
        }
    })
 }

 // Delete a file
 lib.delete = (dir, file, callback) => {
    // Unlinking i.e removing the files from the file system
    fs.unlink(`${lib.baseDir}${dir}/${file}.json`, (err) => {
        if (!err) {
            callback(false)
        } else {
            callback('Error deleting file')
        }
    })
 }

 // List all items in a directory
 lib.list = (dir, callback) => {
    // readdir is a way of reading the directory
    fs.readdir(`${lib.baseDir}${dir}/`, (err, data) => {
        if(!err && data && data.length > 0) {
            let trimmedFileNames = []
            data.forEach((fileName) => {
                trimmedFileNames.push(fileName.replace('.json', ''))
            })
            callback(false, trimmedFileNames)
        } else {
            callback(err, data)
        }
    })
 }
 module.exports = lib