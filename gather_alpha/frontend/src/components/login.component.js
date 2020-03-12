import React, { Component } from 'react';
import axios from 'axios';
import { Link, Redirect, withRouter } from 'react-router-dom';

class Login extends Component {
    constructor(props) {
        super(props);

        this.onChange = this.onChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);

        this.state = {
            username: '',
            password: '',
            error: false,
            isAuthenticated: false
        }
    }

    componentDidMount() {
        axios.get('http://localhost:5000/verify', { withCredentials: true })
            .then(res => {
                if (res.data.isValid) this.setState({
                    isAuthenticated: true
                });
            })
            .catch(err => {
                console.error(err);
            })
    }

    onChange(e) {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    onSubmit(e) {
        e.preventDefault();

        const user = {
            username: this.state.username,
            password: this.state.password
        }

        axios.post('http://localhost:5000/signin', user, { withCredentials: true })
            .then(res => {
                console.log(res.data);
                this.props.history.replace('/events');
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
                        <label>Username: </label>
                        <input type="text"
                            name="username"
                            required
                            className="form-control"
                            value={this.state.username}
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