import React, {Component} from 'react';
import axios from 'axios';
import NavBar from '../navbar.component';
import ChatScreen from '../chat.component';
import GoogleMap from '../map.component';
import '../style/map.css';
import withUser from '../auth/hoc/withUser';
import io from 'socket.io-client';
import TagList from '../core/Tag/TagList/TagList';
import {getAddressFromCoordinates} from '../../util/MapUtil';
import classes from './style/event-page.module.css';
import {getFormattedDateStringLong} from '../../util/DateUtil';
import Form from '../Form';
import AllImages from '../AllImages';

class EventPage extends Component {
  constructor(props) {
    super(props);
    this.socket = io('http://localhost:5000');
    // this.socket = io('https://gatherup.social');

    this.fetchEvents = this.fetchEvents.bind(this);
    this.editHandler = this.editHandler.bind(this);
    this.deleteHandler = this.deleteHandler.bind(this);

    this.state = {
      loading: true,
      public: false,
      roomId: null,
      username: '',
      title: '',
      description: '',
      address: '',
      startDate: new Date(),
      endDate: new Date(),
      invited: [],
      attending: [],
      location: [],
      tags: [],
      tagsList: [],
    };

    this.socket.on('RECEIVE_EVENT_UPDATE', event => {
      getAddressFromCoordinates(event.location).then(address => {
        this.setState({
          ...event,
          startDate: new Date(event.startDate),
          endDate: new Date(event.endDate),
          address,
        });
      });
    });
  }

  componentDidMount() {
    if (!this.props.loadingUser && this.props.authenticated) {
      this.fetchEvents();
    }
    this.socket.emit('JOIN_EVENT', this.props.match.params.id);
  }

  componentWillUnmount() {
    this.socket.close();
  }

  componentDidUpdate(prevProps) {
    // if authentication complete (ie. no longer loading) && authenticated
    if (prevProps.loadingUser && !this.props.loadingUser && this.props.user) {
      this.fetchEvents();
    }
  }

  fetchEvents() {
    const fetchEventData = axios.get('/events/' + this.props.match.params.id);
    const fetchTags = axios.get('/consts/interests');
    Promise.all([fetchEventData, fetchTags])
      .then(([eventResponse, tagsResponse]) => {
        return Promise.all([
          getAddressFromCoordinates(eventResponse.data.location),
          eventResponse.data,
          tagsResponse.data,
        ]);
      })
      .then(([address, eventData, tagsData]) => {
        this.setState({
          tagsList: tagsData,
          public: eventData.public,
          location: eventData.location,
          address,
          username: eventData.username,
          title: eventData.title,
          description: eventData.description,
          startDate: new Date(eventData.startDate),
          endDate: new Date(eventData.endDate),
          invited: eventData.invited,
          attending: eventData.attending,
          tags: eventData.tags,
          roomId: eventData.roomId,
          loading: false,
        });
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  editHandler() {
    this.props.history.push('/edit/' + this.props.match.params.id, {
      returnUrl: this.props.location.pathname,
    });
  }

  deleteHandler() {
    axios
      .delete('/events/' + this.props.match.params.id)
      .then(() => {
        this.props.history.push('/eventsList');
      })
      .catch(console.debug);
  }

  render() {
    const eventPage = (
      <div
        className={[classes.HorizontalFlex, classes.OuterContainer, "scroll-y"].join(' ')}
      >
        <div className={[classes.VerticalFlex, classes.MainContent].join(' ')}>
          <div className="container-fluid px-4 py-3">
            <div className={classes.HorizontalFlex}>
              <h3 className={[classes.Title, 'font-weight-bold'].join(' ')}>
                {this.state.title}
              </h3>

              <div className={classes.ButtonGroup}>
                <div className={classes['button-ctrls']}>
                  {this.state.endDate > new Date() &&
                    (!this.state.public ||
                      this.state.username === this.props.user.username) && (
                      <input
                        type="submit"
                        value="Edit"
                        className="btn btn-primary"
                        onClick={this.editHandler}
                      />
                    )}
                  {this.state.username === this.props.user.username && (
                    <input
                      type="button"
                      value="Delete"
                      className="btn btn-danger"
                      onClick={this.deleteHandler}
                    />
                  )}
                </div>
              </div>
            </div>

            <hr />

            <div className={classes.HorizontalFlex}>
              <div className={[classes.VerticalFlex, classes.Left].join(' ')}>
                <div className="form-group">
                  <label className={classes.Label}>Event owner: </label>{' '}
                  {this.state.username}
                </div>
                <div className="form-group">
                  <label className={classes.Label}>Description:</label>{' '}
                  {this.state.description}
                </div>

                <div className="form-group">
                  <label className={classes.Label}>Start date: </label>
                  {' ' + getFormattedDateStringLong(this.state.startDate)}
                </div>
                <div className="form-group">
                  <label className={classes.Label}>End date: </label>
                  {' ' + getFormattedDateStringLong(this.state.endDate)}
                </div>

                <div className="form-group">
                  <label className={classes.Label}>Tags:</label>
                  <TagList tags={this.state.tags} />
                </div>

                {!this.state.public && this.state.invited.length > 0 && (
                  //if the event is public, do not show invited list
                  <div className="form-group">
                    <label className={classes.Label}>Invited: </label>
                    <ul>
                      {this.state.invited.map(user => (
                        <li key={user._id}>{user.username}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {this.state.attending.length > 0 && (
                  <div className="form-group">
                    <label className={classes.Label}>Attending:</label>
                    <ul>
                      {this.state.attending.map(user => (
                        <li key={user._id}>{user.username}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className={[classes.VerticalFlex, classes.Right].join(' ')}>
                <GoogleMap
                  eventName={this.state.title}
                  addressName={this.state.address}
                  location={this.state.location}
                />
                <div className="form-group">
                  <p>{this.state.address}</p>
                </div>
              </div>
            </div>
            <hr />
            <h4>Media</h4>
            <Form event_id={this.props.match.params.id} />
            <AllImages event_id={this.props.match.params.id} />
          </div>
        </div>
        <ChatScreen roomId={this.state.roomId} key={this.state.roomId}/>
      </div>
    );
    return (
      <div className="event_page fh hidden-y d-flex flex-column">
        <NavBar />
        {!this.state.loading ? eventPage : null}
      </div>
    );
  }
}

export default withUser(EventPage);
