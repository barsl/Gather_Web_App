import React, { Component } from 'react';
import axios from 'axios';

export default class AddFriends extends Component {
  constructor(props) {
    super(props);

    this.onChangeUsername = this.onChangeUsername.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this.state = {
      users: []
    }
  }

  componentDidMount() {
    axios.get('http://localhost:5000/users/')
      .then(response => {
        if (response.data.length > 0) {
          this.setState({
            users: response.data.map(user => user.username),
            username: response.data[0].username,
            uid: response.data[0]._id,
            friend_requests: response.data[0].friend_requests
          })
        }
      })
      .catch((error) => {
        console.log(error);
      })

  }

  onChangeUsername(e) {
    this.setState({
      username: e.target.value
    });
    this.getUidAndReqs(e.target.value);
  }

  getUidAndReqs(username){
    axios.get('http://localhost:5000/users/name/'+username)// +'id' of current user)
    .then(response => {
      // set them in state
      console.log(response);
      this.setState({
        uid: response.data._id,
        friend_requests: response.data.friend_requests
      });
    })
    .catch((error) => {
      console.log(error);
    });
  }

  // send a friend request to target
  // i.e. add current userid to the list of friend_requests of target 
  onSubmit(e) {
    e.preventDefault();
    // get target = state.username
    const bar ={
      req: this.state.friend_requests
    }

    var target = this.state.uid;
    // add current user id to friend_requests[] of target
    axios.post('http://localhost:5000/friends/update/' + target, bar)
    .then(res => console.log(res.data));
    // window.location = '/';
  }

  render() {
    return (
    <div>
      <h3>Add Friend</h3>
      <form onSubmit={this.onSubmit}>
        <div className="form-group"> 
          <select ref="userInput"
              required
              className="form-control"
              value={this.state.username}
              onChange={this.onChangeUsername}>
              {
                this.state.users.map(function(user) {
                  return <option 
                    key={user}
                    value={user}>{user}
                    </option>;
                })
              }
          </select>
        </div>
        <div className="form-group">
          <input type="submit" value="Send Request" className="btn btn-primary" />
        </div>
      </form>
    </div>
    )
  }
}