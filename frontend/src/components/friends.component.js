import React, {Component} from 'react';
import FriendsList from './friends-list.component';
import AddFriends from './add-friends.component';
import FriendRequests from './friend-requests.component';
import Navbar from './navbar.component';
import withUser from './auth/hoc/withUser';

export default withUser(
  class Friends extends Component {
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
