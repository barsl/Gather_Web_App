import React, {Component} from 'react';
import axios from 'axios';
import Navbar from '../navbar.component';
import Chatkit from '@pusher/chatkit-client';
import withUser from '../auth/hoc/withUser';
import Event from './event/Event';
import EventsPanel from './events-panel.component';

const pastDatesFilter = event => {
  return new Date(event.endDate) < new Date();
};

const futureDatesFilter = event => {
  return new Date(event.endDate) >= new Date();
};

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
      .get('/events/public?recommend=true')
      .then(response => {
        console.debug(response.data);
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
        .get('/events/public?recommend=true', {cancelToken: this.source.token})
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
    return this.props.user.createdEvents
      .filter(futureDatesFilter)
      .map(currentevent => {
        return (
          <Event
            event={currentevent}
            deleteEvent={this.deleteEvent}
            key={currentevent._id}
          />
        );
      });
  }

  attendingEventList() {
    return this.props.user.attendingEvents
      .filter(futureDatesFilter)
      .map(currentevent => {
        return (
          <Event
            event={currentevent}
            key={currentevent._id}
            setAttending={event => this.setAttending(event, false)}
            deleteEvent={this.deleteEvent}
            eventType="attending"
          />
        );
      });
  }

  invitedEventList() {
    return this.props.user.invitedEvents
      .filter(futureDatesFilter)
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
      .map(currentevent => {
        return (
          <Event
            event={currentevent}
            key={currentevent._id}
            setAttending={event => this.setAttending(event, true)}
            deleteEvent={this.deleteEvent}
            eventType="invited"
          />
        );
      });
  }

  publicEventList() {
    return this.state.publicEvents
      .filter(futureDatesFilter)
      .sort((a, b) => b.recommendScore - a.recommendScore)
      .map(currentevent => {
        return (
          <Event
            event={currentevent}
            key={currentevent._id}
            setAttending={event => this.setAttending(event, true)}
            deleteEvent={this.deleteEvent}
            eventType="public"
          />
        );
      });
  }

  pastEventList() {
    const pastEvents = [
      ...this.props.user.createdEvents.filter(pastDatesFilter),
      ...this.props.user.attendingEvents.filter(pastDatesFilter),
      ...this.state.publicEvents.filter(pastDatesFilter),
    ];
    return pastEvents.map(currentevent => {
      return (
        <Event
          event={currentevent}
          key={currentevent._id}
          deleteEvent={this.deleteEvent}
          eventType="archive"
        />
      );
    });
  }

  render() {
    const createdEventList = this.createdEventList();
    const invitedEventList = this.invitedEventList();
    const attendingEventList = this.attendingEventList();
    const publicEventList = this.publicEventList();
    const pastEventList = this.pastEventList();
    return (
      <div>
        <Navbar />
        <div className="container-fluid px-4 py-3">
          <h3> My Events </h3>
          {(createdEventList.length > 0 ||
            attendingEventList.length > 0 ||
            invitedEventList.length > 0) && <hr />}
          {createdEventList.length > 0 && (
            <>
              <h4>Created Events</h4>
              <EventsPanel eventList={createdEventList}/>
            </>
          )}
          {attendingEventList.length > 0 && (
            <>
              <h4>Attending Events</h4>
              <EventsPanel eventList={attendingEventList}/>
            </>
          )}
          {invitedEventList.length > 0 && (
            <>
              <h4>Invited Events</h4>
              <EventsPanel eventList={invitedEventList}/>
            </>
          )}
          <hr />
          <h3> Public Events </h3>
          {publicEventList.length > 0 ? (
            <EventsPanel eventList={publicEventList}/>
          ) : (
            <p className="text-muted">No public events available.</p>
          )}
          {pastEventList.length > 0 && (
            <>
              <hr />
              <h3> Past Events </h3>
              <EventsPanel eventList={pastEventList}/>
            </>
          )}
        </div>
      </div>
    );
  }
}

export default withUser(EventsList);
