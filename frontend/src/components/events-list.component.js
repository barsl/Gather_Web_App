import React, { Component } from "react";
import { Link, withRouter, Redirect } from "react-router-dom";
import axios from "axios";
import Navbar from "./navbar.component";

const eventFactory = eventType => {
  return props => (
    <tr>
      <td>
        <Link to={"/eventChat/" + props.event.title}>{props.event.title}</Link>
      </td>
      <td>{props.event.description}</td>
      <td>{props.event.date.substring(0, 10)}</td>
      <td>
        {/* eslint-disable-next-line */}
        {eventType !== "public" && (
          <Link to={"/edit/" + props.event._id}>edit</Link>
        )}{" "}
        {eventType === "created" && (
          <>
            |{" "}
            <a
              href="#"
              onClick={() => {
                props.deleteEvent(props.event);
              }}
            >
              delete
            </a>
          </>
        )}
        {(eventType === "invited" || eventType === "public") && (
          <>
            |{" "}
            <a
              href="#"
              onClick={() => {
                props.setAttending(props.event, true);
              }}
            >
              attend
            </a>
          </>
        )}
        {eventType === "attending" && (
          <>
            |{" "}
            <a
              href="#"
              onClick={() => {
                props.setAttending(props.event, false);
              }}
            >
              unattend
            </a>
          </>
        )}
      </td>
    </tr>
  );
};

class EventsList extends Component {
  _isMounted = false;

  constructor(props) {
    super(props);

    this.deleteEvent = this.deleteEvent.bind(this);
    this.setAttending = this.setAttending.bind(this);

    this.state = {
      createdEvents: [],
      invitedEvents: [],
      attendingEvents: [],
      publicEvents: [],
      isAuthenticated: true
    };
  }

  componentDidMount() {
    axios
      .get("/verify", { withCredentials: true })
      .then(res => {
        if (!res.data.isValid) {
          this.setState({
            isAuthenticated: false
          });
        }
      })
      .catch(err => {
        console.error(err);
      });

    axios
      .get("/users/currentUser/events")
      .then(response => {
        const { invitedEvents, attendingEvents, createdEvents } = response.data;
        this.setState({ invitedEvents, attendingEvents, createdEvents });
      })
      .catch(error => {
        console.log(error);
      });

    axios
      .get("/events/public")
      .then(response => {
        this.setState({ publicEvents: response.data });
      })
      .catch(error => {
        console.log(error);
      });
  }

  deleteEvent(event) {
    axios.delete("/events/" + event._id).then(response => {
      console.log(response.data);
    });
    this.setState({
      createdEvents: this.state.createdEvents.filter(el => el._id !== event._id)
    });
    if (event.public) {
      this.setState({
        publicEvents: this.state.publicEvents.filter(el => el._id !== event._id)
      });
    }
  }

  setAttending(event, isAttending) {
    axios
      .patch("/users/currentUser/", {
        attendingEvents: event._id,
        action: isAttending ? "add" : "remove"
      })
      .then(res => {
        const { attendingEvents, invitedEvents } = res.data;
        this.setState({ attendingEvents, invitedEvents });
      })
      .catch(console.log);
  }

  createdEventList() {
    const Event = eventFactory("created");
    return this.state.createdEvents.map(currentevent => {
      return (
        <Event
          event={currentevent}
          deleteEvent={this.deleteEvent}
          key={currentevent._id}
        />
      );
    });
  }

  attendingEventList() {
    const Event = eventFactory("attending");
    return this.state.attendingEvents.map(currentevent => {
      return (
        <Event
          event={currentevent}
          key={currentevent._id}
          setAttending={event => this.setAttending(event, false)}
        />
      );
    });
  }

  invitedEventList() {
    const Event = eventFactory("invited");
    return this.state.invitedEvents.map(currentevent => {
      return (
        <Event
          event={currentevent}
          key={currentevent._id}
          setAttending={event => this.setAttending(event, true)}
        />
      );
    });
  }

  publicEventList() {
    const Event = eventFactory("public");
    return this.state.publicEvents.map(currentevent => {
      return (
        <Event
          event={currentevent}
          key={currentevent._id}
          setAttending={event => this.setAttending(event, true)}
        />
      );
    });
  }

  render() {
    if (!this.state.isAuthenticated) return <Redirect to="/" />;
    return (
      <div>
        <Navbar />
        <h3> My Events </h3>
        {this.state.createdEvents.length > 0 && (
          <>
            <h4>Created Events</h4>
            <table className="table">
              <thead className="thead-light">
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>{this.createdEventList()}</tbody>
            </table>
          </>
        )}
        {this.state.attendingEvents.length > 0 && (
          <>
            <h4>Attending Events</h4>
            <table className="table">
              <thead className="thead-light">
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>{this.attendingEventList()}</tbody>
            </table>
          </>
        )}
        {this.state.invitedEvents.length > 0 && (
          <>
            <h4>Invited Events</h4>
            <table className="table">
              <thead className="thead-light">
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>{this.invitedEventList()}</tbody>
            </table>
          </>
        )}
        <h3> Public Events </h3>
        <table className="table">
          <thead className="thead-light">
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>{this.publicEventList()}</tbody>
        </table>
      </div>
    );
  }
}

export default withRouter(EventsList);
