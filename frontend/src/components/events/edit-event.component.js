import React, {Component} from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import NavBar from '../navbar.component';
import ChatScreen from '../chat.component';
import GoogleMap from '../map.component';
import Geocode from 'react-geocode';
import '../style/map.css';
import classes from './style/edit-event.module.css';
import withAuth from '../auth/hoc/withAuth';
import io from 'socket.io-client';
import Form from "../Form";
import AllImages from "../AllImages";

export default withAuth(
  class EditEvent extends Component {
    constructor(props) {
      super(props);
      Geocode.setApiKey('AIzaSyDjmOBK0u2QrCMhLTln-Z_yHWs9MzuzsSk');
      this.socket = io('http://localhost:5000');
      // this.socket = io('https://gatherup.social');

      this.onChangeUsername = this.onChangeUsername.bind(this);
      this.onChangeDescription = this.onChangeDescription.bind(this);
      this.onChangeDate = this.onChangeDate.bind(this);
      this.onSubmit = this.onSubmit.bind(this);
      this.onChangeTitle = this.onChangeTitle.bind(this);
      this.onAddressChange = this.onAddressChange.bind(this);
      this.onLocationChange = this.onLocationChange.bind(this);
      this.fetchEvents = this.fetchEvents.bind(this);
      this.cancelHandler = this.cancelHandler.bind(this);

      this.state = {
        loading: true,
        public: false,
        roomId: null,
        username: '',
        title: '',
        description: '',
        address: '',
        date: new Date(),
        invited: [],
        attending: [],
        location: [],
      };

      this.socket.on('RECEIVE_TITLE', title => {
        this.setState({title});
      });

      this.socket.on('RECEIVE_DESCRIPTION', description => {
        this.setState({description});
      });

      this.socket.on('RECEIVE_ADDRESS', address => {
        this.setState({address});
      });

      this.socket.on('RECEIVE_DATE', date => {
        this.setState({date: new Date(date)});
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
      axios
        .get('/events/' + this.props.match.params.id)
        .then(({data}) => {
          const [lat, lng] = data.location;
          return Promise.all([Geocode.fromLatLng(lat, lng), data]);
        })
        .then(([{results}, data]) => {
          this.setState({
            public: data.public,
            location: data.location,
            address: results[0].formatted_address,
            username: data.username,
            title: data.title,
            description: data.description,
            date: new Date(data.date),
            invited: data.invited,
            attending: data.attending,
            roomId: data.roomId,
            loading: false,
          });
        })
        .catch(function (error) {
          console.log(error);
        });
    }

    onChangeUsername(e) {
      this.setState({
        username: e.target.value,
      });
    }

    onChangeDescription(e) {
      this.socket.emit('CHANGE_DESCRIPTION', e.target.value);

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
      this.socket.emit('CHANGE_DATE', new Date(date));

      this.setState({
        date: date,
      });
    }

    onChangeTitle(e) {
      this.socket.emit('CHANGE_TITLE', e.target.value);

      this.setState({
        title: e.target.value,
      });
    }

    onLocationChange(address) {
      this.socket.emit('CHANGE_ADDRESS', address);

      this.setState({
        address,
      });
    }

    onAddressChange(e) {
      this.socket.emit('CHANGE_ADDRESS', e.target.value);

      this.setState({
        address: e.target.value,
      });
    }

    cancelHandler() {
      this.props.history.push('/eventsList');
    }

    onSubmit(e) {
      e.preventDefault();
      Geocode.fromAddress(this.state.address)
        .then(res => {
          const {lat, lng} = res.results[0].geometry.location;
          const event = {
            username: this.state.username,
            title: this.state.title,
            description: this.state.description,
            date: this.state.date,
            location: [lat, lng],
          };

          return axios.put('/events/' + this.props.match.params.id, event);
        })
        .then(res => {
          console.log(res.data);
          this.props.history.push('/eventsList');
        })
        .catch(err => console.error(err));
    }

    render() {
      const editPage = (
        <>
          <h3>Edit Event</h3>

          <GoogleMap
            onLocationChange={this.onLocationChange}
            eventName={this.state.title}
            addressName={this.state.address}
            location={this.state.location}
          />
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
              <input
                type="text"
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
                  showTimeSelect
                  dateFormat="MM/dd/yy h:mm aa"
                />
              </div>
            </div>

            {!this.state.public && ( //if the event is public, do not show invited list
              <>
                <div className="form-group">
                  <label>Invited: </label>
                  <ul>
                    {this.state.invited.map(user => (
                      <li key={user._id}>{user.username}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            <div className="form-group">
              <label>Attending: </label>
              <ul>
                {this.state.attending.map(user => (
                  <li key={user._id}>{user.username}</li>
                ))}
              </ul>
            </div>

            <div className="form-group">
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
          </form>
        </>
      );
      const chatScreen = (
        <div className="chat_screen">
          <ChatScreen roomId={this.state.roomId} key={this.state.roomId} />
        </div>
      );
      return (
        <div className="edit_page">
          <div className="main_edit_screen">
            <NavBar />
            {!this.state.loading ? editPage : null}
          </div>
          {!this.state.loading && chatScreen}
          <Form event_id={this.props.match.params.id}/>
         {/* <AllImages event_id={this.props.match.params.id}/> */}
        </div>
        
      );
    }
  },
);
