import React, { Component } from 'react';
import { Link, withRouter, Redirect } from 'react-router-dom';
import axios from 'axios';
import Navbar from "./navbar.component"

const Friend = props => (
  <tr>
    <td>
      {props.friend.title}
    </td>
    <td>{props.friend.username}</td>
    <td>
      <a href="#" onClick={() => { props.deleteFriend(props.friend._id) }}>delete</a>
    </td>
  </tr>
)


class FriendsList extends Component {
  _isMounted = false;

  constructor(props) {
    super(props);

    this.deleteFriend = this.deleteFriend.bind(this)

    this.state = {friends: [], users: [], isAuthenticated: true};
  }

  componentDidMount() {
    axios.get('/verify', { withCredentials: true })
      .then(res => {
        if (!res.data.isValid) {
          this.setState({
            isAuthenticated: false
          });
        }
      })
      .catch(err => {
        console.error(err);
      })

    axios.get('/users/currentUser/friends')
      .then(response => {
        this.setState({ friends: response.data })
      })
      .catch((error) => {
        console.log(error);
      })
  }

  deleteFriend(friend) {
    axios.get("/users/currentUser", { withCredentials: true })
    .then(({ data }) => {
      axios.post('/friends/friends/delete/' + data._id, {target: friend})
      .then(response => { console.log(response.data) });
    this.setState({
      friends: this.state.friends.filter(el => el !== friend)
    })
    console.log("friend deleted");
    });

    axios.get("/users/currentUser", { withCredentials: true })
    .then(({ data }) => {
      axios.post('/friends/friends/delete/' + friend, {target: data._id})
      .then(response => { console.log(response.data) });
    })
    console.log("self deleted from friend");

  }

  friendsList() {

    return this.state.friends.map(currentfriend => {
      return <Friend friend={currentfriend} deleteFriend={this.deleteFriend} key={currentfriend._id} />;
    })

  }

  

  render() {
    if (!this.state.isAuthenticated) return <Redirect to="/" />
    return (
      <div>
        <h3> Current Friends </h3>
        {/* Events that the user is invited to */}
        <table className="table">
          <thead className="thead-light">
            {/* <tr>
              <th>User Name</th>
              <th>Actions</th>
            </tr> */}
          </thead>
          <tbody>
            {this.friendsList()}
          </tbody>
        </table>

      </div>
    )
  }
}

export default withRouter(FriendsList);