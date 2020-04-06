import React, {Component} from 'react';
import axios from 'axios';
import NavBar from '../navbar.component';
import ChatScreen from '../chat.component';
import GoogleMap from '../map.component';
import '../style/map.css';
import withAuth from '../auth/hoc/withAuth';
import io from 'socket.io-client';
import TagList from '../core/Tag/TagList/TagList';
import {getAddressFromCoordinates} from '../../util/MapUtil';
import classes from './style/event-page.module.css';
import {getFormattedDateStringNumeric} from '../../util/DateUtil';

class EventPage extends Component {
  constructor(props) {
    super(props);
    this.socket = io('http://localhost:5000');
    // this.socket = io('https://gatherup.social');

    this.fetchEvents = this.fetchEvents.bind(this);
    this.editHandler = this.editHandler.bind(this);
    this.backHandler = this.backHandler.bind(this);

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
    if (!this.props.loadingAuth && this.props.authenticated) {
      this.fetchEvents();
    }
    this.socket.emit('JOIN_EVENT', this.props.match.params.id);
  }

  componentWillUnmount() {
    this.socket.close();
  }

  componentDidUpdate(prevProps) {
    // if authentication complete (ie. no longer loading) && authenticated
    if (
      prevProps.loadingAuth &&
      !this.props.loadingAuth &&
      this.props.authenticated
    ) {
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

  backHandler() {
    this.props.history.push('/eventsList');
  }

  render() {
    const eventPage = (
      <div className="container-fluid px-4 py-3">
        <h3>{this.state.title}</h3>
        <hr/>
        <GoogleMap
          eventName={this.state.title}
          addressName={this.state.address}
          location={this.state.location}
        />
        <div className="form-group">
          <p>Event owner: {this.state.username}</p>
        </div>
        <div className="form-group">
          <p>Description: {this.state.description}</p>
        </div>
        <div className="form-group">
          Tags:
          <TagList tags={this.state.tags} />
        </div>
        <div className="form-group">
          <p>Event Address: {this.state.address}</p>
        </div>
        <div className="form-group">
          <p>Start date: {getFormattedDateStringNumeric(this.state.startDate)}</p>
        </div>
        <div className="form-group">
          <p>End date: {getFormattedDateStringNumeric(this.state.endDate)}</p>
        </div>

        {!this.state.public && this.state.invited.length > 0 && (
          //if the event is public, do not show invited list
          <div className="form-group">
            <p>Invited: </p>
            <ul>
              {this.state.invited.map(user => (
                <li key={user._id}>{user.username}</li>
              ))}
            </ul>
          </div>
        )}

        {this.state.attending.length > 0 && (
          <div className="form-group">
            <p>Attending: </p>
            <ul>
              {this.state.attending.map(user => (
                <li key={user._id}>{user.username}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="form-group">
          <div className={classes['button-ctrls']}>
            {this.state.endDate > new Date() && (
              <input
                type="submit"
                value="Edit"
                className="btn btn-primary"
                onClick={this.editHandler}
              />
            )}
            <input
              type="button"
              value="Back"
              className="btn btn-secondary"
              onClick={this.backHandler}
            />
          </div>
        </div>
        <ChatScreen roomId={this.state.roomId} key={this.state.roomId} />
      </div>
    );
    return (
      <div className="event_page">
        <NavBar />
        {!this.state.loading ? eventPage : null}
      </div>
    );
  }
}

export default withAuth(EventPage);
