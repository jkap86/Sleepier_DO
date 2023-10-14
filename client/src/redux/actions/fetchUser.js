import axios from 'axios';
import { filterData } from '../../functions/filterData';
import { getTradeTips } from '../../functions/getTradeTips';

export const fetchUser = (username) => {
    return async (dispatch) => {
        dispatch({ type: 'FETCH_USER_START' });

        try {
            const user = await axios.get('/user/create', {
                params: { username: username }
            });

            console.log(user.data)

            if (!user.data?.error) {
                dispatch({ type: 'FETCH_USER_SUCCESS', payload: user.data.user });

                dispatch({ type: 'SET_STATE_MAIN', payload: { state: user.data.state } });

                const week_lc = user.data.state.season_type === 'regular'
                    ? user.data.state.leg
                    : user.data.state.season_type.includes('post')
                        ? 19
                        : 1

                dispatch({ type: 'SET_STATE_LINEUPS', payload: { week: week_lc } });
            } else {
                dispatch({ type: 'FETCH_USER_FAILURE', payload: user.data });
            }
        } catch (error) {
            dispatch({ type: 'FETCH_USER_FAILURE', payload: error.message });
        }
    };
};

export const fetchLeagues = (user_id) => {
    return async (dispatch) => {
        dispatch({ type: 'FETCH_LEAGUES_START' })

        try {
            const response = await fetch(`/league/find?user_id=${encodeURIComponent(user_id)}`, {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                },
            });

            if (response.ok) {
                const reader = response.body.getReader();

                let leagues = ''

                while (true) {
                    const { done, value } = await reader.read();

                    if (done) break;


                    leagues += new TextDecoder().decode(value);

                    const matches = leagues.match(/"league_id":/g);

                    let count = 0;

                    if (matches && matches.length > 0) {
                        count = matches.length
                    }

                    dispatch({ type: 'SET_STATE_USER', payload: { progress: count } })
                }

                let parsed_leagues;
                try {
                    parsed_leagues = JSON.parse(leagues)
                } catch (error) {
                    console.log(error)
                }
                console.log(parsed_leagues)

                dispatch({ type: 'FETCH_LEAGUES_SUCCESS', payload: parsed_leagues.flat() });

            } else {
                dispatch({ type: 'FETCH_LEAGUES_FAILURE', payload: 'Failed to fetch user leagues' });
            }
        } catch (error) {
            dispatch({ type: 'FETCH_LEAGUES_FAILURE', payload: error.message });
        }
    }
}

export const syncLeague = (league_id, user_id, username, week) => {
    return async (dispatch, getState) => {
        dispatch({ type: 'SYNC_LEAGUE_START' });

        const state = getState();
        const { main } = state;

        try {
            const updated_league = await axios.post(`/league/sync`, {
                league_id: league_id,
                username: username,
                week: week
            })
            console.log(updated_league.data)
            const hash = `${state.lineups.includeTaxi}-${state.lineups.includeLocked}`;
            const lineupChecks = state.lineups.lineupChecks;

            const userRoster = updated_league.data.rosters
                ?.find(r => r.user_id === user_id || r.co_owners?.find(co => co?.user_id === user_id))

            dispatch({
                type: 'SYNC_LEAGUES_SUCCESS',
                payload: {
                    league: {
                        ...updated_league.data,
                        userRoster: userRoster
                    },
                    state: main.state
                }
            });

            if (week < main.state.display_week) {
                dispatch({
                    type: 'SET_STATE_LINEUPS',
                    payload: {
                        lineupChecks: {
                            ...lineupChecks,
                            [week]: {
                                ...lineupChecks[week],
                                [league_id]: {
                                    ...lineupChecks[week][league_id],
                                    edited: true
                                }
                            }
                        }
                    }
                })
            } else {
                dispatch({
                    type: 'SET_STATE_LINEUPS',
                    payload: {
                        lineupChecks: {
                            ...lineupChecks,
                            [week]: {
                                ...lineupChecks[week],
                                [hash]: {
                                    ...lineupChecks[week][hash],
                                    [league_id]: {
                                        ...lineupChecks[week][hash][league_id],
                                        edited: true
                                    }
                                }
                            }
                        }
                    }
                });
            }

        } catch (error) {
            console.error(error.message)
            dispatch({ type: 'SYNC_LEAGUES_FAILURE' })
        }

    };
}

export const fetchFilteredData = (leagues, type1, type2, tab, season) => async (dispatch) => {
    dispatch({ type: 'FETCH_FILTERED_DATA_START' });

    try {
        const filteredData = filterData(leagues, type1, type2, tab, season);


        dispatch({
            type: 'FETCH_FILTERED_DATA_SUCCESS',
            payload: filteredData
        });
    } catch (error) {
        dispatch({ type: 'FETCH_FILTERED_DATA_FAILURE', payload: error.message });
    }
};

export const fetchLmPlayerShares = (user_id) => async (dispatch) => {
    try {
        const lmplayershares = await axios.get('/user/lmplayershares', {
            params: { user_id: user_id }
        });

        console.log({ lmplayershares: lmplayershares.data.sort((a, b) => a.username > b.username ? 1 : -1) })

        dispatch({ type: 'SET_STATE_USER', payload: { lmplayershares: lmplayershares.data } });
    } catch (err) {
        console.log(err)
    }
}

export const fetchLmTrades = (user_id, leagues, season, offset, limit) => {
    return async (dispatch) => {
        dispatch({ type: 'FETCH_TRADES_START' });

        try {
            const trades = await axios.post('/trade/leaguemate', {
                user_id: user_id,
                offset: offset,
                limit: limit
            })

            console.log({ trades })


            const trades_tips = getTradeTips(trades.data.rows, leagues, season)

            dispatch({
                type: 'FETCH_LMTRADES_SUCCESS', payload: {
                    count: trades.data.count,
                    trades: trades_tips
                }
            });
        } catch (error) {
            dispatch({ type: 'FETCH_TRADES_FAILURE', payload: error.message })
        }
    }
}

export const fetchFilteredLmTrades = (searchedPlayerId, searchedManagerId, league_season, offset, limit) => async (dispatch, getState) => {
    dispatch({ type: 'FETCH_TRADES_START' });

    const state = getState();

    const { user } = state;

    try {
        const trades = await axios.post('/trade/leaguemate', {
            user_id: user.user_id,
            player: searchedPlayerId,
            manager: searchedManagerId,
            offset: offset,
            limit: limit,
        });

        const trades_tips = getTradeTips(trades.data.rows, user.leagues, league_season)

        dispatch({
            type: 'FETCH_FILTERED_LMTRADES_SUCCESS',
            payload: {
                player: searchedPlayerId,
                manager: searchedManagerId,
                trades: trades_tips,
                count: trades.data.count,
            },
        });
    } catch (error) {
        dispatch({ type: 'FETCH_TRADES_FAILURE', payload: error.message });
    }


};

export const fetchPriceCheckTrades = (pricecheck_player, pricecheck_player2, offset, limit) => async (dispatch, getState) => {
    dispatch({ type: 'FETCH_TRADES_START' });

    const state = getState();

    const { user, main } = state;

    try {
        const player_trades = await axios.post('/trade/pricecheck', {
            player: pricecheck_player,
            player2: pricecheck_player2,
            offset: offset,
            limit: limit
        })

        const trades_tips = getTradeTips(player_trades.data.rows, user.leagues, main.state.league_season)

        dispatch({
            type: 'FETCH_PRICECHECKTRADES_SUCCESS',
            payload: {
                pricecheck_player: pricecheck_player,
                pricecheck_player2: pricecheck_player2,
                trades: trades_tips,
                count: player_trades.data.count,
            },
        });
    } catch (error) {
        dispatch({ type: 'FETCH_TRADES_FAILURE', payload: error.message });
    }

};