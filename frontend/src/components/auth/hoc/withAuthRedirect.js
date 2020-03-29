import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuthContext } from "../context/AuthContext";

/**
 * @typedef {Object} options
 * @property {string} [path] - The redirect path
 * @property {boolean} [redirectIfAuth] - If `true`, redirects if the user is authenticated.
 * If `false`, redirects if the user is not authenticated.
 * @property {boolean} [blockRender] - If `true`, blocks rendering of the wrapped component 
 * while authentication state is being retrieved.
 */

/**
 * Higher-order component with custom redirect logic. Can be configured to
 * redirect to a custom path, redirect if the user is authenticated or is
 * not authenticated, and if the render should be blocked while the
 * authentication state of the user is being verified.
 * 
 * @param WrappedComponent The component to wrap. Receives the props:
 * `loadingAuth` - The loading state of the authentication data
 * `authenticated` - The authentication state of the user. This value
 * is only accurate when loadingAuth transitions from true -> false
 * @param {options} options
 */
const withAuthRedirect = (
  WrappedComponent,
  { path, redirectIfAuth, blockRender } = {
    path: "/",
    redirectIfAuth: false,
    blockRender: false
  }
) => {
  return props => {
    const [loading, setLoading] = useState(blockRender);
    const {
      loadingAuth,
      onAuthStart,
      onAuthSuccess,
      onAuthFail,
      authenticated
    } = useAuthContext();
    useEffect(() => {
      onAuthStart();
      axios
        .get("/verify")
        .then(({ data }) => {
          if (data.isValid) {
            onAuthSuccess();
            if (redirectIfAuth) {
              props.history.replace(path);
            } else {
              if (blockRender) {
                setLoading(false);
              }
            }
          } else {
            onAuthFail();
            if (!redirectIfAuth) {
              props.history.replace(path);
            } else {
              if (blockRender) {
                setLoading(false);
              }
            }
          }
        })
        .catch(err => {
          console.error(err);
          onAuthFail();
          if (blockRender) setLoading(false);
        });
    }, [props.history, onAuthStart, onAuthSuccess, onAuthFail]);
    return !loading ? (
      <WrappedComponent
        {...props}
        loadingAuth={loadingAuth}
        authenticated={authenticated}
      />
    ) : null /* Can show spinner */;
  };
};

export default withAuthRedirect;
