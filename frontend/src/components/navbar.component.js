import React, {Component} from 'react';
import {Link, withRouter} from 'react-router-dom';
import axios from 'axios';
import {AuthContext} from './auth/context/AuthContext';
import {Navbar, Nav, NavDropdown} from 'react-bootstrap';

class Navigation extends Component {
  constructor(props) {
    super(props);
    this.logOut = this.logOut.bind(this);
  }
  static contextType = AuthContext;
  logOut(e) {
    e.preventDefault();
    axios
      .get('/logout', {withCredentials: true})
      .then(res => {
        console.log('Logged out successfully');
        this.props.history.replace('/');
        this.context.logout();
      })
      .catch(err => {
        console.error(err);
      });
  }

  render() {
    return (
      <>
        {this.context.user && (
          <Navbar bg="dark" variant="dark" expand="lg">
            <Link className="navbar-brand" to="/eventsList">Gather</Link>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse>
              <Nav>
                <Link className="nav-link" to="/eventsList">
                  Events
                </Link>
                <Link className="nav-link" to="/create">
                  Create Event
                </Link>
                <Link className="nav-link" to="/friends">
                  Friends
                </Link>
              </Nav>
              <Nav className="ml-auto">
                <NavDropdown alignRight title={this.context.user.username}>
                    <Link className="dropdown-item" to="/profile">
                      My Profile
                    </Link>
                    <a href="/" onClick={this.logOut} className="dropdown-item">
                      Logout
                    </a>
                </NavDropdown>
              </Nav>
            </Navbar.Collapse>
          </Navbar>
        )}
      </>
    );
  }
}

export default withRouter(Navigation);
