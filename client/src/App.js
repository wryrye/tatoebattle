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
      isReady: false,
      userInfo: this.cookies.get('userInfo')
    }

    console.log(process.env.REACT_APP_SOCKET);
    console.log(process.env.PORT);

    this.socket = socketClient(process.env.REACT_APP_SOCKET);

    this.socket.on('connect', () => {
      this.setState({
        isReady: true
      })
    });

    this.updateInfo = this.updateInfo.bind(this);
  }

  updateInfo(info) {
    // console.log("Updating info: " + JSON.stringify(info));
    const userInfo = {...this.state.userInfo, ...info}
    this.cookies.set('userInfo', userInfo, { path: '/' })
    this.setState({userInfo})
  }

  render() {
    const { isReady } = this.state;

    if (!isReady) return null;

    return (
      <Router>
        <Switch>
          <Route path="/lobby/" render={(props) => <Lobby {...props} socket={this.socket} userInfo={this.state.userInfo} updateInfo={this.updateInfo} />} />
          <Route path="/room/" render={(props) => <Room {...props} socket={this.socket} {...this.state.userInfo} />} />
          <Redirect to="/lobby" />
        </Switch>
      </Router>
    );
  }
}

export default App;
