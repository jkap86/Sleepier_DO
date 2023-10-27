'use strict'
const fs = require('fs');


const logVisits = (req, res, next) => {
    const route = req.originalUrl;

    if (!route.includes('/main/logs/')) {

        const log_file = fs.readFileSync('./logs.json', 'utf-8');

        const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const timestamp = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })

        console.log({ timestamp })
        let requestData;
        if (req.method === 'GET') {
            requestData = req.query;
        } else if (req.method === 'POST') {
            requestData = req.body;
        }

        const logEntry = {
            timestamp,
            ip: ipAddress,
            route: route,
            request: requestData

        };

        const updated_logs = [...JSON.parse(log_file), logEntry];

        fs.writeFileSync('./logs.json', JSON.stringify(updated_logs))
    }
    next();
}

module.exports = {
    logVisits: logVisits
}