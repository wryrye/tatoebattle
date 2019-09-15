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

    this.socketServer = "http://127.0.0.1:3045"

    this.data = {
      username: undefined,
      avatar: undefined,
      room: undefined,
      player: undefined
    }

    this.update = this.update.bind(this);
  }

  update(data){
    console.log("Updating data: " + JSON.stringify(data));
    Object.assign(this.data, data)
  }

  render() {
    return (
      <Router>
        <Switch>
          <Route path="/lobby" exact render={(props) => <Lobby {...props} update={this.update} /> } />
          <Route path="/room/" render={(props) => <Room {...props} avatar={this.data.avatar} room={this.data.room} player={this.data.player} /> } />
          <Redirect to="/lobby" />
        </Switch>
      </Router>
    );
  }
}

export default App;
