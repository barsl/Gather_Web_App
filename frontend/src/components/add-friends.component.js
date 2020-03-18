import React, { Component } from "react";
import axios from "axios";
import "react-datepicker/dist/react-datepicker.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { withRouter, Redirect } from "react-router-dom";


class AddFriends extends Component {
  constructor(props) {
    super(props);

    this.onChangeUser = this.onChangeUser.bind(this);

    this.onSubmit = this.onSubmit.bind(this);


    this.state = {
      users: [],
      isAuthenticated: true
    };
  }

  componentDidMount() {
    axios
      .get("/users/", { withCredentials: true })
      .then(({ data }) => {
        this.setState({
          users: data,
        });
      })
      .catch(error => {
        this.setState({
          isAuthenticated: false
        });
        console.log("Unable to get current user. " + error);
      });

      axios
      .get("/users/currentUser", { withCredentials: true })
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



  onChangeUser(e) {
    this.setState({
      user: e.target.value
    });

    // 
  }

  onSubmit(e) {
    e.preventDefault();
    // get target = state.username
    const curr ={
      req: this.state.current_id
    }

    var target = this.state.user;
    // add current user id to friend_requests[] of target
    axios.post('http://localhost:5000/friends/requests/add/' + target, curr)
    .then(res => console.log(res.data));
    // window.location = '/';
  }

  render() {
    if (!this.state.isAuthenticated) return <Redirect to="/" />;
    return (
      <div>
        <h3>Send Request</h3>
        <form onSubmit={this.onSubmit}>
        <div className="form-group">
                <label>Username</label>
                <select
                  ref="userInput"
                  className="form-control"
                  onChange={this.onChangeUser}
                >
                  <option value=""></option>
                  {this.state.users.map(function({ _id, username }) {
                    return (
                      <option key={username} value={_id}>
                        {username}
                      </option>
                    );
                  })}
                </select>
              </div>


          <div className="form-group">
            <input
              type="submit"
              value="Submit"
              className="btn btn-primary"
            />
          </div>
        </form>
      </div>
    );
  }
}

export default withRouter(AddFriends);
