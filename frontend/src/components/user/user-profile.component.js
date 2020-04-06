import React, {Component} from 'react';
import axios from 'axios';
import Navbar from '../navbar.component';
import withUser from '../auth/hoc/withUser';
import classes from './user-profile.module.css';
import InterestTag from './InterestTag/InterestTag';

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
      interests: this.props.user.interests,
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
    this.cancelEditInterests = this.cancelEditInterests.bind(this);
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
    if (prevProps.user.interests !== this.props.user.interests) {
      this.setState({interests: this.props.user.interests});
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
    this.setState({...extractName(this.props.user.name), editingInfo: false});
  }

  cancelEditInterests() {
    this.setState({interests: this.props.user.interests});
  }

  selectInterestHandler({value, checked}) {
    this.setState(prevState => {
      return checked
        ? {interests: [...prevState.interests, value]}
        : {interests: prevState.interests.filter(i => i !== value)};
    });
  }

  updateInterestsHandler(e) {
    e.preventDefault();
    const userInterestsCache = this.props.user.interests;
    const interestsArray = [...this.state.interests];
    this.props.updateUser({interests: interestsArray});
    axios
      .put(`/users/${this.props.user.id}/interests`, {
        value: [...this.state.interests],
      })
      .then(({data}) => {
        console.log(data);
      })
      .catch(err => {
        console.error(err);
        this.props.updateUser({interests: userInterestsCache});
      });
  }

  updateContactInfoHandler(e) {
    e.preventDefault();
    this.setState({editingInfo: false});
    axios
      .patch(`/users/${this.props.user.id}`, {
        firstName: this.state.firstName,
        lastName: this.state.lastName,
      })
      .then(({data}) => {
        console.log(data);
        this.props.updateUser(data);
      })
      .catch(err => {
        console.error(err);
        const {firstName, lastName} = extractName(this.props.user.name);
        this.setState({firstName, lastName});
      });
  }

  render() {
    const contactInfo = !this.state.editingInfo ? (
      <>
        <p>First Name: {this.state.firstName}</p>
        <p>Last Name: {this.state.lastName}</p>
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
    const interestsSet = new Set(this.state.interests);
    const interestsModified =
      this.props.user.interests.length !== this.state.interests.length ||
      !this.props.user.interests.every(i => interestsSet.has(i));
    return (
      <div>
        <Navbar />
        <h3> My Profile: {this.props.user.username} </h3>
        <hr />
        <h4>Contact Information</h4>
        {contactInfo}
        <hr />
        <h4>My Interests</h4>
        <form onSubmit={this.updateInterestsHandler}>
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
          <div className={classes['button-ctrls']}>
            <input
              className={classes['button-primary']}
              type="submit"
              value="Save"
              disabled={!interestsModified}
            />
            <input
              type="button"
              value="Cancel"
              onClick={this.cancelEditInterests}
              disabled={!interestsModified}
            />
          </div>
        </form>
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
          Google Calendar Connected:{' '}
          <label> {this.state.googleConnected ? 'Yes' : 'No'}</label>{' '}
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
