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
      <a href="#" onClick={() => { props.acceptFriend(props.friend._id) }}>Accept </a>   |
      <a href="#" onClick={() => { props.deleteFriend(props.friend._id) }}> Delete</a>
    </td>
  </tr>
)


class FriendRequests extends Component {
  _isMounted = false;

  constructor(props) {
    super(props);

    this.deleteFriend = this.deleteFriend.bind(this)
    this.acceptFriend = this.acceptFriend.bind(this)

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

    axios.get('/users/currentUser/requests')
      .then(response => {
        this.setState({ friends: response.data })
      })
      .catch((error) => {
        console.log(error);
      })

    axios.get("/users/currentUser", { withCredentials: true })
      .then(({ data }) => {
        this.setState({
          current_id: data._id,
          userFriends: data.friends
        });
      })
      .catch(error => {
        this.setState({
          isAuthenticated: false
        });
        console.log("Unable to get current user. " + error);
      });
  }

  deleteFriend(friend) {
    axios.get("/users/currentUser", { withCredentials: true })
    .then(({ data }) => {
      axios.post('/friends/requests/delete/' + data._id, {target: friend})
      .then(response => { console.log(response.data) });
    this.setState({
      requests: this.state.friends.filter(el => el !== friend)
    })
    console.log("request deleted");
    });
  }

  acceptFriend(friend) {
    
    axios.get("/users/currentUser", { withCredentials: true })
    .then(({ data }) => {
      
      axios.post("/friends/friends/add/" + data._id, {target: friend})
      .then(res => console.log(res.data));
    });

    axios.get("/users/currentUser", { withCredentials: true })
    .then(({ data }) => {
      
      axios.post("/friends/friends/add/" + friend, {target: data._id})
      .then(res => console.log(res.data));
    });

  this.deleteFriend(friend);

    console.log("accepted");
  }

  friendsList() {
    return this.state.friends.map(currentfriend => {
      return <Friend friend={currentfriend} acceptFriend={this.acceptFriend} deleteFriend={this.deleteFriend} key={currentfriend._id} />;
    })

  }

  

  render() {
    if (!this.state.isAuthenticated) return <Redirect to="/" />
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
          <tbody>
            {this.friendsList()}
          </tbody>
        </table>

      </div>
    )
  }
}

export default withRouter(FriendRequests);