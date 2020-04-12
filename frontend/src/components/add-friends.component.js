import React, {Component} from 'react';
import axios from 'axios';
import 'react-datepicker/dist/react-datepicker.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Search from './core/Search/Search';

class AddFriends extends Component {
  constructor(props) {
    super(props);

    this.onChangeUser = this.onChangeUser.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this.state = {
      users: [],
      user: null,
      error: null,
    };
  }

  componentDidMount() {
    axios
      .get('/users/', {withCredentials: true})
      .then(({data}) => {
        this.setState({
          users: data.filter(u => u.username !== this.props.user.username),
        });
      })
      .catch(error => {
        console.log('Unable to get users list. ' + error);
      });
  }

  onChangeUser(user) {
    this.setState({user});
  }

  onSubmit(e) {
    e.preventDefault();
    const friend = this.state.users.find(u => u.username === this.state.user);
    this.setState({
      error: !friend
        ? `No user with the username "${this.state.user}" was found.`
        : null,
    });
    if (friend) {
      // add current user id to friend_requests[] of target
      axios
        .patch(
          `/users/${friend._id}/friend_requests/`,
          {op: 'add', value: this.props.user.id},
          {withCredentials: true},
        )
        .then(res => console.log(res.data))
        .catch(console.error);
    }
  }

  render() {
    return (
      <div>
        <h3>Add friend</h3>
        <form onSubmit={this.onSubmit}>
          <div className="form-group">
            <Search
              data={this.state.users.map(u => u.username)}
              onChange={this.onChangeUser}
              emptyMessage="No users found."
              fillOnSelect
            />
            <p className="text-danger">{this.state.error}</p>
          </div>

          <div className="form-group">
            <input type="submit" value="Submit" className="btn btn-primary" />
          </div>
        </form>
      </div>
    );
  }
}

export default AddFriends;
