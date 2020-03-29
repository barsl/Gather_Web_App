import React, { Component } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import NavBar from "../navbar.component";
import ChatScreen from "../chat.component";
import GoogleMap from "../map.component";
import Geocode from "react-geocode";
import "../style/map.css";
import "./style/edit-event.css";
import withAuth from "../auth/hoc/withAuth";

const MemoGoogleMap = React.memo(GoogleMap);

export default withAuth(
  class EditEvent extends Component {
    constructor(props) {
      super(props);
      Geocode.setApiKey("AIzaSyDjmOBK0u2QrCMhLTln-Z_yHWs9MzuzsSk");

      this.onChangeUsername = this.onChangeUsername.bind(this);
      this.onChangeDescription = this.onChangeDescription.bind(this);
      this.onChangeDate = this.onChangeDate.bind(this);
      this.onSubmit = this.onSubmit.bind(this);
      this.onChangeTitle = this.onChangeTitle.bind(this);
      this.onAddressChange = this.onAddressChange.bind(this);
      this.onLocationChange = this.onLocationChange.bind(this);

      this.state = {
        loading: true,
        public: false,
        roomId: null,
        username: "",
        title: "",
        description: "",
        address: "",
        date: new Date(),
        invited: [],
        attending: []
      };
    }

    componentDidUpdate(prevProps) {
      // if authentication complete (ie. no longer loading) && authenticated
      if (
        prevProps.loadingAuth &&
        !this.props.loadingAuth &&
        this.props.authenticated
      ) {
        axios
          .get("/events/" + this.props.match.params.id)
          .then(({ data }) => {
            this.setState({
              public: data.public,
              address: data.location,
              username: data.username,
              title: data.title,
              description: data.description,
              date: new Date(data.date),
              invited: data.invited,
              attending: data.attending,
              roomId: data.roomId,
              loading: false
            });
          })
          .catch(function(error) {
            console.log(error);
          });
      }
    }

    componentWillUnmount() {}

    onChangeUsername(e) {
      this.setState({
        username: e.target.value
      });
    }

    onChangeDescription(e) {
      this.setState({
        description: e.target.value
      });
    }

    onChangeDuration(e) {
      this.setState({
        duration: e.target.value
      });
    }

    onChangeDate(date) {
      this.setState({
        date: date
      });
    }

    onChangeTitle(e) {
      this.setState({
        title: e.target.value
      });
    }

    onLocationChange(address) {
      this.setState({
        address
      });
    }

    onAddressChange(e) {
      this.setState({
        address: e.target.value
      });
    }

    onSubmit(e) {
      e.preventDefault();
      Geocode.fromAddress(this.state.address)
        .then(res => {
          const { lat, lng } = res.results[0].geometry.location;
          const event = {
            username: this.state.username,
            title: this.state.title,
            description: this.state.description,
            date: this.state.date,
            location: [lat, lng]
          };

          axios
            .put("/events/" + this.props.match.params.id, event)
            .then(res => console.log(res.data));

          window.location = "/";
        })
        .catch(err => console.error(err));
    }

    render() {
      let editPage = null;
      let chatScreen = null;

      if (!this.state.loading) {
        editPage = (
          <>
            <h3>Edit Event</h3>

            <MemoGoogleMap
              onLocationChange={this.onLocationChange}
              eventName={this.state.title}
              address={this.state.address}
            />
            <form onSubmit={this.onSubmit}>
              <div className="form-group">
                <label>Event title: </label>
                <input
                  type="text"
                  className="form-control"
                  value={this.state.title}
                  onChange={this.onChangeTitle}
                />
              </div>
              <div className="form-group">
                <label>Event owner: {this.state.username}</label>
              </div>
              <div className="form-group">
                <label>Description: </label>
                <input
                  type="text"
                  className="form-control"
                  value={this.state.description}
                  onChange={this.onChangeDescription}
                />
              </div>
              <div className="form-group">
                <label>Event Address: </label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={this.state.address}
                  onChange={this.onAddressChange}
                />
              </div>
              <div className="form-group">
                <label>Date: </label>
                <div>
                  <DatePicker
                    selected={this.state.date}
                    onChange={this.onChangeDate}
                  />
                </div>
              </div>

              {!this.state.public && ( //if the event is public, do not show invited list
                <>
                  <div className="form-group">
                    <label>Invited: </label>
                    <ul>
                      {this.state.invited.map(user => (
                        <li key={user._id}>{user.username}</li>
                      ))}
                    </ul>
                  </div>
                </>
              )}

              <div className="form-group">
                <label>Attending: </label>
                <ul>
                  {this.state.attending.map(user => (
                    <li key={user._id}>{user.username}</li>
                  ))}
                </ul>
              </div>

              <div className="form-group">
                <input
                  type="submit"
                  value="Save changes"
                  className="btn btn-primary"
                />
              </div>
            </form>
          </>
        );
        chatScreen = (
          <div className="chat_screen">
            <ChatScreen roomId={this.state.roomId} key={this.state.roomId} />
          </div>
        );
      } else {
        // Can set edit page = Spinner
      }
      return (
        <div className="edit_page">
          <div className="main_edit_screen">
            <NavBar />
            {editPage}
          </div>
          {chatScreen}
        </div>
      );
    }
  }
);
