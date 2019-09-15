import React from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import 'bootstrap/dist/js/bootstrap.min.js';
import 'bootstrap/dist/js/bootstrap.min.js.map';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/css/bootstrap.min.css.map';

import Lobby from './components/Lobby';
import Room from './components/Room';


function App() {
  return (
    <Router>
      <Switch>
        <Route path="/lobby" exact component={Lobby} />
        <Route path="/room/" component={Room} />
        <Route path="/" component={Lobby} />
      </Switch>
    </Router>
  );
}

export default App;
