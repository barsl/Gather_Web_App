import React, {Component} from 'react';
import axios from 'axios';
import Search from './core/Search/Search';

class AddFriends extends Component {
  constructor(props) {
    super(props);

    this.onChangeUser = this.onChangeUser.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this.state = {
      users: [],
      user: '',
      message: {
        type: null,
        value: null,
      },
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

  componentWillUnmount() {
    if (this.feedbackTimer) clearTimeout(this.feedbackTimer);
  }

  onChangeUser(user) {
    this.setState({user});
  }

  onSubmit(e) {
    e.preventDefault();
    const friend = this.state.users.find(u => u.username === this.state.user);
    if (!friend) {
      this.setState({
        message: {
          type: 'error',
          value: `No user with the username "${this.state.user}" was found.`,
        },
      });
    }

    if (friend) {
      // add current user id to friend_requests[] of target
      axios
        .patch(
          `/users/${friend._id}/friend_requests/`,
          {op: 'add', value: this.props.user.id},
          {withCredentials: true},
        )
        .then(() => {
          this.setState({
            message: {type: 'success', value: 'Friend request sent.'},
          });
          this.feedbackTimer = setTimeout(() => {
            this.setState({message: {type: null, value: null}});
          }, 2000);
        })
        .catch(err => {
          this.setState({message: {type: 'error', value: err.message}});
        });
    }
  }

  render() {
    return (
      <div>
        <h3 className="font-weight-bold">Search for Friends</h3>
        <form onSubmit={this.onSubmit}>
          <div className="form-group">
            <Search
              data={this.state.users.map(u => u.username)}
              onChange={this.onChangeUser}
              emptyMessage="No users found."
              fillOnSelect
            />
          </div>

          <div className="form-group">
            <input
              type="submit"
              value="Send request"
              className='btn btn-primary'
            />
            <p
              className={[
                this.state.message.type === 'error'
                  ? 'text-danger'
                  : 'text-success',
                'd-inline-block px-4',
              ].join(' ')}
            >
              {this.state.message.value}
            </p>
          </div>
        </form>
      </div>
    );
  }
}

export default AddFriends;
