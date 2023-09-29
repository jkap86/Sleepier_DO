import axios from 'axios';


export const fetchMatchups = () => {
    return async (dispatch, getState) => {

        const state = getState();

        const { leagues } = state.user;
        const display_week = state.main.state.week

        const all_matchups_to_update = [];

        leagues
            .filter(league => league.settings.status === 'in_season')
            .forEach(league => {
                const league_matchups_to_update = [];

                const matchupPtsWeek = (key) => {
                    return league[key]?.reduce((acc, cur) => acc + cur.points, 0)
                }

                Object.keys(league)
                    .filter(key => key.startsWith('matchups_'))
                    .forEach(key => {
                        if (!league[key]) {
                            league_matchups_to_update.push(key)
                        } else {
                            const key_week = parseInt(key.split('_')[1])

                            if (
                                (
                                    key_week < league.settings.playoff_week_start
                                    || league.settings.playoff_week_start === 0
                                ) && (
                                    key_week > league.settings.start_week
                                )
                            ) {
                                if (key_week + 1 === display_week) {
                                    const mismatches = league.rosters
                                        .filter(roster => {
                                            const pts_from_matchups = (
                                                Array.from(Array(display_week - 1).keys()).map(key => key + 1))
                                                .reduce((acc, cur) => acc + (league[`matchups_${cur}`]?.find(m => m.roster_id === roster.roster_id)?.points || 0), 0)

                                            if (roster.settings.fpts > pts_from_matchups) {
                                                console.log({
                                                    league: league.name,
                                                    pts_from_matchups: pts_from_matchups,
                                                    fpts: roster.settings.fpts,
                                                    delta: Math.abs(Math.floor(pts_from_matchups) - roster.settings.fpts),
                                                    roster_id: roster.roster_id
                                                })
                                            }

                                            return Math.floor(pts_from_matchups) !== roster.settings.fpts

                                        })

                                    if (mismatches?.length > 0) {

                                        league_matchups_to_update.push(key)
                                    }

                                } else if (key_week >= display_week) {
                                    league[key]
                                        ?.forEach(matchup => {
                                            const matching_roster = league.rosters.find(r => r.roster_id === matchup.roster_id)

                                            const player_mismatch = [
                                                ...(matching_roster?.players || []).filter(player_id => !matchup.players?.includes(player_id))
                                            ];

                                            if (
                                                player_mismatch.length > 0
                                            ) {

                                                league_matchups_to_update.push(key)
                                            }
                                        })
                                }
                            }
                        }
                    })


                if (league_matchups_to_update.length > 0) {
                    all_matchups_to_update.push({
                        league_id: league.league_id,
                        weeks_to_update: Array.from(new Set(league_matchups_to_update))
                    })
                }
            })

        if (all_matchups_to_update?.length > 0) {
            try {
                dispatch({ type: 'FETCH_MATCHUPS_START' });
                console.log({ all_matchups_to_update })
                const matchups = await axios.post('/league/matchups', {
                    all_matchups_to_update: all_matchups_to_update
                })

                dispatch({ type: 'FETCH_MATCHUPS_SUCCESS', payload: matchups.data });
            } catch (err) {
                dispatch({ type: 'FETCH_MATCHUPS_FAILURE', payload: err.message });
            }
        } else {
            dispatch({ type: 'SET_STATE_USER', payload: { matchups: true } });
            console.log('No matchups to update...')
        }
    }
}