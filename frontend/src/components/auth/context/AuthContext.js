import React, { useContext, useReducer, useCallback } from "react";
import authReducer from "../store/authReducer";
import {
  setUserAction,
  authSuccessAction,
  authFailedAction,
  startAuthAction
} from "../store/authActions";

const defaultState = {
  user: null,
  setUser: null,
  logout: null,
  authenticated: false,
  onAuthStart: null,
  onAuthSuccess: null,
  onAuthFail: null,
  loadingAuth: null
};

export const AuthContext = React.createContext(defaultState);

export const AuthProvider = ({ children }) => {
  const [userAuth, dispatch] = useReducer(authReducer, defaultState);
  const setUser = useCallback(user => dispatch(setUserAction(user)), []);
  const logout = useCallback(() => dispatch(setUserAction(null)), []);
  const onAuthStart = useCallback(() => dispatch(startAuthAction()), []);
  const onAuthSuccess = useCallback(
    user => dispatch(authSuccessAction(user)),
    []
  );
  const onAuthFail = useCallback(() => dispatch(authFailedAction), []);
  return (
    <AuthContext.Provider
      value={{
        user: userAuth.user,
        setUser,
        logout,
        authenticated: userAuth.authenticated,
        onAuthStart,
        onAuthSuccess,
        onAuthFail,
        loadingAuth: userAuth.loading
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
