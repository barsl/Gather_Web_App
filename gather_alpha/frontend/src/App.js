import React from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { Provider } from 'react-redux';
import store from './store';
import Navbar from "./components/navbar.component"
import EventsList from "./components/events-list.component";
import EditEvent from "./components/edit-event.component";
import CreateEvent from "./components/create-event.component";
import CreateUser from "./components/create-user.component";

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="container">
          <Navbar />
          <br />
          <Route path="/" exact component={EventsList} />
          <Route path="/edit/:id" component={EditEvent} />
          <Route path="/create" component={CreateEvent} />
          <Route path="/user" component={CreateUser} />
        </div>
      </Router>
    </Provider>
  );
}

export default App;
