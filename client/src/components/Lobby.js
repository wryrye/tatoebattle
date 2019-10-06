import React from "react";
import './Lobby.css'
import $ from "jquery"
import { withRouter } from 'react-router-dom'
import Login from './Login'
import { Switch, Route, Link } from "react-router-dom";
import About from './About'
import LeaderBoard from "./LeaderBoard";

class Lobby extends React.Component {
  constructor(props) {
    super(props);

    // this.state = {
    //   userInfo: undefined
    // }

    this.handlePlay = this.handlePlay.bind(this);
  }

  componentDidMount() {
    const { socket, userInfo, updateInfo, history } = this.props;

    if (userInfo === undefined) {
      $('#login').modal('show');
    }

    socket.removeAllListeners();

    socket.on('accept-join', (data) => {
      updateInfo(data);
      history.push(`/room/${data.room}/${data.player}`)
    });
  }

  handlePlay(e) {
    const { socket, userInfo } = this.props;

    if (userInfo === undefined) {
      $('#login').modal('show');
    } else {
      socket.emit('request-join', e.target.id);
    }    
  }

  render() {
    const { match } = this.props;

    return (
      <div id="lobby" className="HolyGrail">
        <Login {...this.props} />
        <nav id="nav-wrapper" className="navbar navbar-expand-md bg-gray">
          <div id="nav-container" className="container">
            <div>
              <img id="nav-logo" src="/assets/images/tatoebattle.png" width="48" height="48" title="Tatoeba" alt="" />
              <Link id="nav-brand" className="navbar-brand" to={match.url}>TatoeBattle</Link>
              <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarsExampleDefault" aria-controls="navbarsExampleDefault" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
              </button>
            </div>
            <div className="collapse navbar-collapse" id="navbarsExampleDefault">
              <ul className="navbar-nav mr-auto">
                <li className="nav-item">
                  <Link className="nav-link" to={`${match.url}/about`}>About</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to={`${match.url}/leader-board`}>LeaderBoard</Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        <Switch>
          <Route exact path={`${match.url}/about`} component={About}></Route>
          <Route exact path={`${match.url}/leader-board`} component={LeaderBoard}></Route>
          <Route exact path={match.path} >
            <div className="HolyGrail-body">
              <div className="container">
                <div className="row h-100">
                  <div className="col-sm-4 my-4">
                    <div className="wrapper h-100">
                      <img className="card-img logo" src="/assets/images/rando2.png" alt="" />
                      <div className="card p-4 h-100 borderless" style={{ width: "100%" }}>
                        <div className="card-block h-100 flexing">
                          <div className="flexible">
                            <h3 className="card-title">Random</h3>
                            <p className="card-text">Play against some rando</p>
                          </div>
                          <button id="rando" className="battle btn btn-primary hidden big-text" onClick={this.handlePlay}>PLAY</button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-4 my-4">
                    <div className="wrapper h-100">
                      <img className="card-img logo" src="/assets/images/google2.png" alt="" />
                      <div className="card p-4 h-100 borderless" style={{ width: "100%" }}>
                        <div className="card-block h-100 flexing">
                          <div className="flexible">
                            <h3 className="card-title">Google</h3>
                            <p className="card-text">Play against Google</p>
                          </div>
                          <button id="google" className="battle btn btn-primary hidden big-text" onClick={this.handlePlay}>PLAY</button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-4 my-4">
                    <div className="wrapper h-100">
                      <img className="card-img logo" src="/assets/images/baidu2.png" alt="" />
                      <div className="card p-4 h-100 borderless" style={{ width: "100%" }}>
                        <div className="card-block h-100 flexing">
                          <div className="flexible">
                            <h3 className="card-title">Baidu</h3>
                            <p className="card-text">Play against Baidu</p>
                          </div>
                          <button id="baidu" className="battle btn btn-primary hidden big-text" onClick={this.handlePlay}>PLAY</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Route>
        </Switch>
        <footer></footer>
      </div>
    );
  }
}

export default withRouter(Lobby);