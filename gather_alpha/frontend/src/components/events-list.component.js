import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Event = props => (
  <tr>
    <td>{props.event.username}</td>
    <td>{props.event.description}</td>
    <td>{props.event.date.substring(0,10)}</td>
    <td>
      <Link to={"/edit/"+props.event._id}>edit</Link> | <a href="#" onClick={() => { props.deleteEvent(props.event._id) }}>delete</a>
    </td>
  </tr>
)

export default class EventsList extends Component {
  constructor(props) {
    super(props);

    this.deleteEvent = this.deleteEvent.bind(this)

    this.state = {events: []};
  }

  componentDidMount() {
    axios.get('http://localhost:5000/events/')
      .then(response => {
        this.setState({ events: response.data })
      })
      .catch((error) => {
        console.log(error);
      })
  }

  deleteEvent(id) {
    axios.delete('http://localhost:5000/events/'+id)
      .then(response => { console.log(response.data)});

    this.setState({
      events: this.state.events.filter(el => el._id !== id)
    })
  }

  eventList() {
    return this.state.events.map(currentevent => {
      return <Event event={currentevent} deleteEvent={this.deleteEvent} key={currentevent._id}/>;
    })
  }

  render() {
    return (
      <div>
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
            { this.eventList() }
          </tbody>
        </table>
      </div>
    )
  }
}