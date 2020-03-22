import React, { Component } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import NavBar from './navbar.component';
import ChatScreen from './chat.component';
import GoogleMap from './map.component';
import Geocode from 'react-geocode';
import './style/map.css';
import './style/edit-event.css'

export default class EditEvent extends Component {
  constructor(props) {
    super(props);
    Geocode.setApiKey("AIzaSyDjmOBK0u2QrCMhLTln-Z_yHWs9MzuzsSk");

    this.onChangeUsername = this.onChangeUsername.bind(this);
    this.onChangeDescription = this.onChangeDescription.bind(this);
    this.onChangeDate = this.onChangeDate.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onChangeTitle = this.onChangeTitle.bind(this);
    this.onAddressChange = this.onAddressChange.bind(this);
    this.onLocationChange = this.onLocationChange.bind(this);

    this.state = {
      public: false,
      username: '',
      title: '',
      description: '',
      address: '',
      date: new Date(),
      invited: [],
      attending: []
    }
  }

  componentDidMount() {
    axios.get('/events/' + this.props.match.params.id)
      .then(response => {
        //console.log(response.data);
        this.setState({
          public: response.data.public,
          username: response.data.username,
          title: response.data.title,
          description: response.data.description,
          date: new Date(response.data.date),
          invited: response.data.invited,
          attending: response.data.attending
        })
      })
      .catch(function (error) {
        console.log(error);
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

  onChangeTitle(e) {
    this.setState({
      title: e.target.value
    })
  }

  onLocationChange(address) {
    this.setState({
      address
    })
  }

  onAddressChange(e) {
    this.setState({
      address: e.target.value
    })
  }

  onSubmit(e) {
    e.preventDefault();
    Geocode.fromAddress(this.state.address)
      .then(res => {
        const { lat, lng } = res.results[0].geometry.location;
        const event = {
          username: this.state.username,
          title: this.state.title,
          description: this.state.description,
          date: this.state.date,
          location: [lat, lng]
        }

        axios.put('/events/' + this.props.match.params.id, event)
          .then(res => console.log(res.data));

        window.location = '/';
      })
      .catch(err => console.error(err));
  }

  render() {
    return (
      <div className='edit_page'>
        <div className='main_edit_screen'>
          <NavBar />
          <h3>Edit Event</h3>

          <GoogleMap onLocationChange={this.onLocationChange} eventName={this.props.location.state.eventName} address={this.props.location.state.address} />
          <form onSubmit={this.onSubmit}>
            <div className="form-group">
              <label>Event title: </label>
              <input
                type="text"
                className="form-control"
                value={this.state.title}
                onChange={this.onChangeTitle}
              />
            </div>
            <div className="form-group">
              <label>Event owner: {this.state.username}</label>
            </div>
            <div className="form-group">
              <label>Description: </label>
              <input type="text"
                className="form-control"
                value={this.state.description}
                onChange={this.onChangeDescription}
              />
            </div>
            <div className="form-group">
              <label>Event Address: </label>
              <input
                type="text"
                required
                className="form-control"
                value={this.state.address}
                onChange={this.onAddressChange}
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

            {!this.state.public && //if the event is public, do not show invited list
              <>
                <div className="form-group">
                  <label>Invited: </label>
                  <ul>
                    {this.state.invited.map(user =>
                      <li key={user._id}>
                        {user.username}
                      </li>)}
                  </ul>
                </div>
              </>
            }

            <div className="form-group">
              <label>Attending: </label>
              <ul>
                {this.state.attending.map(user =>
                  <li key={user._id}>
                    {user.username}
                  </li>)}
              </ul>
            </div>

            <div className="form-group">
              <input type="submit" value="Save changes" className="btn btn-primary" />
            </div>
          </form>
        </div>
        <div className='chat_screen'>
          <ChatScreen roomId={this.props.location.state.roomId} key={this.props.location.state.roomId} />
        </div>
      </div>
    )
  }
}