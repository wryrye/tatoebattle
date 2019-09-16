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

    this.state = {
      isReady: false
    }

    this.socketServer = process.env.REACT_APP_SOCKET;
    console.log(this.socketServer);

    this.data = {
      username: null,
      master: null,
      room: null,
      player: null
    }

    this.update = this.update.bind(this);

    if (document.cookie) {
      this.update(JSON.parse(document.cookie));
    }
  }

  update(data) {
    console.log("Updating data: " + JSON.stringify(data));
    Object.assign(this.data, data)
  }

  render() {
    console.log(this.data)
    return (
      <Router>
        <Switch>
          <Route path="/lobby" exact render={(props) => <Lobby {...props} update={this.update} />} />
          <Route path="/room/" render={(props) => <Room {...props} master={this.data.master} room={this.data.room} player={this.data.player} />} />
          <Redirect to="/lobby" />
        </Switch>
      </Router>
    );
  }
}

export default App;
