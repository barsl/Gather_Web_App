import React, {useContext, useReducer, useCallback} from 'react';
import authReducer from '../store/authReducer';
import {
  setUserAction,
  authSuccessAction,
  authFailedAction,
  startAuthAction,
  logoutAction
} from '../store/authActions';

const defaultState = {
  user: null,
  authenticated: false,
  loading: false,
};

export const AuthContext = React.createContext(defaultState);

export const AuthProvider = ({children}) => {
  const [userAuth, dispatch] = useReducer(authReducer, defaultState);
  const setUser = useCallback(user => dispatch(setUserAction(user)), []);
  const logout = useCallback(() => dispatch(logoutAction()), []);
  const onAuthStart = useCallback(() => dispatch(startAuthAction()), []);
  const onAuthSuccess = useCallback(
    user => dispatch(authSuccessAction(user)),
    [],
  );
  const onAuthFail = useCallback(() => dispatch(authFailedAction()), []);
  return (
    <AuthContext.Provider
      value={{
        user: userAuth.user,
        authenticated: userAuth.authenticated,
        loadingAuth: userAuth.loading,
        setUser,
        logout,
        onAuthStart,
        onAuthSuccess,
        onAuthFail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * AuthContext hook
 */
export const useAuthContext = () => useContext(AuthContext);
