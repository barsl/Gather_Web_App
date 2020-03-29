import { authActionTypes } from "./authActions";

const startAuth = state => ({ ...state, loading: true });

const authSuccess = (state, { user }) => {
  const newState = { ...state, authenticated: true, loading: false };
  if (user) {
    newState.user = user;
  }
  return newState;
};

const authFailed = () => ({
  user: null,
  authenticated: false,
  loading: false
});

const setUser = (state, { user }) => ({
  ...state,
  user
});

const authReducer = (state, action) => {
  switch (action.type) {
    case authActionTypes.START_AUTH:
      return startAuth(state);
    case authActionTypes.AUTH_SUCCESS:
      return authSuccess(state, action);
    case authActionTypes.AUTH_FAILED:
      return authFailed();
    case authActionTypes.SET_USER:
      return setUser(state, action);
    default:
      return state;
  }
};

export default authReducer;