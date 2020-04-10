import { ADD_IMAGE, GET_IMAGES, GET_ERRORS } from "./types";
import axios from 'axios'

//ADD IMAGE
export const addImage = imageData => dispatch => {
  axios.post("/events/pics/add/"+(imageData.get("event_id")), imageData)
    .then(res =>
      dispatch({
        type: ADD_IMAGE,
        payload: res.data
      })
    )
    .catch(err =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      })
    );

};
