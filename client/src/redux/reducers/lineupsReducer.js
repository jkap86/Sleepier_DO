

const initialState = {
    rankings: null,
    notMatched: [],
    filename: '',
    error: null,
    playerBreakdownModal: false,
    includeTaxi: true,
    includeLocked: true,
    projectedRecordDictAll: {},
    playerLineupDict: {},
    week: 1,
    lineupChecks: {},
    column1: 'Suboptimal',
    column2: 'Early/Late Flex',
    column3: 'Open Roster',
    column4: 'Open IR',
    column1_prev: 'For',
    column2_prev: 'Against',
    column3_prev: 'Optimal For',
    column4_prev: 'Optimal Against',
    itemActive: '',
    page: 1,
    searched: '',
    primaryContent: 'Lineup Check',
    secondaryContent1: 'Lineup',
    secondaryContent2: 'Lineup',
    itemActive2: '',
    isLoadingProjectionDict: false,
    sortBy: 'start',
    page2_start: 1,
    page2_bench: 1,
    page2_start_opp: 1,
    page2_bench_opp: 1,
    filters: {
        position: 'W/R/T/Q',
        team: 'All',
        draftClass: 'All'
    },
}

const lineupsReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'UPLOAD_RANKINGS':
            return {
                ...state,
                rankings: action.payload.rankings,
                notMatched: action.payload.notMatched,
                filename: action.payload.filename,
                error: action.payload.error
            };
        case 'RESET_STATE':
            return {
                ...initialState
            };
        case 'SET_STATE_LINEUPS':
            return {
                ...state,
                ...action.payload
            };
        default:
            return state;
    }
}

export default lineupsReducer;