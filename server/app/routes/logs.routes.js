'use strict'

const fs = require('fs');
const path = require('path');


module.exports = (app) => {
    var router = require("express").Router();

    router.get('/users/:date', (req, res) => {
        console.log('Getting logs of users');

        const logs = fs.readFileSync('./logs.json')

        const logs_to_send = []

        JSON.parse(logs)
            .filter(l => req.params.date === l.timestamp.split(',')[0].replace(/[^0-9]/g, '') && (
                l.route.includes('/user/create?username=')
            ))
            .forEach(entry => {
                const entry_username = entry.request?.username?.toLowerCase()

                if (entry_username) {
                    const existing_log_to_send = logs_to_send.find(lts => lts.username === entry_username)
                    if (!existing_log_to_send) {
                        logs_to_send.push({
                            username: entry_username,
                            searches: [{ ip_address: (entry.ip.split(',')[1] || entry.ip).split('.').slice(0, 3).join('.'), timestamp: entry.timestamp }]
                        })
                    } else {
                        existing_log_to_send.searches.push({
                            ip_address: (entry.ip.split(',')[1] || entry.ip).split('.').slice(0, 3).join('.'),
                            timestamp: entry.timestamp
                        })
                    }
                }
            })

        res.send({
            total_users_searched: logs_to_send.length,
            total_searches: logs_to_send.flatMap(lts => lts.searches)?.length,
            searches: logs_to_send.sort((a, b) => b.searches.length - a.searches.length)
        })
    })

    router.get('/ip/:date', (req, res) => {
        console.log('Getting logs of users');

        const logs = fs.readFileSync('./logs.json')

        const logs_to_send = []

        JSON.parse(logs)
            .filter(l => req.params.date === l.timestamp.split(',')[0].replace(/[^0-9]/g, ''))
            .forEach(entry => {
                const entry_ip = (entry.ip.split(',')[1] || entry.ip).split('.').slice(0, 3).join('.')

                if (entry_ip) {
                    const existing_log_to_send = logs_to_send.find(lts => lts.ip_address === entry_ip)
                    if (!existing_log_to_send) {
                        logs_to_send.push({
                            ip_address: entry_ip,
                            searches: [{
                                route: entry.route,
                                params: entry.request,
                                timestamp: entry.timestamp
                            }]
                        })
                    } else {
                        existing_log_to_send.searches.push({
                            route: entry.route,
                            params: entry.request,
                            timestamp: entry.timestamp
                        })
                    }
                }
            })

        res.send({
            total_IPAddresses: logs_to_send.length,
            total_searches: logs_to_send.flatMap(lts => lts.searches)?.length,
            searches: logs_to_send.sort((a, b) => b.searches.length - a.searches.length)
        })
    })

    router.get('/all', (req, res) => {
        console.log('Getting logs of users');

        const logs = fs.readFileSync('./logs.json')

        res.send(JSON.parse(logs));
    })

    app.use('/logs', router);
}