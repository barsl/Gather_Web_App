import withAuthRedirect from "./withAuthRedirect";

/**
 * Higher-order component which redirects the user to the root path "/"
 * if the user is not authenticated. Calls `withAuthRedirect` with the 
 * default options.
 * 
 * @param WrappedComponent The guarded component. Receives the props:
 * `loadingAuth` - The loading state of the authentication data
 * `authenticated` - The authentication state of the user. This value
 * is only accurate when loadingAuth transitions from true -> false
 */
const withAuth = WrappedComponent => withAuthRedirect(WrappedComponent);

export default withAuth;
