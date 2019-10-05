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

import Cookies from 'universal-cookie';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.cookies = new Cookies();

    this.state = {
      isReady: false
    }

    this.socket = socketClient(process.env.REACT_APP_SOCKET);

    this.socket.on('connect', () => {
      this.setState({
        isReady: true
      })
    });

    this.userInfo = this.cookies.get('userInfo');

    this.updateInfo = this.updateInfo.bind(this);
  }

  updateInfo(info) {
    console.log("Updating info: " + info);
    this.userInfo = {...this.userInfo, ...info}
    this.cookies.set('userInfo', this.userInfo, { path: '/' })
  }

  render() {
    const { isReady } = this.state;

    if (!isReady) return null;

    return (
      <Router>
        <Switch>
          <Route path="/lobby/" render={(props) => <Lobby {...props} socket={this.socket} userInfo={this.userInfo} updateInfo={this.updateInfo} />} />
          <Route path="/room/" render={(props) => <Room {...props} socket={this.socket} {...this.userInfo} />} />
          <Redirect to="/lobby" />
        </Switch>
      </Router>
    );
  }
}

export default App;
