import React, { Component } from "react";
import axios from "axios";
import Navbar from "./navbar.component";
import withUser from "./auth/hoc/withUser";

class UserProfile extends Component {
  constructor(props) {
    super(props);
    this.googleCalendarHandler = this.googleCalendarHandler.bind(this);
    this.getCalendarEvents = this.getCalendarEvents.bind(this);
    this.state = {
      loading: false,
      googleConnected: false
    };
  }

  componentDidMount() {
    this.setState({
      googleConnected: this.props.user.gcAuthToken !== undefined
    });
  }

  googleCalendarHandler() {
    axios
      .get("/authenticateGoogleUser")
      .then(res => {
        window.open(res.data);
        window.addEventListener(
          "message",
          e => {
            this.setState({ googleConnected: e.data });
          },
          { once: true }
        );
      })
      .catch(console.error);
  }

  getCalendarEvents() {
    axios
      .get(`/users/${this.props.user.id}/gcevents`)
      .then(res => {
        res.data.events.forEach(event => console.log(event));
      })
      .catch(console.log);
  }

  render() {
    return (
      <div>
        <Navbar />

        {!this.state.loading ? (
          <>
            <h3> My Profile </h3>
            <p>Username: {document.cookie.split("=")[1]}</p>
            <p>First Name: </p>
            <p>Last Name: </p>
            {!this.state.googleConnected && (
              <button
                onClick={this.googleCalendarHandler}
                className="btn btn-primary"
              >
                Connect Google Calendar
              </button>
            )}
            <p>
              Google Calendar Connected:{" "}
              <label> {this.state.googleConnected ? "Yes" : "No"}</label>{" "}
            </p>
            {this.state.googleConnected && (
              <button
                onClick={this.getCalendarEvents}
                className="btn btn-primary"
              >
                Test
              </button>
            )}
          </>
        ) : null /* Render a spinner */}
      </div>
    );
  }
}

export default withUser(UserProfile);
