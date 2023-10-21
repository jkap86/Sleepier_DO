const initialState = {
    state: {},
    allplayers: false,
    schedule: false,
    projections: false,
    tab: 'players',
    type1: 'All',
    type2: 'All',
    isLoading: [],
    stats: {},
    values: []
};

const mainReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'FETCH_MAIN_START':
            return {
                ...state,
                isLoading: [...state.isLoading, action.payload.item],
                errorUser: null
            };
        case 'FETCH_MAIN_SUCCESS':

            return {
                ...state,
                [action.payload.item]: action.payload.data,
                isLoading: state.isLoading.filter(x => x !== action.payload.item)
            };
        case 'SET_STATE_MAIN':
            return {
                ...state,
                ...action.payload
            };
        default:
            return state;
    }


}

export default mainReducer;