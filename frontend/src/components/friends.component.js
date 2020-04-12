import React, {Component} from 'react';
import FriendsList from './friends-list.component';
import AddFriends from './add-friends.component';
import FriendRequests from './friend-requests.component';
import Navbar from './navbar.component';
import withUser from './auth/hoc/withUser';
import axios from 'axios';

export default withUser(
  class Friends extends Component {
    componentDidMount() {
      this.interval = setInterval(() => {
        axios
          .get('/users/currentUser')
          .then(response => {
            this.props.updateUser({
              friend_requests: response.data.friend_requests,
              friends: response.data.friends,
            });
          })
          .catch(error => {
            console.log(error);
          });
      }, 5000);
    }

    componentWillUnmount() {
      clearInterval(this.interval);
    }
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
