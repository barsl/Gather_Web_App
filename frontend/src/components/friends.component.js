import React, { Component } from 'react';
import FriendsList from "./friends-list.component";
import AddFriends from "./add-friends.component";
import FriendRequests from './friend-requests.component';
import Navbar from "./navbar.component";
import withAuth from "./auth/hoc/withAuth";

export default withAuth(class Friends extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
    <div>
      <Navbar />
      <div className="container-fluid px-4 py-3">
        <AddFriends />
        <FriendsList />
        <FriendRequests />
      </div>
    </div>
    )
  }
});