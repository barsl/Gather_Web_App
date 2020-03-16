import React, { Component } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "bootstrap/dist/css/bootstrap.min.css";
import classes from "./style/create-event.module.css";
import Navbar from "./navbar.component";
import { withRouter, Redirect } from "react-router-dom";
import Chatkit from "@pusher/chatkit-client";

class CreateEvent extends Component {
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
  }



  onChangeUser(e) {
    this.setState({
      user: e.target.value
    });
  }

  onSubmit(e) {
    e.preventDefault();

    const event = {
      publicStatus: this.state.publicStatus,
    };
  }

  render() {
    if (!this.state.isAuthenticated) return <Redirect to="/" />;
    return (
      <div>
        <Navbar />
        <h3>Send Request</h3>
        <form onSubmit={this.onSubmit}>
        <div className="form-group">
                <label>Select friends to invite</label>
                <select
                  ref="userInput"
                  className="form-control"
                  onChange={this.onChangeUser}
                >
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
              value="Create Event"
              className="btn btn-primary"
            />
          </div>
        </form>
      </div>
    );
  }
}

export default withRouter(CreateEvent);
