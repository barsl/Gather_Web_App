import React, { Component } from 'react';
import FriendsList from './friends-list.component';
import AddFriends from './add-friends.component';
import FriendRequests from './friend-requests.component';
import Navbar from './navbar.component';
import withUser from './auth/hoc/withUser';
import axios from 'axios';

export default withUser(
  class Friends extends Component {
    constructor(props) {
      super(props);

      this.interval = setInterval(() => {
        axios
          .get('/users/currentUser')
          .then(response => {
            this.props.updateUser({ friend_requests: response.data.friend_requests, friends: response.data.friends });
          })
          .catch(error => {
            console.log(error);
          });
      }, 2000);
    }
    render() {
      return (
        <div>
          <Navbar />
          <div className="container-fluid px-4 py-3">
            <AddFriends user={this.props.user} />
            <FriendsList
              user={this.props.user}
              updateUser={this.props.updateUser}
            />
            <FriendRequests
              user={this.props.user}
              updateUser={this.props.updateUser}
            />
          </div>
        </div>
      );
    }
  },
);
