const initialState = {
    username: '',
    leagueId: '',
    tab: 'username',
    dropdownVisible: false,
    dropdownOptions: []

}

const homepageReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_STATE_HOMEPAGE':
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

export default homepageReducer;