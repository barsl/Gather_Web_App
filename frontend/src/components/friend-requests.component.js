import React, {Component} from 'react';
import axios from 'axios';
import classes from './style/friend-requests.module.css';

const FriendRequest = props => (
  <div className={classes['friend-request-card']}>
    <button
      className="btn btn-primary my-auto mr-3"
      type="button"
      onClick={() => {
        props.acceptFriend(props.friend._id);
      }}
    >
      Accept
    </button>
    <i
      className={classes['friend-request-cancel']}
      onClick={() => {
        props.deleteFriend(props.friend._id);
      }}
    />
    <p className={['m-auto', classes['friend-request-message']].join(' ')}>
      Friend request from{' '}
      <span className="font-weight-bold">{props.friend.username}</span>.
    </p>
  </div>
);

class FriendRequests extends Component {
  constructor(props) {
    super(props);

    this.deleteFriend = this.deleteFriend.bind(this);
    this.acceptFriend = this.acceptFriend.bind(this);
  }

  deleteFriend(friend) {
    axios
      .patch(`/users/${this.props.user.id}/friend_requests`, {
        op: 'remove',
        value: friend,
      })
      .then(({data}) => {
        this.props.updateUser({friend_requests: data.friend_requests});
      });
  }

  acceptFriend(friend) {
    axios
      .patch(`/users/${this.props.user.id}/friends`, {
        op: 'add',
        value: friend,
      })
      .then(({data}) => {
        this.props.updateUser({
          friends: data.friends,
          friend_requests: data.friend_requests,
        });
      });
  }

  friendsList() {
    return this.props.user.friend_requests.map(currentfriend => {
      return (
        <div
          key={currentfriend._id}
          className={classes['friend-request-container']}
        >
          <FriendRequest
            friend={currentfriend}
            acceptFriend={this.acceptFriend}
            deleteFriend={this.deleteFriend}
          />
        </div>
      );
    });
  }

  render() {
    const friendRequests = this.friendsList();
    return (
      <div className="d-flex flex-column hidden-y">
        <h3 className="font-weight-bold">Friend Requests</h3>
        {friendRequests.length > 0 ? (
          <div className="scroll-y">{friendRequests}</div>
        ) : (
          <p className="text-muted">No friend requests.</p>
        )}
      </div>
    );
  }
}

export default FriendRequests;
