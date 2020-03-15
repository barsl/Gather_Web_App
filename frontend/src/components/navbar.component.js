import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import axios from 'axios';

class Navbar extends Component {
  constructor(props) {
    super(props);
    this.logOut = this.logOut.bind(this);
  }

  logOut(e) {
    e.preventDefault();
    axios.get('/logout', { withCredentials: true })
      .then(res => {
        console.log("Logged out successfully");
        this.props.history.replace('/');
      })
      .catch(err => {
        console.error(err);
      });
  }

  render() {
    return (
      <nav className="navbar navbar-dark bg-dark navbar-expand-lg">
        <Link to="/eventsList" className="navbar-brand">Gather</Link>
        <div className="collpase navbar-collapse">
          <ul className="navbar-nav mr-auto">
            <li className="navbar-item">
              <Link to="/eventsList" className="nav-link">Events</Link>
            </li>
            <li className="navbar-item">
              <Link to="/create" className="nav-link">Create Event Log</Link>
            </li>
            <li className="navbar-item">
              <Link to="/user" className="nav-link">Create User</Link>
            </li>
            <li className="navbar-item">
              <Link to="/friends" className="nav-link">Friends</Link>
            </li>            
            <li>
              <a href="/" onClick={this.logOut} className="nav-link">Logout</a>
            </li>
          </ul>
        </div>
      </nav>
    );
  }
}

export default withRouter(Navbar);