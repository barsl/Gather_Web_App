import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Login from "./components/login.component";
import Signup from "./components/signup.component";
import EventsList from "./components/events/events-list.component";
import EditEvent from "./components/events/edit-event.component";
import CreateEvent from "./components/events/create-event.component";
import CreateUser from "./components/create-user.component";
import Friends from "./components/friends.component";
import UserProfile from "./components/user/user-profile.component";
import OAuthCallback from "./components/auth/oauth/OAuthCallback";
import { AuthProvider } from "./components/auth/context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="container">
          <br />
          <Route exact path="/" component={Login} />
          <Route path="/signup" component={Signup} />
          <Route path="/eventsList" component={EventsList} />
          <Route path="/edit/:id" component={EditEvent} />
          <Route path="/create" component={CreateEvent} />
          <Route path="/user" component={CreateUser} />
          <Route path="/friends" component={Friends} />
          <Route path="/profile" component={UserProfile} />
          <Route path="/oauthcallback" component={OAuthCallback} />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
