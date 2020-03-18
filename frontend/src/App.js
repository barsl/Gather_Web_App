import React from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Login from "./components/login.component";
import Signup from "./components/signup.component";
import EventsList from "./components/events-list.component";
import EditEvent from "./components/edit-event.component";
import CreateEvent from "./components/create-event.component";
import CreateUser from "./components/create-user.component";
import Friends from "./components/friends.component";

function App() {
  return (
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
      </div>
    </Router>
  );
}

export default App;