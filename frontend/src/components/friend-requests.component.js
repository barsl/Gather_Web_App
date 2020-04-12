import React, {Component} from 'react';
import axios from 'axios';

const Friend = props => (
  <tr>
    <td>{props.friend.title}</td>
    <td>{props.friend.username}</td>
    <td>
      <button
        className="btn btn-success"
        type="button"
        onClick={() => {
          props.acceptFriend(props.friend._id);
        }}
      >
        Accept
      </button>{' '}
      |
      <button
        className="btn btn-danger"
        type="button"
        onClick={() => {
          props.deleteFriend(props.friend._id);
        }}
      >
        Delete
      </button>
    </td>
  </tr>
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
        <Friend
          friend={currentfriend}
          acceptFriend={this.acceptFriend}
          deleteFriend={this.deleteFriend}
          key={currentfriend._id}
        />
      );
    });
  }

  render() {
    return (
      <div>
        <h3> Friend Requests </h3>
        <table className="table">
          <thead className="thead-light">
            {/* <tr>
              <th>User Name</th>
              <th>Actions</th>
            </tr> */}
          </thead>
          <tbody>{this.friendsList()}</tbody>
        </table>
      </div>
    );
  }
}

export default FriendRequests;
