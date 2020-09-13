const fs = require('fs')
const path = require('path')
const config = require('../config/config')
const db = {}

fs
    .readdirSync(__dirname)
    .filter((file) =>
        file !== 'index.js'
    )
    .forEach((file) => {
    })

module.exports = db;