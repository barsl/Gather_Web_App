import React from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Route } from "react-router-dom";

import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppWithRouterAccess from './AppWithRouterAccess';

const App = () => {
  return (
    <Router>
      <AppWithRouterAccess />
    </Router>
  );
}

export default App;
function App() {
  return (
    <Router>
      <div className="container">
        <Navbar />
        <br />
        <Route path="/" component={Login} />
        <Route path="/events" exact component={EventsList} />
        <Route path="/edit/:id" component={EditEvent} />
        <Route path="/create" component={CreateEvent} />
        <Route path="/user" component={CreateUser} />
        <Route path="/implicit/callback" component={CreateUser} />
      </div>
    </Router>
  );
}
