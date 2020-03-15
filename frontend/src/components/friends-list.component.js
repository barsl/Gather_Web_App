import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const barsl = "5e63e0a7a20ecb641223533b"

const Friend = props => (
  <tr>
    <td>{props.username}</td> 
    <td>
      <a href="#" >delete</a>
    </td>
  </tr>
)

export default class FriendsList extends Component {
  constructor(props) {
    super(props);

    this.state = {friends: [], users: [], isAuthenticated: true};
  }

  // set the list of freinds in the state
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
    
    // get all friend uids of current user's friends
    axios.get('http://localhost:5000/friends/list')// +'id' of current user)
      .then(response => {
        // set them in state
        this.setState({ friends: response.data });
        // update users array with user object of friends
        for (var i = 0; i <= this.state.friends.length; i++){
          this.addUsers(this.state.friends[i]);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  addUsers(param) {
    axios.get('http://localhost:5000/users/'+param)// +'id' of current user)
    .then(response => {
      // set them in state
      this.setState({
        users: this.state.users.concat(response.data)
      });
    })
    .catch((error) => {
      console.log(error);
    });
  }

  friendsList() {
    return this.state.users.map(currentfriend => {
      return <Friend username={currentfriend.username} key={currentfriend._id}/>;
   });
  }
  

  render() {
    return (
      <div>
        <h3>Current Friends:</h3>
        <table className="table">
          <thead className="thead-light">
            <tr>
              <th>Username</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            { this.friendsList() }
          </tbody>
        </table>
      </div>
    )
  }
}