import React, {useEffect} from 'react';
import axios from 'axios';
import withUser from '../hoc/withUser';

const OAuthCallback = ({user}) => {
  useEffect(() => {
    const authCode = new URLSearchParams(window.location.search).get('code');
    if (authCode) {
      axios.post(`/users/${user.id}/googleCalendarAuth`, {authCode})
      .then(res => {
        window.opener.postMessage(true);
        window.close();
      }).catch(console.error);
    }
  }, [user.id]);
  return <div></div>;
}

export default withUser(OAuthCallback);