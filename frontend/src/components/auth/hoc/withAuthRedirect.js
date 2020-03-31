import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {useAuthContext} from '../context/AuthContext';

/**
 * @typedef {Object} options
 * @property {string} [path] - The redirect path
 * @property {boolean} [redirectIfAuth] - If `true`, redirects if the user is authenticated.
 * If `false`, redirects if the user is not authenticated.
 * @property {boolean} [mountWhileLoading] - If `false`, blocks rendering of the wrapped component
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

const completedRenderState = {
  blocking: false,
  loading: false,
};

const withAuthRedirect = (
  WrappedComponent,
  {path, redirectIfAuth, mountWhileLoading} = {
    path: '/',
    redirectIfAuth: false,
    mountWhileLoading: true,
  },
) => {
  const MemoizedComponent = React.memo(WrappedComponent);
  return props => {
    const {
      user,
      onAuthStart,
      onAuthSuccess,
      onAuthFail,
      authenticated,
    } = useAuthContext();
    const [renderState, setRenderState] = useState({
      blocking: !mountWhileLoading || (!user && !redirectIfAuth),
      loading: true,
    });

    useEffect(() => {
      onAuthStart();
      const fetchUser = user === null;
      axios
        .get(fetchUser ? '/users/currentUser' : '/verify')
        .then(({data}) => {
          if (!fetchUser && !data.isValid) {
            throw Error('User is not authenticated.');
          }
          fetchUser ? onAuthSuccess(data) : onAuthSuccess();
          if (redirectIfAuth) {
            props.history.replace(path);
          } else {
            setRenderState(completedRenderState);
          }
        })
        .catch(err => {
          onAuthFail();
          if (!redirectIfAuth) {
            props.history.replace(path);
          } else {
            setRenderState(completedRenderState);
          }
        });
      /* We don't want to add the user as a dependency for this useEffect()
         to avoid unnecessary re-render cycles, so disable linter */

      /* eslint-disable-next-line */
    }, [props.history, onAuthStart, onAuthSuccess, onAuthFail]);
    return !renderState.blocking ? (
      <MemoizedComponent
        {...props}
        loadingAuth={renderState.loading}
        authenticated={authenticated}
      />
    ) : null /* Can show spinner */;
  };
};

export default withAuthRedirect;
