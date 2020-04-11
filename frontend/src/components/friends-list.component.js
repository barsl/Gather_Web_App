import React, {Component} from 'react';
import axios from 'axios';
import classes from './style/friends-list.module.css';

const Friend = props => (
  <div className={classes['friend-card']}>
    <p className={['my-auto', classes['friend-message']].join(' ')}>
      <span className="font-weight-bold">{props.friend.username}</span>
      {' - '}
      {props.friend.name}
    </p>
    <i
      className={classes['friend-cancel']}
      onClick={() => {
        props.deleteFriend(props.friend._id);
      }}
    />
  </div>
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
          friends: data.friends,
        });
      })
      .catch(console.error);
  }

  friendsList() {
    return this.props.user.friends.map(currentfriend => {
      return (
        <div key={currentfriend._id} className={classes['friend-container']}>
          <Friend friend={currentfriend} deleteFriend={this.deleteFriend} />
        </div>
      );
    });
  }

  render() {
    const friendsList = this.friendsList();
    return (
      <>
        <h3 className="font-weight-bold">Friends</h3>
        {friendsList.length > 0 ? (
          <div className="scroll-y">{friendsList}</div>
        ) : (
          <p className="text-muted">
            No friends to show. Add new friends by using the search bar on the
            right.
          </p>
        )}
      </>
    );
  }
}

export default FriendsList;
