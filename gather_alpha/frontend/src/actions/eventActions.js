import { GET_EVENTS, ADD_EVENT, DELETE_EVENT, EVENTS_LOADING } from './types';
import axios from 'axios';

export const getEvents = () => dispatch => {
    dispatch(setEventsLoading());
    axios.get('/events')
        .then(response =>
            dispatch({
                type: GET_EVENTS,
                payload: response.data
            })
        )
        .catch((error) => {
            console.log(error);
        })
};

export const deleteEventAction = id => dispatch => {
    axios.delete('/events/' + id)
        .then(response =>
            dispatch({
                type: DELETE_EVENT,
                payload: response.data
            })
        )
        .catch((error) => {
            console.log(error);
        })
};

export const setEventsLoading = () => {
    return {
        type: EVENTS_LOADING
    };
}