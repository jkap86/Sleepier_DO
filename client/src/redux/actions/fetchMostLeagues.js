import axios from 'axios';

export const fetchMostLeagues = () => {
    return async (dispatch) => {
        try {
            const users = await axios.get('user/findmostleagues')

            dispatch({ type: 'SET_STATE_HOMEPAGE', payload: { dropdownOptions: users.data } })
        } catch (error) {
            console.log(error)
        }
    }
}