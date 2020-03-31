import React, { useEffect, useState, useCallback } from "react";
import { useAuthContext } from "../context/AuthContext";
import axios from "axios";

/**
 * @param WrappedComponent The component to receive user props
 */
const withUser = (WrappedComponent) => {
  const MemoizedComponent = React.memo(WrappedComponent);
  return props => {
    const {
      user,
      setUser,
      logout,
      onAuthStart,
      onAuthSuccess,
      onAuthFail,
    } = useAuthContext();
    const [loading, setLoading] = useState(true);
    useEffect(() => {
      onAuthStart();
      axios
        .get("/users/currentUser")
        .then(({ data }) => {
          onAuthSuccess({...data, id: data._id});
          setLoading(false);
        })
        .catch(() => {
          props.history.replace("/");
          onAuthFail();
          setLoading(false);
        });
    }, [props.history, onAuthStart, onAuthSuccess, onAuthFail]);
    const updateUser = useCallback(changedProps => {
      setUser({...user, ...changedProps});
    }, [setUser, user]);
    // Performance Debug
    // console.log('Rendering: ', {user, loading}); 
    return user ? (
      <MemoizedComponent
        {...props}
        user={user}
        updateUser={updateUser}
        loadingUser={loading} // TODO: Remove if not using
        logout={logout} // TODO: Remove if not using
      />
    ) : null;
  };
};

export default withUser;
