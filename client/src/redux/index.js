import { combineReducers } from 'redux';
import userReducer from './reducers/userReducer';
import homepageReducer from './reducers/homepageReducer';
import mainReducer from './reducers/mainReducer';
import filteredDataReducer from './reducers/filteredDataReducer';
import playersReducer from './reducers/playersReducer';
import leaguesReducer from './reducers/leaguesReducer';
import lineupsReducer from './reducers/lineupsReducer';
import leaguematesReducer from './reducers/leaguematesReducer';


const rootReducer = combineReducers({
    homepage: homepageReducer,
    main: mainReducer,
    user: userReducer,
    filteredData: filteredDataReducer,
    players: playersReducer,
    leagues: leaguesReducer,
    leaguemates: leaguematesReducer,
    lineups: lineupsReducer
});

export default rootReducer;