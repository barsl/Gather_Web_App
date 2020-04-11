import React, {Component} from 'react';
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
import Search from '../core/Search/Search';
import TagList from '../core/Tag/TagList/TagList';
import eventPage from './style/event-page.module.css';

class CreateEvent extends Component {
  constructor(props) {
    super(props);
    Geocode.setApiKey('AIzaSyDjmOBK0u2QrCMhLTln-Z_yHWs9MzuzsSk');

    this.onChangeStatus = this.onChangeStatus.bind(this);
    this.onChangeTitle = this.onChangeTitle.bind(this);
    this.onChangeUsername = this.onChangeUsername.bind(this);
    this.onChangeDescription = this.onChangeDescription.bind(this);
    this.onChangeStartDate = this.onChangeStartDate.bind(this);
    this.onChangeEndDate = this.onChangeEndDate.bind(this);
    this.onChangeInvited = this.onChangeInvited.bind(this);
    this.onChangeAttending = this.onChangeAttending.bind(this);
    this.onChangeLocation = this.onChangeLocation.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onRemoveInvite = this.onRemoveInvite.bind(this);
    this.onLocationChange = this.onLocationChange.bind(this);
    this.cancelHandler = this.cancelHandler.bind(this);
    this.selectTagHandler = this.selectTagHandler.bind(this);
    this.removeTagHandler = this.removeTagHandler.bind(this);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1);
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 1);
    this.state = {
      publicStatus: false,
      tagsList: [],
      title: '',
      description: '',
      startDate,
      endDate,
      invited: [],
      attending: [],
      location: '',
      tags: [],
      users: [],
      userFriends: this.props.user.friends,
    };
  }

  componentDidMount() {
    axios
      .get('/consts/interests')
      .then(({data}) => this.setState({tagsList: data}))
      .catch(console.error);
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

  onChangeStartDate(startDate) {
    this.setState({startDate});
  }

  onChangeEndDate(endDate) {
    this.setState({endDate});
  }

  onChangeInvited({target}) {
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

  onLocationChange(address) {
    this.setState({
      location: address,
    });
  }

  selectTagHandler(value) {
    this.setState(prevState => ({tags: [...prevState.tags, value]}));
  }

  removeTagHandler(value) {
    this.setState(prevState => ({
      tags: prevState.tags.filter(tag => value !== tag),
    }));
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
          startDate: this.state.startDate,
          endDate: this.state.endDate,
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

  cancelHandler() {
    this.props.history.push('/eventsList');
  }

  render() {
    const tagsSet = new Set(this.state.tags);
    return (
      <div>
        <Navbar />
        <div className="container-fluid px-4 py-3">
          <div className={eventPage.HorizontalFlex}>
            <h3 className="font-weight-bold m-0">Create New Event</h3>
            <div className={eventPage.ButtonGroup}>
              <div className={classes['button-ctrls']}>
                <input
                  type="submit"
                  value="Create Event"
                  className="btn btn-primary"
                />
                <input
                  type="button"
                  value="Cancel"
                  className="btn btn-secondary"
                  onClick={this.cancelHandler}
                />
              </div>
            </div>
          </div>
          <hr />
          <form onSubmit={this.onSubmit}>
            <div className={eventPage.HorizontalFlex}>
              <div
                className={[eventPage.VerticalFlex, eventPage.Left].join(' ')}
              >
                <div className="form-group">
                  <label className={eventPage.Label}>Event Title: </label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={this.state.title}
                    onChange={this.onChangeTitle}
                  />
                </div>
                <div className="form-group">
                  <label className={eventPage.Label}>
                    <input
                      type="checkbox"
                      className="form-check-inline"
                      onChange={this.onChangeStatus}
                    />
                    Make event public
                  </label>
                </div>

                <div className="form-group">
                  <label className={eventPage.Label}>Description: </label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={this.state.description}
                    onChange={this.onChangeDescription}
                  />
                </div>

                <div className="form-group">
                  <label className={eventPage.Label}>Tags: </label>
                  <TagList
                    tags={this.state.tags}
                    onTagRemove={this.removeTagHandler}
                  />
                  <Search
                    data={this.state.tagsList.filter(tag => !tagsSet.has(tag))}
                    onSelect={this.selectTagHandler}
                    placeholder="Search tags..."
                    emptyMessage="No matching tags..."
                  />
                </div>

                <div className="form-group">
                  <label className={eventPage.Label}>Start date: </label>
                  <div>
                    <DatePicker
                      selected={this.state.startDate}
                      onChange={this.onChangeStartDate}
                      showTimeSelect
                      dateFormat="MM/dd/yy h:mm aa"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className={eventPage.Label}>End date: </label>
                  <div>
                    <DatePicker
                      selected={this.state.endDate}
                      onChange={this.onChangeEndDate}
                      showTimeSelect
                      dateFormat="MM/dd/yy h:mm aa"
                    />
                  </div>
                </div>

                {!this.state.publicStatus && (
                  <>
                    <div className="form-group">
                      <label className={eventPage.Label}>
                        Select friends to invite
                      </label>
                      <select
                        ref="userInput"
                        className="form-control"
                        onChange={this.onChangeInvited}
                      >
                        <option value="">...</option>
                        {this.state.userFriends.map(function({_id, username}) {
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
              </div>
              <div
                className={[eventPage.VerticalFlex, eventPage.Right].join(' ')}
              >
                <div className="form-group">
                  <label className={eventPage.Label}>Event Address: </label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={this.state.location}
                    onChange={this.onChangeLocation}
                  />
                </div>
                <GoogleMap
                  onLocationChange={this.onLocationChange}
                  eventName={this.state.title}
                  addressName={this.state.location}
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default withUser(CreateEvent);
