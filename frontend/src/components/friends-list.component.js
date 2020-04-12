import React, {Component} from 'react';
import axios from 'axios';

const Friend = props => (
  <tr>
    <td>{props.friend.title}</td>
    <td>{props.friend.username}</td>
    <td>
      <button
        className="btn btn-danger"
        type="button"
        onClick={() => {
          props.deleteFriend(props.friend._id);
        }}
      >
        delete
      </button>
    </td>
  </tr>
);

class FriendsList extends Component {
  constructor(props) {
    super(props);
    this.deleteFriend = this.deleteFriend.bind(this);
    this.state = {friends: [], users: [], isAuthenticated: true};
  }

  deleteFriend(friend) {
    axios
      .patch(`/users/${this.props.user.id}/friends/`, {
        op: 'remove',
        value: friend,
      })
      .then(({data}) => {
        this.props.updateUser({
          // TODO: ensure data returned is updated friends list
          friends: data.friends,
        });
      })
      .catch(console.error);
  }

  friendsList() {
    return this.props.user.friends.map(currentfriend => {
      return (
        <Friend
          friend={currentfriend}
          deleteFriend={this.deleteFriend}
          key={currentfriend._id}
        />
      );
    });
  }

  render() {
    return (
      <div>
        <h3> Current Friends </h3>
        {/* Events that the user is invited to */}
        <table className="table">
          <thead className="thead-light"></thead>
          <tbody>{this.friendsList()}</tbody>
        </table>
      </div>
    );
  }
}

export default FriendsList;
