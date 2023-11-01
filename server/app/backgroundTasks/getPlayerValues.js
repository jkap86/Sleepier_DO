'use strict'
const fs = require('fs');
const axios = require('../api/axiosInstance');

module.exports = async (app) => {
    const matchPlayer = (player, stateAllPlayers) => {
        const ktc_player_ids = require('../../ktc_player_ids.json');

        const match = ktc_player_ids.find(x => parseInt(x.ktc_id) === player.playerID)

        return match?.sleeper_id || match?.name
    }

    const getUTCDate = (date) => {
        // Extract year, month, and day
        let yy = date.getUTCFullYear().toString().slice(-2);  // Get last 2 digits of year
        let mm = String(date.getUTCMonth() + 1).padStart(2, '0');  // Month is 0-indexed, so +1
        let dd = String(date.getUTCDate()).padStart(2, '0');

        // Form the "mm-dd-yy" format
        let formattedDate = `${mm}-${dd}-${yy}`;
        return formattedDate;

    }

    const getDailyValues = async () => {

        console.log(`Beginning daily rankings update at ${new Date()}`)


        const stateAllPlayers = fs.readFileSync('./allplayers.json', 'utf-8')

        let ktc;
        try {
            ktc = await axios.post('https://keeptradecut.com/dynasty-rankings/histories')

            const new_values = []

            ktc.data.forEach(ktc_player => {
                const sleeper_id = matchPlayer(ktc_player, stateAllPlayers)

                if (sleeper_id) {
                    let player_sf, player_oneqb;

                    if (process.env.KTC_DAY) {
                        player_sf = ktc_player.superflexValueHistory.find(p => p.d === process.env.KTC_DAY)
                        player_oneqb = ktc_player.oneQBValueHistory.find(p => p.d === process.env.KTC_DAY)
                    } else {
                        player_sf = ktc_player.superflexValueHistory[ktc_player.superflexValueHistory.length - 1]
                        player_oneqb = ktc_player.oneQBValueHistory[ktc_player.oneQBValueHistory.length - 1]
                    }

                    if (player_sf) {
                        const date = getUTCDate(new Date(player_sf.d))
                        const sf = player_sf.v

                        new_values.push({
                            date: date,
                            type: 'sf',
                            player_id: sleeper_id,
                            value: sf
                        })
                    }

                    if (player_oneqb) {
                        const date2 = getUTCDate(new Date(player_oneqb.d))
                        const oneqb = player_oneqb.v

                        new_values.push({
                            date: date2,
                            type: 'oneqb',
                            player_id: sleeper_id,
                            value: oneqb
                        })
                    }
                }
            })

            const dates_updated = Array.from(new Set(new_values.map(nv => nv.date)))

            console.log({ dates_updated })

            const playervalues_json = fs.readFileSync('./playervalues.json', 'utf-8');

            const data = [
                ...JSON.parse(playervalues_json)
                    .filter(x => !new_values.find(y => x.date === y.date && x.type === y.type && x.player_id === y.player_id)),
                ...new_values
            ]

            try {
                fs.writeFileSync('./playervalues.json', JSON.stringify(data))
            } catch (error) {
                console.log(error)
            }
        } catch (err) {
            console.log(err.message)
        }



        console.log(`Update Complete`)
    }

    if (process.env.KTC_URL) {
        const ktc_html = await axios.get(process.env.KTC_URL)

        const regex = /<body[^>]*>[\s\S]*?<script[^>]*>([\s\S]*?)<\/script>/i;

        const match = ktc_html.data.match(regex)

        if (match && match[1]) {
            const player = {
                playerID: parseInt(process.env.KTC_URL.split('-')[process.env.KTC_URL.split('-').length - 1])
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

    if (process.env.HEROKU) {
        await getDailyValues()

        setInterval(async () => {
            await getDailyValues()
        }, 60 * 60 * 1000)
    }

    const gethistoricalPicks = async () => {
        const stateAllPlayers = fs.readFileSync('./allplayers.json', 'utf-8')
        const player_ids = require('../../ktc_player_ids.json');

        const ktc_ids = player_ids.filter(p => p.position === 'PICK').map(p => p.ktc_id)

        let ktc;
        try {
            ktc = await axios.post('https://keeptradecut.com/dynasty-rankings/histories')
        } catch (err) {
            console.log(err)
        }

        const new_values = []

        ktc.data
            .filter(x => ktc_ids.includes(x.playerID.toString()))
            .forEach(ktc_player => {

                const sleeper_id = matchPlayer(ktc_player, stateAllPlayers)

                ktc_player.superflexValueHistory
                    .forEach(ktc_player_date => {
                        const date = getUTCDate(new Date(ktc_player_date.d))
                        const sf = ktc_player_date?.v

                        new_values.push({
                            date: date,
                            type: 'sf',
                            player_id: sleeper_id,
                            value: sf
                        })
                    })


                ktc_player.oneQBValueHistory
                    .forEach(ktc_player_date => {
                        const date = getUTCDate(new Date(ktc_player_date.d))
                        const oneqb = ktc_player_date?.v

                        new_values.push({
                            date: date,
                            type: 'oneqb',
                            player_id: sleeper_id,
                            value: oneqb
                        })
                    })


            })


        const playervalues_json = fs.readFileSync('./playervalues.json', 'utf-8');

        const data = [
            ...JSON.parse(playervalues_json)
                .filter(x => !new_values.find(y => x.date === y.date && x.type === y.type && x.player_id === y.player_id)),
            ...new_values
        ]

        try {
            fs.writeFileSync('./playervalues.json', JSON.stringify(data))
        } catch (error) {
            console.log(error)
        }

        console.log(`Update Complete`)
    }

    setInterval(async () => {
        // await gethistoricalPicks()
    }, 60 * 60 * 1000)

}