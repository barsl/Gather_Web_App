import { GET_EVENTS, ADD_EVENT, DELETE_EVENT, EVENTS_LOADING } from '../actions/types';

const initialState = {
    events: [],
    loading: false
};

export default function (state = initialState, action) {
    switch (action.type) {
        case GET_EVENTS:
            return {
                ...state,
                events: action.payload,
                loading: false
            }
        case DELETE_EVENT:
            return {
                ...state,
                events: this.state.events.filter(el => el._id !== action.payload)
            }
        case EVENTS_LOADING:
            return {
                ...state,
                loading: true
            }
        default:
            return state;
    }
}