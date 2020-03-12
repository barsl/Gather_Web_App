import React, { Component } from 'react';
import axios from 'axios';
import { withRouter } from 'react-router-dom';

class Signup extends Component {
    constructor(props) {
        super(props);

        this.onChange = this.onChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);

        this.state = {
            username: '',
            firstName: '',
            lastName: '',
            password: '',
            error: false
        }
    }

    componentDidMount() {
        axios.get('/verify', { withCredentials: true })
            .then(res => {
                if (res.data.isValid) this.props.history.push('/events');
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
            name: this.state.firstName + ' ' + this.state.lastName,
            password: this.state.password
        }

        axios.post('/signup', user, { withCredentials: true })
            .then(res => {
                this.props.history.push('/events');
            })
            .catch(err => {
                this.setState({
                    error: true
                });
                console.error(err);
            });
    }

    render() {
        const showError = this.state.error ? "d-inline-block" : "d-none";
        return (
            <div>
                <div className={`alert alert-danger ${showError}`} >Invalid Entries</div>
                <h3>Sign up</h3>
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
                        <label>First Name: </label>
                        <input type="text"
                            name="firstName"
                            required
                            className="form-control"
                            value={this.state.firstName}
                            onChange={this.onChange}
                        />
                        <label>Last Name: </label>
                        <input type="text"
                            name="lastName"
                            required
                            className="form-control"
                            value={this.state.lastName}
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
                        <input type="submit" value="Sign up" className="btn btn-primary" />
                    </div>
                </form>
            </div >
        )
    }
}

export default withRouter(Signup);