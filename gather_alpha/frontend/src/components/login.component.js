import React, { Component } from 'react';
import axios from 'axios';
import { Link, Redirect, withRouter } from 'react-router-dom';
import verifyAuth from '../helper/authHelper';

class Login extends Component {
    constructor(props) {
        super(props);

        this.onChange = this.onChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);

        this.state = {
            email: '',
            password: '',
            error: false
        }
    }

    componentDidMount() {
        verifyAuth.verifyAuth(function (isAuthenticated) {
            if (isAuthenticated) this.props.history.push('/events');
        });
    }

    onChange(e) {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    onSubmit(e) {
        e.preventDefault();

        const user = {
            email: this.state.email,
            password: this.state.password
        }

        axios.post('http://localhost:5000/signin', user, { withCredentials: true })
            .then(res => {
                console.log(res.data);
                this.props.history.push('/events');
            })
            .catch(err => {
                this.setState({
                    error: "Invalid Credentials"
                });
                console.error(err);
            });
    }

    render() {
        if (this.state.isAuthenticated) {
            return <Redirect to="/events" />
        }
        const showError = this.state.error ? "d-inline-block" : "d-none";
        return (
            <div>
                <div className={`alert alert-danger ${showError}`} >Invalid Credentials</div>
                <h3>Login</h3>
                <form onSubmit={this.onSubmit}>
                    <div className="form-group">
                        <label>Email: </label>
                        <input type="email"
                            name="email"
                            required
                            className="form-control"
                            value={this.state.email}
                            onChange={this.onChange}
                        />
                        <label>Password: </label>
                        <input type="password"
                            name="password"
                            required
                            className="form-control"
                            value={this.state.password}
                            onChange={this.onChange}
                        />
                    </div>
                    <div className="form-group">
                        <input type="submit" value="Login" className="btn btn-primary" />
                    </div>
                    <Link to={"/signup"}>New user? Sign up here!</Link>
                </form>
            </div >
        )
    }
}

export default withRouter(Login);