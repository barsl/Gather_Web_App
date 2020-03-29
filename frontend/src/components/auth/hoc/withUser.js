import React, { useEffect, useCallback } from "react";
import { useAuthContext } from "../context/AuthContext";
import axios from "axios";

/**
 * @param WrappedComponent The component to receive user props
 * @param {boolean} guarded true if component should redirect if the user is not authenticated
 */
const withUser = (WrappedComponent, guarded) => {
  return props => {
    const {
      user,
      setUser,
      loadingAuth,
      logout,
      onAuthStart,
      onAuthSuccess,
      onAuthFail,
    } = useAuthContext();
    useEffect(() => {
      onAuthStart();
      axios
        .get("/users/currentUser")
        .then(({ data }) => {
          onAuthSuccess({...data, id: data._id});
        })
        .catch(() => {
          if (guarded) props.history.replace("/");
          onAuthFail();
        });
    }, [props.history, onAuthStart, onAuthSuccess, onAuthFail]);
    const updateUser = useCallback(changedProps => {
      setUser({...user, ...changedProps});
    }, [setUser, user]);
    // Performance Debug
    // console.log('Rendering: ', {user, loadingAuth}); 
    return user ? (
      <WrappedComponent
        {...props}
        user={user}
        updateUser={updateUser}
        loadingUser={loadingAuth} // TODO: Remove if not using
        logout={logout} // TODO: Remove if not using
      />
    ) : null;
  };
};

export default withUser;
