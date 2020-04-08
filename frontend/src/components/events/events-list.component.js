import React, {Component} from 'react';
import axios from 'axios';
import Navbar from '../navbar.component';
import Chatkit from '@pusher/chatkit-client';
import withUser from '../auth/hoc/withUser';
import Event from './event/Event';

class EventsList extends Component {
  constructor(props) {
    super(props);

    this.deleteEvent = this.deleteEvent.bind(this);
    this.setAttending = this.setAttending.bind(this);
    this.source = axios.CancelToken.source();
    this.state = {
      publicEvents: [],
    };
  }

  componentDidMount() {
    axios
      .get('/events/public')
      .then(response => {
        this.setState({publicEvents: response.data});
      })
      .catch(error => {
        console.log(error);
      });

    this.interval = setInterval(() => {
      axios
        .get('/users/currentUser')
        .then(response => {
          this.props.updateUser({invitedEvents: response.data.invitedEvents});
        })
        .catch(error => {
          console.log(error);
        });

      axios
        .get('/events/public', {cancelToken: this.source.token})
        .then(response => {
          this.setState({publicEvents: response.data});
        })
        .catch(error => {
          if (!axios.isCancel(error)) {
            console.log(error);
          }
        });
    }, 5000);
  }

  componentWillUnmount() {
    this.source.cancel();
    clearInterval(this.interval);
  }

  deleteEvent(event) {
    const chatManager = new Chatkit.ChatManager({
      instanceLocator: 'v1:us1:1956d6a4-c213-42ad-b3a5-ac091e1b514a',
      userId: this.props.user.username,
      tokenProvider: new Chatkit.TokenProvider({
        url: '/chat/auth',
      }),
    });
    const deleteChatManager = chatManager.connect().then(currentUser => {
      return currentUser.deleteRoom({roomId: event.roomId});
    });
    const deleteEvent = axios.delete('/events/' + event._id);
    Promise.allSettled([deleteEvent, deleteChatManager])
      .then(([{status}]) => {
        if (status === 'fulfilled') {
          this.props.updateUser({
            createdEvents: this.props.user.createdEvents.filter(
              el => el._id.toString() !== event._id.toString(),
            ),
          });
          if (event.public) {
            this.setState({
              publicEvents: this.state.publicEvents.filter(
                el => el._id.toString() !== event._id.toString(),
              ),
            });
          }
        }
      })
      .catch(console.error);
  }

  setAttending(event, isAttending) {
    axios
      .patch(`/users/${this.props.user.id}/attendingEvents`, {
        value: event._id,
        op: isAttending ? 'add' : 'remove',
      })
      .then(res => {
        const {attendingEvents, invitedEvents} = res.data;
        this.props.updateUser({attendingEvents, invitedEvents});
      })
      .catch(console.log);
  }

  createdEventList() {
    return this.props.user.createdEvents.map(currentevent => {
      return (
        <Event
          event={currentevent}
          deleteEvent={this.deleteEvent}
          key={currentevent._id}
          eventType="created"
        />
      );
    });
  }

  attendingEventList() {
    return this.props.user.attendingEvents.map(currentevent => {
      return (
        <Event
          event={currentevent}
          key={currentevent._id}
          setAttending={event => this.setAttending(event, false)}
          eventType="attending"
        />
      );
    });
  }

  invitedEventList() {
    return this.props.user.invitedEvents.map(currentevent => {
      return (
        <Event
          event={currentevent}
          key={currentevent._id}
          setAttending={event => this.setAttending(event, true)}
          eventType="invited"
        />
      );
    });
  }

  publicEventList() {
    return this.state.publicEvents.map(currentevent => {
      return (
        <Event
          event={currentevent}
          key={currentevent._id}
          setAttending={event => this.setAttending(event, true)}
          eventType="public"
        />
      );
    });
  }

  render() {
    return (
      <div>
        <Navbar />
        <h3> My Events </h3>
        {this.props.user.createdEvents.length > 0 && (
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
        {this.props.user.attendingEvents.length > 0 && (
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
        {this.props.user.invitedEvents.length > 0 && (
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

export default withUser(EventsList);
