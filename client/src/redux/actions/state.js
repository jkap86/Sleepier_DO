export const resetState = () => ({
    type: 'RESET_STATE'
});

export const setState = (state_obj, tab) => ({
    type: `SET_STATE_${tab}`,
    payload: state_obj
})