import React, { Component } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import Navbar from "./navbar.component"
import { withRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

class CreateEvent extends Component {
  constructor(props) {
    super(props);

    this.onChangeStatus = this.onChangeStatus.bind(this);
    this.onChangeTitle = this.onChangeTitle.bind(this);
    this.onChangeUsername = this.onChangeUsername.bind(this);
    this.onChangeDescription = this.onChangeDescription.bind(this);
    this.onChangeDate = this.onChangeDate.bind(this);
    this.onChangeDuration = this.onChangeDuration.bind(this);
    this.onChangeInvited = this.onChangeInvited.bind(this);
    this.onChangeAttending = this.onChangeAttending.bind(this);
    this.onChangeLocation = this.onChangeLocation.bind(this);
    this.onChangeTags = this.onChangeTags.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this.state = {
      publicStatus: false,
      title: '',
      username: '',
      description: '',
      duration: 0,
      date: new Date(),
      invited: [],
      attending: [],
      location: '',
      tags: [],
      users: [],
      userFriends: []
    }
  }

  componentDidMount() {
    axios.get('/users/')
      .then(response => {
        if (response.data.length > 0) {
          this.setState({
            username: user.username,
            userFriends: user.friends
          })
          console.log("got user: " + user.username);
        }
      })
      .catch((error) => {
        console.log("Unable to get current user. " + error);
      })
  }

  onChangeStatus(e) {
    this.setState({
      publicStatus: e.target.value
    })
  }

  onChangeTitle(e) {
    this.setState({
      title: e.target.value
    })
  }

  onChangeUsername(e) {
    this.setState({
      username: e.target.value
    })
  }

  onChangeDescription(e) {
    this.setState({
      description: e.target.value
    })
  }

  onChangeDuration(e) {
    this.setState({
      duration: e.target.value
    })
  }

  onChangeDate(date) {
    this.setState({
      date: date
    })
  }

  onChangeInvited(e) {
    this.setState({
      invited: e.target.value
    })
  }

  onChangeAttending(e) {
    this.setState({
      attending: e.target.value
    })
  }

  onChangeLocation(e) {
    this.setState({
      location: e.target.value
    })
  }

  onChangeTags(e) {
    this.setState({
      tags: e.target.value
    })
  }

  onSubmit(e) {
    e.preventDefault();

    const event = {
      publicStatus: this.state.publicStatus,
      title: this.state.title,
      username: this.state.username,
      description: this.state.description,
      date: this.state.date,
      invited: this.state.invited,
      attending: this.state.attending,
      location: this.state.location,
      tags: this.state.tags
    }

    console.log(event);

    axios.post('/events/add', event)
      .then(res => console.log(res.data));

    window.location = '/';
  }

  render() {
    return (
      <div>
        <Navbar />
        <h3>Create New Event</h3>
        <form onSubmit={this.onSubmit}>

          <div className="form-group">
            <label>Event Title: </label>
            <input type="text"
              required
              className="form-control"
              value={this.state.title}
              onChange={this.onChangeTitle}
            />
          </div>

          <div className="form-group">
            <label>Username: </label>

          </div>

          <div className="form-group">
            <label>Description: </label>
            <input type="text"
              required
              className="form-control"
              value={this.state.description}
              onChange={this.onChangeDescription}
            />
          </div>

          <div className="form-group">
            <label>Date: </label>
            <div>
              <DatePicker
                selected={this.state.date}
                onChange={this.onChangeDate}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Select friends to invite</label>
            <select ref="userInput"
              required
              className="form-control"
              value={this.state.username}
              onChange={this.onChangeUsername}>
              {
                this.state.users.map(function (user) {
                  return <option
                    key={user}
                    value={user}>{user}
                  </option>;
                })
              }
            </select>
          </div>

          <div className="form-group">
            <input type="submit" value="Create Event" className="btn btn-primary" />
          </div>
        </form>
      </div>
    )
  }
}

export default withRouter(CreateEvent);