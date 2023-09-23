import axios from 'axios';


export const fetchMatchups = () => {
    return async (dispatch, getState) => {
        dispatch({ type: 'FETCH_MATCHUPS_START' })
        const state = getState();

        const { leagues } = state.user;
        const display_week = state.main.state.leg
        try {
            const all_matchups_to_update = [];

            leagues
                .forEach(league => {
                    const league_matchups_to_update = [];

                    Object.keys(league)
                        .filter(key => key.startsWith('matchups_'))
                        .forEach(key => {
                            const key_week = parseInt(key.split('_')[1])

                            if (key_week < league.settings.playoff_week_start || league.settings.playoff_week_start === 0) {
                                if (!league[key]) {
                                    league_matchups_to_update.push(key)
                                } else if (key_week >= display_week) {
                                    league[key]
                                        ?.forEach(matchup => {
                                            const matching_roster = league.rosters.find(r => r.roster_id === matchup.roster_id)

                                            const player_mismatch = [
                                                ...(matching_roster?.players || []).filter(player_id => !matchup.players?.includes(player_id))
                                            ]
                                            if (
                                                player_mismatch.length > 0
                                            ) {
                                                console.log(player_mismatch)
                                                league_matchups_to_update.push(key)
                                            }
                                        })
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




            const matchups = await axios.post('/league/matchups', {
                display_week: 1,
                all_matchups_to_update: all_matchups_to_update
            })

            dispatch({ type: 'FETCH_MATCHUPS_SUCCESS', payload: matchups.data });
        } catch (err) {
            dispatch({ type: 'FETCH_MATCHUPS_FAILURE', payload: err.message });
        }
    }
}