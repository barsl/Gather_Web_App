import { GET_EVENTS, ADD_EVENT, DELETE_EVENT } from '../actions/types';

const initialState = {
    events: []
}

export default function (state = initialState, action) {
    switch (action.type) {
        case GET_EVENTS:
            return {
                ...state
            }
        default:
            return state;
    }
}