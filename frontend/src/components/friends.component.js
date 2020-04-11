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
        <div className="fh d-flex flex-column">
          <Navbar />
          <div className="container-fluid px-4 py-3 row hidden-y">
            <div className="col-sm-6 py-2 d-flex flex-column h-100">
              <FriendsList
                user={this.props.user}
                updateUser={this.props.updateUser}
              />
            </div>
            <div className="col-sm-6 py-2 d-flex flex-column h-100">
              <AddFriends user={this.props.user} />
              <FriendRequests
                user={this.props.user}
                updateUser={this.props.updateUser}
              />
            </div>
          </div>
        </div>
      );
    }
  },
);
