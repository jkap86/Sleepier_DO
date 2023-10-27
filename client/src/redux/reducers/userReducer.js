const initialState = {
    user_id: false,
    username: '',
    avatar: null,
    leagues: false,
    lmplayershares: [],
    matchups: false,
    progress: 0,
    isLoadingUser: false,
    errorUser: false,
    isLoadingLeagues: false,
    errorLeagues: false,
    isLoadingMatchups: false,
    errorMatchups: false,
    syncing: false,
    errorSyncing: false,
    seasonResultsDict: false
}

const userReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'FETCH_USER_START':
            return {
                ...initialState,
                isLoadingUser: true
            };
        case 'FETCH_USER_SUCCESS':
            return {
                ...state,
                user_id: action.payload.user_id,
                username: action.payload.username,
                avatar: action.payload.avatar,
                isLoadingUser: false
            };
        case 'FETCH_USER_FAILURE':
            return {
                ...state,
                isLoadingUser: false,
                errorUser: action.payload
            };
        case 'FETCH_LEAGUES_START':
            return {
                ...state,
                isLoadingLeagues: true,
                errorLeagues: null
            };
        case 'FETCH_LEAGUES_SUCCESS':
            const x_leagues = action.payload.filter(league => league.settings.status !== 'pre_draft' && !league.rosters
                ?.find(r => r.user_id === state.user_id || r.co_owners?.find(co => co?.user_id === state.user_id))
            )

            console.log({ x_leagues })


            const leagues = action.payload.filter(league => league.settings.status !== 'pre_draft' && league.rosters
                ?.find(r => r.user_id === state.user_id || r.co_owners?.find(co => co?.user_id === state.user_id))
            )
                .map(league => {
                    const userRoster = league.rosters
                        ?.find(r => r.user_id === state.user_id || r.co_owners?.find(co => co?.user_id === state.user_id))

                    return {
                        ...league,
                        userRoster: userRoster,
                    }

                })

            return {
                ...state,
                isLoadingLeagues: false,
                leagues: leagues
            };



        case 'FETCH_LEAGUES_FAILURE':
            return {
                ...state,
                isLoadingLeagues: false,
                errorLeagues: action.payload
            };
        case 'FETCH_MATCHUPS_START':
            return {
                ...state,
                isLoadingMatchups: true,
                errorMatchups: null
            };
        case 'FETCH_MATCHUPS_SUCCESS':
            const updated_leagues = []

            state.leagues
                .forEach(league => {
                    const updates_league = action.payload.find(l => l.league_id === league.league_id);

                    updated_leagues.push({
                        ...league,
                        ...updates_league,
                        userRoster: updates_league
                            ? updates_league.rosters
                                ?.find(r => r.user_id === state.user_id || r.co_owners?.find(co => co?.user_id === state.user_id))
                            : league.userRoster
                    })

                })

            return {
                ...state,
                isLoadingMatchups: false,
                leagues: updated_leagues,
                matchups: true
            };
        case 'FETCH_MATCHUPS_FAILURE':
            return {
                ...state,
                isLoadingMatchups: false,
                errorMatchups: action.payload
            };
        case 'SYNC_LEAGUES_START':
            return { ...state, errorSyncing: null };
        case 'SYNC_LEAGUES_SUCCESS':
            const synced_leagues = state.leagues.map(l => {
                if (l.league_id === action.payload.league.league_id) {
                    return {
                        ...l,
                        ...action.payload.league
                    }
                }
                return l
            })


            return {
                ...state,
                leagues: synced_leagues
            }
        case 'SYNC_LEAGUES_FAILURE':
            return { ...state, syncing: false, errorSyncing: action.payload };
        case 'SET_STATE_USER':
            return {
                ...state,
                ...action.payload
            };
        case 'RESET_STATE':
            return {
                ...initialState
            };
        default:
            return state;
    }
}

export default userReducer;