import React, { Component } from 'react';
import { Link, withRouter, Redirect } from 'react-router-dom';
import axios from 'axios';
import Navbar from "./navbar.component"
import Chatkit from '@pusher/chatkit-client';
import Cookies from 'js-cookie';

const Event = props => (
  <tr>
    <td>
      <Link to={"/eventChat/" + props.event.title}>{props.event.title}</Link>
    </td>
    <td>{props.event.description}</td>
    <td>{props.event.date.substring(0, 10)}</td>
    <td>
      {/* eslint-disable-next-line */}
      <Link to={"/edit/" + props.event._id}>edit</Link> | <a href="#" onClick={() => { props.deleteEvent(props.event._id, props.event.title) }}>delete</a>
    </td>
  </tr>
)

const PublicEvent = props => (
  <tr>
    <td>
      <Link to={"/eventChat/" + props.event.title}>{props.event.title}</Link>
    </td>
    <td>{props.event.description}</td>
    <td>{props.event.date.substring(0, 10)}</td>
  </tr>
)

class EventsList extends Component {
  _isMounted = false;

  constructor(props) {
    super(props);

    this.deleteEvent = this.deleteEvent.bind(this)

    this.state = { events: [], publicEvents: [], isAuthenticated: true };
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

    axios.get('/users/currentUser/InvitedTo')
      .then(response => {
        this.setState({ events: response.data })
      })
      .catch((error) => {
        console.log(error);
      })

     axios.get('/events/public')
      .then(response => {
        this.setState({ publicEvents: response.data })
        })
      .catch((error) => {
        console.log(error);
      })
  }

<<<<<<< HEAD
  deleteEvent(id) {
    axios.delete('/events/' + id)
      .then(response => { console.log(response.data) });
    this.setState({
      events: this.state.events.filter(el => el._id !== id)
=======
  deleteEvent(id, title) {
    const chatManager = new Chatkit.ChatManager({
      instanceLocator: 'v1:us1:1956d6a4-c213-42ad-b3a5-ac091e1b514a',
      userId: Cookies.get('username'),
      tokenProvider: new Chatkit.TokenProvider({
        url: '/chat/auth'
      })
>>>>>>> implemented adding markers functionality to the map
    })
    return chatManager
      .connect()
      .then(currentUser => {
        currentUser.deleteRoom({ roomId: title })
          .then(() => {
            axios.delete('/events/' + id)
              .then(response => { console.log(response.data) });

            this.setState({
              events: this.state.events.filter(el => el._id !== id)
            })
          })
          .catch(err => console.error(err))
      })
      .catch(err => console.error(err))
  }

  eventList() {
    //console.log("events: " + this.state.events);

    return this.state.events.map(currentevent => {
      return <Event event={currentevent} deleteEvent={this.deleteEvent} key={currentevent._id} />;
    })
  }

  publicEventList() {
    return this.state.publicEvents.map(currentevent => {
      return <PublicEvent event={currentevent} key={currentevent._id} />;
    })
  }

  render() {
    if (!this.state.isAuthenticated) return <Redirect to="/" />
    return (
      <div>
        <Navbar />
        <h3> My Events </h3>
        {/* Events that the user is invited to */}
        <table className="table">
          <thead className="thead-light">
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {this.eventList()}
          </tbody>
        </table>

        <h3> Public Events </h3>
        <table className="table">
          <thead className="thead-light">
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {this.publicEventList()}
          </tbody>
        </table>

      </div>
    )
  }
}

export default withRouter(EventsList);