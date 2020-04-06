import React, {Component} from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import NavBar from '../navbar.component';
import ChatScreen from '../chat.component';
import GoogleMap from '../map.component';
import '../style/map.css';
import classes from './style/edit-event.module.css';
import withAuth from '../auth/hoc/withAuth';
import io from 'socket.io-client';
import Search from '../core/Search/Search';
import TagList from '../core/Tag/TagList/TagList';
import {
  getAddressFromCoordinates,
  getCoordinatesFromAddress,
} from '../../util/MapUtil';

export default withAuth(
  class EditEvent extends Component {
    constructor(props) {
      super(props);
      this.socket = io('http://localhost:5000');
      // this.socket = io('https://gatherup.social');

      this.onChangeUsername = this.onChangeUsername.bind(this);
      this.onChangeDescription = this.onChangeDescription.bind(this);
      this.onChangeStartDate = this.onChangeStartDate.bind(this);
      this.onChangeEndDate = this.onChangeEndDate.bind(this);
      this.onSubmit = this.onSubmit.bind(this);
      this.onChangeTitle = this.onChangeTitle.bind(this);
      this.onAddressChange = this.onAddressChange.bind(this);
      this.onLocationChange = this.onLocationChange.bind(this);
      this.fetchEvents = this.fetchEvents.bind(this);
      this.cancelHandler = this.cancelHandler.bind(this);
      this.changeTagsHandler = this.changeTagsHandler.bind(this);
      this.selectTagHandler = this.selectTagHandler.bind(this);
      this.removeTagHandler = this.removeTagHandler.bind(this);

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

      this.socket.on('RECEIVE_TITLE', title => {
        this.setState({title});
      });

      this.socket.on('RECEIVE_TAGS', tags => {
        this.setState({tags});
      });

      this.socket.on('RECEIVE_DESCRIPTION', description => {
        this.setState({description});
      });

      this.socket.on('RECEIVE_ADDRESS', address => {
        this.setState({address});
      });

      this.socket.on('RECEIVE_START_DATE', startDate => {
        this.setState({startDate: new Date(startDate)});
      });
      this.socket.on('RECEIVE_END_DATE', endDate => {
        this.setState({endDate: new Date(endDate)});
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

    onChangeStartDate(startDate) {
      this.socket.emit('CHANGE_START_DATE', new Date(startDate));
      this.setState({startDate});
    }

    onChangeEndDate(endDate) {
      this.socket.emit('CHANGE_END_DATE', new Date(endDate));
      this.setState({endDate});
    }

    onChangeTitle(e) {
      this.socket.emit('CHANGE_TITLE', e.target.value);

      this.setState({
        title: e.target.value,
      });
    }

    changeTagsHandler({value, action}) {
      let newTagsList;
      switch (action) {
        case 'add':
          newTagsList = [...this.state.tags, value];
          break;
        case 'remove':
          newTagsList = this.state.tags.filter(tag => value !== tag);
          break;
        default:
          return;
      }
      this.socket.emit('CHANGE_TAGS', newTagsList);
      this.setState({tags: newTagsList});
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

    selectTagHandler(value) {
      this.changeTagsHandler({action: 'add', value});
    }

    removeTagHandler(value) {
      this.changeTagsHandler({action: 'remove', value});
    }

    cancelHandler() {
      const returnUrl = this.props.location.state
        ? this.props.location.state.returnUrl
        : null;
      returnUrl
        ? this.props.history.push(returnUrl)
        : this.props.history.push('/eventsList');
    }

    onSubmit(e) {
      e.preventDefault();
      getCoordinatesFromAddress(this.state.address)
        .then(location => {
          const event = {
            username: this.state.username,
            title: this.state.title,
            description: this.state.description,
            startDate: this.state.startDate,
            endDate: this.state.endDate,
            location: location,
            tags: this.state.tags,
          };
          return axios.put('/events/' + this.props.match.params.id, event);
        })
        .then(({data}) => {
          this.socket.emit('SAVE_EVENT', data);
          this.props.history.push('/eventsList');
        })
        .catch(err => console.error(err));
    }

    render() {
      const tagsSet = new Set(this.state.tags);
      const editPage = (
        <div className="container-fluid px-4 py-3">
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
              <label>Tags: </label>
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
              <label>Start date: </label>
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
              <label>End date: </label>
              <div>
                <DatePicker
                  selected={this.state.endDate}
                  onChange={this.onChangeEndDate}
                  showTimeSelect
                  dateFormat="MM/dd/yy h:mm aa"
                />
              </div>
            </div>

            {!this.state.public &&
            this.state.invited.length > 0 && ( //if the event is public, do not show invited list
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

            {this.state.attending.length > 0 && (
              <div className="form-group">
                <label>Attending: </label>
                <ul>
                  {this.state.attending.map(user => (
                    <li key={user._id}>{user.username}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="form-group">
              <div className={classes['button-ctrls']}>
                <input type="submit" value="Save" className="btn btn-primary" />
                <input
                  type="button"
                  value="Cancel"
                  className="btn btn-secondary"
                  onClick={this.cancelHandler}
                />
              </div>
            </div>
          </form>
        </div>
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
        </div>
      );
    }
  },
);
