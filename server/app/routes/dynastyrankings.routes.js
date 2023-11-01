'use strict'
const axios = require('axios');


module.exports = app => {
    const dynastyrankings = require("../controllers/dynastyrankings.controller.js");

    var router = require("express").Router();

    router.get("/stats", dynastyrankings.stats)

    router.get("/find", dynastyrankings.find)

    router.get("/findrange", dynastyrankings.findrange)

    router.post("/player_history", (req, res) => {
        const updatePlayerValues = async (ktc_url) => {
            let ktc_html;

            try {
                ktc_html = await axios.get(ktc_url)
            } catch (err) {
                console.log(err.message)
            }

            if (ktc_html?.data) {
                const regex = /<body[^>]*>[\s\S]*?<script[^>]*>([\s\S]*?)<\/script>/i;

                const match = ktc_html.data.match(regex)

                if (match && match[1]) {
                    const player = {
                        playerID: parseInt(ktc_url.split('-')[ktc_url.split('-').length - 1])
                    }

                    const extractArray = (variableName, content) => {
                        const regex = new RegExp(`var ${variableName} = ({.*?});`, 's');
                        const match = content.match(regex);
                        return match ? JSON.parse(match[1]) : null;
                    };

                    const sleeper_id = matchPlayer(player)

                    const sf_history_array = extractArray('playerSuperflex', match[1])
                    const oneqb_history_array = extractArray('playerOneQB', match[1])

                    const player_history = [];

                    sf_history_array.overallValue
                        .forEach(obj => {
                            const date = getUTCDate(new Date(obj.d));
                            const value = obj.v;

                            console.log(`sf - ${date} - ${value}`)
                            player_history.push({
                                date: date,
                                type: 'sf',
                                player_id: sleeper_id,
                                value: value
                            })

                        })

                    oneqb_history_array.overallValue
                        .forEach(obj => {
                            const date = getUTCDate(new Date(obj.d));
                            const value = obj.v;

                            console.log(`oneqb - ${date} - ${value}`)

                            player_history.push({
                                date: date,
                                type: 'oneqb',
                                player_id: sleeper_id,
                                value: value
                            })

                        })

                    try {
                        const history = require('../../playervalues.json')

                        const data = [
                            ...history,
                            ...player_history
                                .filter(ph => !(
                                    history.find(h => ph.date === h.date
                                        && ph.type === h.type
                                        && ph.player_id === h.player_id
                                    )
                                ))
                        ]

                        fs.writeFileSync('./playervalues.json', JSON.stringify(player_history));
                    } catch (err) {
                        console.log(err.message)
                    }
                    console.log('Script content saved to ktc.js!');
                } else {
                    console.error('Script tag not found inside the body!');
                }
            }
        }

        const ktc_url = req.body.ktc_url;

        updatePlayerValues(ktc_url)

        res.send('SUCCESS')
    })

    app.use('/dynastyrankings', router);
}