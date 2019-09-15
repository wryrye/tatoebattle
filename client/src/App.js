import React from "react";
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";
import 'bootstrap/dist/js/bootstrap.min.js';
import 'bootstrap/dist/js/bootstrap.min.js.map';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/css/bootstrap.min.css.map';

import Lobby from './components/Lobby';
import Room from './components/Room';


class App extends React.Component {
  constructor(props) {
    super(props);

    this.username = "test";
    this.avatar = "jackie";
    document.cookie = JSON.stringify({
      uname: this.username,
      master: this.avatar,
    });

    this.state = {
      socketServer: "http://127.0.0.1:3045"
    };
  }

  render() {
    return (
      <Router>
        <Switch>
          <Route path="/lobby" exact component={Lobby} />
          <Route path="/room/" component={Room} />
          <Redirect to="/lobby" />
        </Switch>
      </Router>
    );
  }
}

export default App;
