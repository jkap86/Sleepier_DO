'use strict'
const fs = require('fs');


const logVisits = (req, res, next) => {
    const log_file = fs.readFileSync('./logs.json', 'utf-8');

    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const timestamp = new Date().toISOString();

    let requestData;
    if (req.method === 'GET') {
        requestData = req.query;
    } else if (req.method === 'POST') {
        requestData = req.body;
    }

    const logEntry = {
        timestamp,
        ip: ipAddress,
        route: req.originalUrl,
        request: requestData

    };

    const updated_logs = [...JSON.parse(log_file), logEntry];

    fs.writeFileSync('./logs.json', JSON.stringify(updated_logs))

    next();
}

module.exports = {
    logVisits: logVisits
}