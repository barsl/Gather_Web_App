import { ADD_IMAGE, GET_IMAGES, GET_ERRORS } from "./types";
import AxiosAPI from "../AxiosAPI";

//ADD IMAGE
export const addImage = imageData => dispatch => {
  AxiosAPI.post("/events/pics/add/"+(imageData.get("event_id")), imageData)
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

//GET ALL IMAGES
export const getAllImages = () => dispatch => {
  AxiosAPI.get("/events/pics/get/5e8b91ba1adb0f0c2a3c39b4")
    .then(res =>
      dispatch({
        type: GET_IMAGES,
        payload: res.data
      })
    )
    .catch(err =>
      dispatch({
        type: GET_IMAGES,
        payload: null
      })
    );
};
