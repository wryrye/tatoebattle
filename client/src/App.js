import React from "react";
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";
import socketClient from "socket.io-client";
import 'bootstrap/dist/js/bootstrap.min.js';
import 'bootstrap/dist/js/bootstrap.min.js.map';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/css/bootstrap.min.css.map';

import Lobby from './components/Lobby';
import Room from './components/Room';
import './App.css' 


class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isReady: false
    }

    this.socket = socketClient(process.env.REACT_APP_SOCKET);

    this.socket.on('connect', () => {
      console.log(this.socket.id);
      this.setState({
        isReady: true
      })
    });

    this.userInfo = {
      username: null,
      master: null,
      room: null,
      player: null
    }

    this.updateInfo = this.updateInfo.bind(this);

    // if (document.cookie) {
    //   console.log(document.cookie)
    //   this.updateInfo(JSON.parse(document.cookie));
    // }
  }

  updateInfo(data) {
    console.log("Updating info: " + JSON.stringify(data));
    Object.assign(this.userInfo, data)
  }

  render() {
    const { isReady } = this.state;

    if (!isReady) return null;

    return (
      <Router>
        <Switch>
          <Route path="/lobby/" render={(props) => <Lobby {...props} socket={this.socket} updateInfo={this.updateInfo} />} />
          <Route path="/room/" render={(props) => <Room {...props} socket={this.socket} {...this.userInfo} />} />
          <Redirect to="/lobby" />
        </Switch>
      </Router>
    );
  }
}

export default App;
