export const authActionTypes = {
  START_AUTH: 'START_AUTH',
  AUTH_SUCCESS: 'AUTH_SUCCESS',
  AUTH_FAILED: 'AUTH_FAILED',
  SET_USER: 'SET_USER',
  LOGOUT: 'LOGOUT',
};

export const startAuthAction = () => {
  return {
    type: authActionTypes.START_AUTH,
  };
};

export const authSuccessAction = user => {
  const action = {
    type: authActionTypes.AUTH_SUCCESS,
  };
  if (user) action.user = user;
  return action;
};

export const authFailedAction = () => {
  return {
    type: authActionTypes.AUTH_FAILED,
  };
};

export const setUserAction = user => {
  return {
    type: authActionTypes.SET_USER,
    user,
  };
};

export const logoutAction = () => {
  return {
    type: authActionTypes.LOGOUT,
  };
};
