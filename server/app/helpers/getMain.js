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
    const schedule_json = fs.readFileSync('./schedule.json', 'utf-8');

    let schedule;

    let nflschedule
    try {
        nflschedule = await axios.get(`https://api.myfantasyleague.com/2023/export?TYPE=nflSchedule&W=ALL&JSON=1`)
    } catch (err) {
        console.log(err.message)
    }
    schedule = Object.fromEntries(
        nflschedule.data.fullNflSchedule.nflSchedule
            .map(matchups_week => {
                return [matchups_week.week, matchups_week.matchup]
            })

    )


    fs.writeFileSync('./schedule.json', JSON.stringify(schedule))

    let delay;

    const games_in_progress = Object.keys(schedule)
        .find(
            week => schedule[week]
                && schedule[week]
                    .find(
                        g => parseInt(g.gameSecondsRemaining) > 0
                            && parseInt(g.gameSecondsRemaining) < 3600
                    )
        )

    if (games_in_progress) {
        const min = new Date().getMinutes()

        delay = (min % 15) * 60 * 1000
    } else {

        const next_kickoff = Math.min(...Object.keys(schedule)
            .filter(week => schedule[week])
            .flatMap(week => {
                return schedule[week]
                    ?.filter(g => parseInt(g.kickoff * 1000) > new Date().getTime())
                    ?.map(g => parseInt(g.kickoff * 1000))
            }))

        console.log({ next_kickoff })

        delay = next_kickoff - new Date().getTime()

    }

    console.log({ delay })
    setTimeout(() => {
        getSchedule()
    }, delay)

}

const getScheduleWeek = async (week) => {
    let schedule;

    const nflschedule = await axios.get(`https://api.myfantasyleague.com/2023/export?TYPE=nflSchedule&W=${week}&JSON=1`)

    const kickoffs = Math.min(...nflschedule.data.nflSchedule.matchup.map(x => parseInt(x.kickoff)))

}

module.exports = {
    getAllPlayers: getAllPlayers,
    getState: getState,
    getSchedule: getSchedule,
    getScheduleWeek: getScheduleWeek
}