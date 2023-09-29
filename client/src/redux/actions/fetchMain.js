import axios from "axios";

export const fetchMain = (item) => {
    return async (dispatch) => {
        dispatch({ type: 'FETCH_MAIN_START', payload: { item: item } });

        try {
            const main = await axios.get(`/main/${item}`);

            if (item === 'projections') {
                console.log(main.data[0].filter(d => d.week === 4 && d.player_id === '8135'))
            }
            const data = item !== 'projections' ? main.data[0] : main.data[0].reduce((result, item) => {
                const { week, player_id, injury_status, ...stats } = item;

                if (!result[week]) {
                    result[week] = {};
                }

                result[week][player_id] = {
                    ...stats,
                    injury_status: injury_status
                };
                return result;
            }, {})

            dispatch({
                type: 'FETCH_MAIN_SUCCESS', payload: {
                    item: item,
                    data: data
                }
            });

        } catch (error) {
            dispatch({ type: 'FETCH_MAIN_FAILURE', payload: error.message });

            console.error(error.message)
        }
    }
}