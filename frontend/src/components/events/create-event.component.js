import React, { Component } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import classes from './style/create-event.module.css';
import Navbar from '../navbar.component';
import Chatkit from '@pusher/chatkit-client';
import Geocode from 'react-geocode';
import withUser from '../auth/hoc/withUser';
import GoogleMap from '../map.component';

class CreateEvent extends Component {
  constructor(props) {
    super(props);
    Geocode.setApiKey('AIzaSyDjmOBK0u2QrCMhLTln-Z_yHWs9MzuzsSk');

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
    this.onRemoveInvite = this.onRemoveInvite.bind(this);
    this.onLocationChange = this.onLocationChange.bind(this);

    this.state = {
      publicStatus: false,
      title: '',
      description: '',
      duration: 0,
      date: new Date(),
      invited: [],
      attending: [],
      location: '',
      tags: [],
      users: [],
      userFriends: [],
    };
  }

  componentDidMount() {
    this.setState({ userFriends: this.props.user.friends });
  }

  onChangeStatus(e) {
    this.setState({
      publicStatus: e.target.checked,
    });
  }

  onChangeTitle(e) {
    this.setState({
      title: e.target.value,
    });
  }

  onChangeUsername(e) {
    this.setState({
      username: e.target.value,
    });
  }

  onChangeDescription(e) {
    this.setState({
      description: e.target.value,
    });
  }

  onChangeDuration(e) {
    this.setState({
      duration: e.target.value,
    });
  }

  onChangeDate(date) {
    this.setState({
      date: date,
    });
  }

  onChangeInvited({ target }) {
    const friendId = target.value;
    this.setState(prevState => {
      const updatedUserFriends = [...prevState.userFriends];
      const selectedFriendIndex = updatedUserFriends.findIndex(
        user => user._id === friendId,
      );
      const selectedFriend = updatedUserFriends[selectedFriendIndex];
      updatedUserFriends.splice(selectedFriendIndex, 1);
      return {
        ...prevState,
        invited: [...prevState.invited, selectedFriend],
        userFriends: updatedUserFriends,
      };
    });
  }

  onRemoveInvite(friendId) {
    this.setState(prevState => {
      const updatedInvitedList = [...prevState.invited];
      const selectedFriendIndex = updatedInvitedList.findIndex(
        user => user._id === friendId,
      );
      const selectedFriend = updatedInvitedList[selectedFriendIndex];
      updatedInvitedList.splice(selectedFriendIndex, 1);
      return {
        ...prevState,
        userFriends: [...prevState.userFriends, selectedFriend],
        invited: updatedInvitedList,
      };
    });
  }

  onChangeAttending(e) {
    this.setState({
      attending: e.target.value,
    });
  }

  onChangeLocation(e) {
    this.setState({
      location: e.target.value,
    });
  }

  onChangeTags(e) {
    this.setState({
      tags: e.target.value,
    });
  }

  onLocationChange(address) {
    this.setState({
      location: address
    })
  }

  onSubmit(e) {
    e.preventDefault();

    const chatManager = new Chatkit.ChatManager({
      instanceLocator: 'v1:us1:1956d6a4-c213-42ad-b3a5-ac091e1b514a',
      userId: this.props.user.username,
      tokenProvider: new Chatkit.TokenProvider({
        url: '/chat/auth',
      }),
    });

    const createRoomPromise = chatManager.connect().then(currentUser => {
      console.log('creating room');
      return currentUser.createRoom({
        name: this.state.title,
        private: false,
        addUserIds: this.state.attending,
        customData: {},
      });
    });

    const getGeocodePromise = Geocode.fromAddress(this.state.location);

    Promise.all([createRoomPromise, getGeocodePromise])
      .then(([room, res]) => {
        const lat = res.results[0].geometry.location.lat;
        const lng = res.results[0].geometry.location.lng;

        const event = {
          publicStatus: this.state.publicStatus,
          title: this.state.title,
          username: this.props.user.username,
          description: this.state.description,
          date: this.state.date,
          invited: this.state.invited,
          attending: this.state.attending,
          location: [lat, lng],
          tags: this.state.tags,
          roomId: room.id,
        };
        return axios.post('/events', event); // Event created here!
      })
      .then(() => {
        this.props.history.push('/eventsList');
      })
      .catch(console.error);
  }

  render() {
    return (
      <div>
        <Navbar />
        <h3>Create New Event</h3>
        <form onSubmit={this.onSubmit}>
          <div className="form-group">
            <label>Event Title: </label>
            <input
              type="text"
              required
              className="form-control"
              value={this.state.title}
              onChange={this.onChangeTitle}
            />
          </div>
          <GoogleMap onLocationChange={this.onLocationChange} location={[0, 0]} eventName={this.state.title} addressName={this.state.location} />
          <div className="form-group">
            <label>Event Address: </label>
            <input
              type="text"
              required
              className="form-control"
              value={this.state.location}
              onChange={this.onChangeLocation}
            />
          </div>

          <div className="form-group">
            <label>Username: </label>
            <p>{this.props.user.username}</p>
          </div>

          <div className="form-group">
            <label>
              <input type="checkbox" onChange={this.onChangeStatus} />
              Make event public
            </label>
          </div>

          <div className="form-group">
            <label>Description: </label>
            <input
              type="text"
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

          {!this.state.publicStatus && (
            <>
              <div className="form-group">
                <label>Select friends to invite</label>
                <select
                  ref="userInput"
                  className="form-control"
                  onChange={this.onChangeInvited}
                >
                  <option value="">...</option>
                  {this.state.userFriends.map(function ({ _id, username }) {
                    return (
                      <option key={username} value={_id}>
                        {username}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="form-group">
                <ul className={classes.InvitedList}>
                  {this.state.invited.map(user => {
                    return (
                      <li
                        key={user._id}
                        onClick={() => this.onRemoveInvite(user._id)}
                      >
                        {user.username}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </>
          )}

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

export default withUser(CreateEvent);
