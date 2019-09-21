import React from "react";
import './Lobby.css'
import $ from "jquery"
import { withRouter } from 'react-router-dom'
import Login from './Login'

class Lobby extends React.Component {
  // constructor(props) {
  //   super(props);
  // }

  componentDidMount() {
    const { socket, updateInfo, history } = this.props;

    let registered = document.cookie !== ''
    if (!registered) {
      console.log("not registered!");
      $('#exampleModalLong').modal('show');
    } else {
      updateInfo(document.cookie)
    }

    $('.battle').click(function () {
      socket.emit('request-join', $(this).attr('id'));
    });

    socket.on('accept-join', (data) => {
      updateInfo(data);
      history.push(`/room/${data.room}/${data.player}`)
    });
  }

  render() {

    return (
      <div class="HolyGrail">
        <Login {...this.props} />
        <header className="navbar navbar-expand-md navbar-dark bg-dark">
          <a className="navbar-brand" href="lobby">TatoeBattle</a>
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarsExampleDefault" aria-controls="navbarsExampleDefault" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarsExampleDefault">
            <ul className="navbar-nav mr-auto">
              <li className="nav-item active">
                <a className="nav-link" href="lobby">About<span className="sr-only">(current)</span></a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="lobby">Leader Board</a>
              </li>
            </ul>
          </div>
        </header>
        <div class="HolyGrail-body">
          <div className="container">
            <div className="row h-100">
              <div className="col-sm-4 mt-4">
                <div className="wrapper h-100">
                  <img class="card-img logo" src="/assets/images/rando2.png"/>
                  <div className="card p-4 h-100 borderless" style={{ width: "100%" }}>
                    <div className="card-block h-100 flexing">
                      <div className="flexible">
                        <h3 className="card-title">Random</h3>
                        <p className="card-text">Play against some rando</p>
                      </div>
                      <button id="北京" className="battle btn btn-primary hidden big-text">PLAY</button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-sm-4 mt-4">
                <div className="wrapper h-100">
                  <img class="card-img logo" src="/assets/images/google2.png"/>
                  <div className="card p-4 h-100 borderless" style={{ width: "100%" }}>
                    <div className="card-block h-100 flexing">
                      <div className="flexible">
                        <h3 className="card-title">Google</h3>
                        <p className="card-text">Play against Google</p>
                      </div>
                      <button id="香港" className="battle btn btn-primary hidden big-text">PLAY</button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-sm-4 mt-4">
                <div className="wrapper h-100">
                  <img class="card-img logo" src="/assets/images/baidu2.png"/>
                  <div className="card p-4 h-100 borderless" style={{ width: "100%" }}>
                    <div className="card-block h-100 flexing">
                      <div className="flexible">
                        <h3 className="card-title">Baidu</h3>
                        <p className="card-text">Play against Baidu</p>
                      </div>
                      <button id="苏州" className="battle btn btn-primary hidden big-text">PLAY</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <footer>…</footer>
      </div>
    );
  }
}

export default withRouter(Lobby);