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
    if(!registered) {
      console.log("not registered!");
      $('#exampleModalLong').modal('show');
    } else {
      updateInfo(document.cookie)
    }
    
    socket.emit('lobby-info');
    socket.on('lobby-info', function (lobbies) {
      for (var lobby in lobbies) {
        if (lobbies.hasOwnProperty(lobby)) {
          if (lobbies[lobby].count === 0) {
            $('#' + lobby).removeClass("disabled");
          }
          else if (lobbies[lobby].count === 1) {
            $('#' + lobby).removeClass("disabled");
          }
        }
      }
    });

    $('.battle').click(function(){
        socket.emit('request-join', $(this).attr('id'));
    });

    socket.on('accept-join', (data) => {
      updateInfo(data);
      history.push(`/room/${data.room}/${data.player}`)
    });
  }

  render() {

    return (
      <div>
        <Login {...this.props} />
        <nav className="navbar navbar-expand-md navbar-dark bg-dark fixed-top">
          <a className="navbar-brand" href="lobby">翻译战争</a>
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarsExampleDefault" aria-controls="navbarsExampleDefault" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarsExampleDefault">
            <ul className="navbar-nav mr-auto">
              <li className="nav-item active">
                <a className="nav-link" href="lobby">大唐 <span className="sr-only">(current)</span></a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="lobby">奖牌榜</a>
              </li>
            </ul>
          </div>
        </nav>

        <main role="main" className="container-fluid">
          <div className="container">
            <div className="row mt-3">
              <div className="col-sm-4 mt-3">
                <div className="card p-2" style={{ width: "100%" }}>
                  <div className="card-block">
                    <h4 className="card-title">北京</h4>
                    <p className="card-text">北京</p>
                    <button id="北京" className="battle btn btn-primary disabled">挑战</button>
                  </div>
                </div>
              </div>
              <div className="col-sm-4 mt-3">
                <div className="card p-2" style={{ width: "100%" }}>
                  <div className="card-block">
                    <h4 className="card-title">香港</h4>
                    <p className="card-text">香港</p>
                    <button id="香港" className="battle btn btn-primary disabled">挑战</button>
                  </div>
                </div>
              </div>
              <div className="col-sm-4 mt-3">
                <div className="card p-2" style={{ width: "100%" }}>
                  <div className="card-block">
                    <h4 className="card-title">苏州</h4>
                    <p className="card-text">苏州</p>
                    <button id="苏州" className="battle btn btn-primary disabled">挑战</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default withRouter(Lobby);