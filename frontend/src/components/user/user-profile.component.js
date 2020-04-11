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
        const x = window.top.outerWidth / 2 + window.top.screenX - 400 / 2;
        const y = window.top.outerHeight / 2 + window.top.screenY - 440 / 2;
        window.open(
          res.data,
          '_blank',
          `menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes,width=400,height=440,left=${x},top=${y}`,
        );
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
          className={["btn", "btn-primary", classes['btn-primary']].join(' ')}
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
        <p className={classes['Address']}>
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
          <input className={["btn", "btn-primary", classes['btn-primary']].join(' ')} type="submit" value="Save" />
          <input
            className={["btn", "btn-secondary", classes['btn-secondary']].join(' ')}
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
        <div className="container-fluid px-4 py-3">
          <h3> {this.props.user.username} </h3>
          <hr />
          <h4>Contact Information</h4>
          {contactInfo}
          <hr />
          <h4>My Interests</h4>
          <p> Your interests help Gather recommend public events to you. </p>
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
          <p>Connect Google Calendar for improved event recommendations.</p>
          <p>
            Google Calendar:{' '}
            {this.state.googleConnected ? (
              <span className={classes['connected-badge']}>
                <span className="badge badge-success">Connected</span>
              </span>
            ) : (
              <button
                onClick={this.googleCalendarHandler}
                className="btn btn-primary"
              >
                Connect
              </button>
            )}{' '}
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
      </div>
    );
  }
}

export default withUser(UserProfile);
