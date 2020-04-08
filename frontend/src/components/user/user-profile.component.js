import React, {Component} from 'react';
import axios from 'axios';
import GoogleMap from '../map.component';
import Navbar from '../navbar.component';
import withUser from '../auth/hoc/withUser';
import classes from './user-profile.module.css';
import InterestTag from './InterestTag/InterestTag';
import {getCoordinatesFromAddress} from '../../util/MapUtil';

const extractName = fullName => {
  const [firstName, lastName] = fullName.split(' ');
  return {firstName, lastName};
};

class UserProfile extends Component {
  constructor(props) {
    super(props);
    const {firstName, lastName} = extractName(this.props.user.name);
    this.state = {
      googleConnected: false,
      firstName,
      lastName,
      address: this.props.user.address,
      location: this.props.user.location,
      interestsList: [],
      editingInfo: false,
    };

    // Bindings
    this.googleCalendarHandler = this.googleCalendarHandler.bind(this);
    this.getCalendarEvents = this.getCalendarEvents.bind(this);
    this.editContactInfoHandler = this.editContactInfoHandler.bind(this);
    this.cancelEditContactInfo = this.cancelEditContactInfo.bind(this);
    this.editContactInfoFieldHandler = this.editContactInfoFieldHandler.bind(
      this,
    );
    this.updateContactInfoHandler = this.updateContactInfoHandler.bind(this);
    this.selectInterestHandler = this.selectInterestHandler.bind(this);
    this.updateInterestsHandler = this.updateInterestsHandler.bind(this);
  }

  componentDidMount() {
    this.setState({
      googleConnected: this.props.user.gcAuthToken !== undefined,
    });
    axios
      .get('/consts/interests')
      .then(({data}) => this.setState({interestsList: data}))
      .catch(console.error);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.user.location !== this.props.user.location) {
      this.setState({
        location: this.props.user.location,
        address: this.props.user.address,
      });
    }
  }

  googleCalendarHandler() {
    axios
      .get('/authenticateGoogleUser')
      .then(res => {
        window.open(res.data);
        window.addEventListener(
          'message',
          e => {
            this.setState({googleConnected: e.data});
          },
          {once: true},
        );
      })
      .catch(console.error);
  }

  getCalendarEvents() {
    axios
      .get(`/users/${this.props.user.id}/gcevents`)
      .then(res => {
        res.data.events.forEach(event => console.log(event));
      })
      .catch(console.log);
  }

  editContactInfoHandler() {
    this.setState({editingInfo: true});
  }

  editContactInfoFieldHandler({target}) {
    const {name, value} = target;
    this.setState({[name]: value});
  }

  cancelEditContactInfo() {
    this.setState({
      ...extractName(this.props.user.name),
      address: this.props.user.address,
      location: this.props.user.location,
      editingInfo: false,
    });
  }

  selectInterestHandler({value, checked}) {
    const newInterests = checked
      ? [...this.props.user.interests, value]
      : this.props.user.interests.filter(i => i !== value);
    this.updateInterestsHandler(this.props.user.interests, newInterests);
  }

  updateInterestsHandler(prevInterests, nextInterests) {
    this.props.updateUser({interests: nextInterests});
    axios
      .put(`/users/${this.props.user.id}/interests`, {
        value: nextInterests,
      })
      .then(({data}) => {
        console.debug(data);
      })
      .catch(err => {
        console.error(err);
        this.props.updateUser({interests: prevInterests});
      });
  }

  updateContactInfoHandler(e) {
    e.preventDefault();
    this.setState({editingInfo: false});
    getCoordinatesFromAddress(this.state.address)
      .then(location => {
        return axios.patch(`/users/${this.props.user.id}`, {
          firstName: this.state.firstName,
          lastName: this.state.lastName,
          address: this.state.address,
          location: location,
        });
      })
      .then(({data}) => {
        const {name, location, address} = data;
        this.props.updateUser({name, location, address});
      })
      .catch(err => {
        console.error(err);
        const {firstName, lastName} = extractName(this.props.user.name);
        this.setState({
          firstName,
          lastName,
          location: this.props.user.location,
          address: this.props.user.address,
        });
      });
  }

  render() {
    const contactInfo = !this.state.editingInfo ? (
      <>
        <p>First Name: {this.state.firstName}</p>
        <p>Last Name: {this.state.lastName}</p>
        <p>Address: {this.state.address}</p>
        <input
          type="button"
          value="Edit"
          onClick={this.editContactInfoHandler}
        />
      </>
    ) : (
      <form onSubmit={this.updateContactInfoHandler}>
        <p>
          First Name:{' '}
          <input
            type="text"
            value={this.state.firstName}
            name="firstName"
            autoComplete="given-name"
            onChange={this.editContactInfoFieldHandler}
          />
        </p>
        <p>
          Last Name:{' '}
          <input
            type="text"
            value={this.state.lastName}
            name="lastName"
            autoComplete="family-name"
            onChange={this.editContactInfoFieldHandler}
          />
        </p>
        <GoogleMap
          onLocationChange={address => this.setState({address})}
          eventName="Address"
          addressName={this.state.address}
          location={this.state.location}
        />
        <p>
          Address:{' '}
          <input
            type="text"
            value={this.state.address}
            name="address"
            autoComplete="street-address"
            onChange={this.editContactInfoFieldHandler}
          />
        </p>
        <div className={classes['button-ctrls']}>
          <input
            className={classes['button-primary']}
            type="submit"
            value="Save"
          />
          <input
            type="button"
            value="Cancel"
            onClick={this.cancelEditContactInfo}
          />
        </div>
      </form>
    );
    const interestsSet = new Set(this.props.user.interests);
    return (
      <div>
        <Navbar />
        <h3> My Profile: {this.props.user.username} </h3>
        <hr />
        <h4>Contact Information</h4>
        {contactInfo}
        <hr />
        <h4>My Interests</h4>
        <div className={classes['interests-options']}>
          {this.state.interestsList.map(i => (
            <div key={i}>
              <InterestTag
                value={i}
                checked={interestsSet.has(i)}
                onSelect={this.selectInterestHandler}
              />
            </div>
          ))}
        </div>
        <hr />
        <h4>Service Integrations</h4>
        {!this.state.googleConnected && (
          <button
            onClick={this.googleCalendarHandler}
            className="btn btn-primary"
          >
            Connect Google Calendar
          </button>
        )}
        <p>
          Google Calendar:{' '}
          <label> {this.state.googleConnected ? '✔️' : '❌'}</label>{' '}
        </p>
        {/* {this.state.googleConnected && (
              <button
                onClick={this.getCalendarEvents}
                className="btn btn-primary"
              >
                Test
              </button>
            )} */}
      </div>
    );
  }
}

export default withUser(UserProfile);
