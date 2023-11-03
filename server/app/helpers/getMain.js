'use strict'

const fs = require('fs');
const axios = require('axios');

const getAllPlayers = async () => {
    //  get allplayers dict - from .json file in dev; filter for active and position

    let sleeper_players;

    try {
        sleeper_players = await axios.get('https://api.sleeper.app/v1/players/nfl')

        sleeper_players = Object.fromEntries(Object.keys(sleeper_players.data)
            .filter(player_id => sleeper_players.data[player_id].active && !['OL', 'T', 'OT', 'G', 'OG', 'C'].includes(sleeper_players.data[player_id].position))
            .map(key => {
                const { position, fantasy_positions, college, number, birth_date, age, full_name, active, team, player_id, search_full_name, years_exp } = sleeper_players.data[key];
                return [
                    key,
                    {
                        position,
                        fantasy_positions,
                        college,
                        number,
                        birth_date,
                        age,
                        full_name,
                        active,
                        team,
                        player_id,
                        search_full_name,
                        years_exp
                    }
                ]
            }
            ))

        fs.writeFileSync('./allplayers.json', JSON.stringify(sleeper_players))

    } catch (error) {
        console.log(error)
    }

}

const getState = async (app) => {
    const state = await axios.get('https://api.sleeper.app/v1/state/nfl')

    app.set('state', state.data, 0)
}

const getSchedule = async () => {
    console.log('Updating Schedule on ' + new Date())


    let schedule;

    let nflschedule
    let nflSchedule_week
    try {
        nflschedule = await axios.get(`https://api.myfantasyleague.com/2023/export?TYPE=nflSchedule&W=ALL&JSON=1`)
        nflSchedule_week = await axios.get(`https://api.myfantasyleague.com/2023/export?TYPE=nflSchedule&W=&JSON=1`)

        schedule = Object.fromEntries(
            [...nflschedule.data.fullNflSchedule.nflSchedule, nflSchedule_week.data.nflSchedule]
                .map(matchups_week => {
                    return [matchups_week.week, matchups_week.matchup]
                })

        )


        fs.writeFileSync('./schedule.json', JSON.stringify(schedule))

        let delay;

        const games_in_progress = nflSchedule_week.data.nflSchedule.matchup
            .find(
                game => (
                    parseInt(game.gameSecondsRemaining) > 0
                    && parseInt(game.gameSecondsRemaining) < 3600
                )
            )

        if (games_in_progress) {
            const min = new Date().getMinutes()

            delay = (((60 - min) % 5) * 60 * 1000) || (5 * 60 * 1000)
        } else {

            const next_kickoff = Math.min(...Object.keys(schedule)
                .filter(week => schedule[week])
                .flatMap(week => {
                    return schedule[week]
                        ?.filter(g => parseInt(g.kickoff * 1000) > new Date().getTime())
                        ?.map(g => parseInt(g.kickoff * 1000))
                }))

            console.log({ next_kickoff: new Date(next_kickoff) })

            delay = next_kickoff - new Date().getTime()

        }
        const days_remainder = delay % (24 * 60 * 60 * 1000);
        const hours_remainder = days_remainder % (60 * 60 * 1000);


        console.log(
            `next update in
        ${Math.floor(delay / (24 * 60 * 60 * 1000))} Days, 
        ${Math.floor((days_remainder) / (60 * 60 * 1000))} Hours, 
        ${Math.floor(hours_remainder / (60 * 1000))} Min,
        `
        )
        setTimeout(() => {
            getSchedule()
        }, delay)
    } catch (err) {

        setTimeout(() => {
            getSchedule()
        }, 15 * 60 * 1000)

        console.log(err.message)
    }
}

module.exports = {
    getAllPlayers: getAllPlayers,
    getState: getState,
    getSchedule: getSchedule
}