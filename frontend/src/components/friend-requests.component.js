import React, { Component } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

export default class EditEvent extends Component {
  constructor(props) {
    super(props);

    this.onChangeUsername = this.onChangeUsername.bind(this);


    this.onAccept = this.onAccept.bind(this)
    this.onDelete = this.onDelete.bind(this)

    this.state = {
      requests: [],
      friends:[], 
      users: [],
      target_reqs: [],
      target_friends: []

    }

  }

// set the list of freinds in the state
componentDidMount() {
    axios.get('/verify', { withCredentials: true })
    .then(res => {
      if (!res.data.isValid) {
        this.setState({
          isAuthenticated: false
        });
      }
    })
    .catch(err => {
      console.error(err);
    })
  axios.get('http://localhost:5000/users/currentUser/requests')
  .then(response => {
    this.setState({ requests: response.data })
  })
  .catch((error) => {
    console.log(error);
  })
    
    axios.get('http://localhost:5000/users/currentUser/friends')
      .then(response => {
        this.setState({ friends: response.data })
      })
      .catch((error) => {
        console.log(error);
      })
}

  onChangeUsername(e) {
    this.setState({
      username: e.target.value
    })
  }

  onChangeDescription(e) {
    this.setState({
      description: e.target.value
    })
  }

  onChangeDuration(e) {
    this.setState({
      duration: e.target.value
    })
  }

  onChangeDate(date) {
    this.setState({
      date: date
    })
  }

  onAccept(e) {
    e.preventDefault();

    const event = {
      username: this.state.username,
      description: this.state.description,
      date: this.state.date
    }

    console.log(event);

    axios.post('http://localhost:5000/events/update/' + this.props.match.params.id, event)
      .then(res => console.log(res.data));
  }

  onDelete(e) {
    e.preventDefault();

    const event = {
      username: this.state.username,
      description: this.state.description,
      date: this.state.date
    }

    console.log(event);

    axios.post('http://localhost:5000/events/update/' + this.props.match.params.id, event)
      .then(res => console.log(res.data));
  }






  render() {
    return (
    <div>
      <h3>Friend Requests</h3>
        <div> 
          <label>Username: </label>
          <select ref="userInput"
              required
              className="form-control"
              value={this.state.username}
              onChange={this.onChangeUsername}>
              {
                this.state.requests.map(function(req) {
                  return <option 
                    key={req}
                    value={req}>{req}
                    </option>;
                })
              }
          </select>
        </div>
        

        <div>
          {/* buttons */}
        </div>
    </div>
    )
  }
}


