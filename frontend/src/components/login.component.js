import React, { Component } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import classes from "../components/style/login.module.css";
import image from "../components/assets/friendship.svg";
import withAuthRedirect from "./auth/hoc/withAuthRedirect";

class Login extends Component {
  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this.state = {
      username: "",
      password: "",
      error: false
    };
  }

  onChange(e) {
    this.setState({
      [e.target.name]: e.target.value
    });
  }

  onSubmit(e) {
    e.preventDefault();

    const user = {
      username: this.state.username,
      password: this.state.password
    };

    axios
      .post("/signin", user, { withCredentials: true })
      .then(res => {
        console.log(res.data);
        this.props.history.replace("/eventsList");
      })
      .catch(err => {
        this.setState({
          error: "Invalid Credentials"
        });
        console.error(err);
      });
  }

  render() {
    const showError = this.state.error ? "d-inline-block" : "d-none";
    return (
      <div className={classes.Centered}>
        <div className={classes.HorizontalFlex}>
          <div className={classes.LeftSide}>
            <h1 className={classes.Logo}>gather</h1>
            <img src={image} className={classes.Image} alt="Gather Logo - Large"></img>
          </div>
          <div className={classes.RightSide}>
            <h2>Making meetups easier.</h2>

            <form onSubmit={this.onSubmit}>
              <div className={classes.Form}>
                <label>Username: </label>
                <input
                  type="text"
                  name="username"
                  required
                  className="form-control"
                  value={this.state.username}
                  onChange={this.onChange}
                />
                <label>Password: </label>
                <input
                  type="password"
                  name="password"
                  required
                  className="form-control"
                  value={this.state.password}
                  onChange={this.onChange}
                />
              </div>

              <div className={[classes.ErrorMessage, showError].join(" ")}>
                Invalid Credentials
              </div>

              <div className={classes.HorizontalFlex}>
                <input
                  type="submit"
                  value="Login"
                  className="btn btn-primary"
                />
                <Link className={classes.Link} to={"/signup"}>
                  New user? Sign up here!
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default withAuthRedirect(Login, {
  path: "/eventsList",
  redirectIfAuth: true,
  mountWhileLoading: false
});
