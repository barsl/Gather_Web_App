import React, { Component } from 'react';
import axios from 'axios';
import FriendsList from "./friends-list.component";
import AddFriends from "./add-friends.component";
import FriendRequests from './friend-requests.component';
import Navbar from "./navbar.component"

export default class Friends extends Component {
  constructor(props) {
    super(props);

  }


  render() {
    
    return (
    <div>
      <Navbar />
      <AddFriends />
      <FriendsList />
      <FriendRequests />
    </div>
    )
  }
}