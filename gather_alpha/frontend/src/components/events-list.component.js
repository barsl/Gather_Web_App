import React, { Component } from 'react';
import { Link, withRouter, Redirect } from 'react-router-dom';
import axios from 'axios';
import Navbar from "./navbar.component"

const Event = props => (
  <tr>
    <td>{props.event.username}</td>
    <td>{props.event.description}</td>
    <td>{props.event.date.substring(0, 10)}</td>
    <td>
      <Link to={"/edit/" + props.event._id}>edit</Link> | <a href="#" onClick={() => { props.deleteEvent(props.event._id) }}>delete</a>
    </td>
  </tr>
)

class EventsList extends Component {
  _isMounted = false;

  constructor(props) {
    super(props);

    this.deleteEvent = this.deleteEvent.bind(this)

    this.state = { events: [], isAuthenticated: true };
  }

  componentDidMount() {
    this._isMounted = true;

    axios.get('/verify', { withCredentials: true })
      .then(res => {
        if (!res.data.isValid && this._isMounted) this.setState({
          isAuthenticated: false
        });
      })
      .catch(err => {
        console.error(err);
      })

    axios.get('/events/')
      .then(response => {
        this.setState({ events: response.data })
      })
      .catch((error) => {
        console.log(error);
      })
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  deleteEvent(id) {
    axios.delete('/events/' + id)
      .then(response => { console.log(response.data) });

    this.setState({
      events: this.state.events.filter(el => el._id !== id)
    })
  }

  eventList() {
    return this.state.events.map(currentevent => {
      return <Event event={currentevent} deleteEvent={this.deleteEvent} key={currentevent._id} />;
    })
  }

  render() {
    if (!this.state.isAuthenticated) return <Redirect to="/" />
    return (
      <div>
        <Navbar />
        <h3>Logged Events</h3>
        <table className="table">
          <thead className="thead-light">
            <tr>
              <th>Username</th>
              <th>Description</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {this.eventList()}
          </tbody>
        </table>
      </div>
    )
  }
}

export default withRouter(EventsList);