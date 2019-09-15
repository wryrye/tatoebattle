import React from "react";
import 'bootstrap/dist/js/bootstrap.min.js';
import 'bootstrap/dist/js/bootstrap.min.js.map';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/css/bootstrap.min.css.map';



class Lobby extends React.Component {
  render() {
    return (
      <div>
        <nav className="navbar navbar-expand-md navbar-dark bg-dark fixed-top">
          <a className="navbar-brand" href="lobby">翻译战争</a>
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarsExampleDefault" aria-controls="navbarsExampleDefault" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarsExampleDefault">
            <ul className="navbar-nav mr-auto">
              <li className="nav-item active">
                <a className="nav-link" href="#">大唐 <span className="sr-only">(current)</span></a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">奖牌榜</a>
              </li>
            </ul>
          </div>
        </nav>

        <main role="main" className="container-fluid">
          <div className="container">
            <div className="row mt-3">
              <div className="col-sm-4 mt-3">
                <div className="card p-2" style={{width: "100%"}}>
                  <div className="card-block">
                    <h4 className="card-title">北京</h4>
                    <p className="card-text">北京</p>
                    <a id="北京" href="#" className="battle btn btn-primary disabled">挑战</a>
                  </div>
                </div>
              </div>
              <div className="col-sm-4 mt-3">
                <div className="card p-2" style={{width: "100%"}}>
                  <div className="card-block">
                    <h4 className="card-title">香港</h4>
                    <p className="card-text">香港</p>
                    <a id="香港" href="#" className="battle btn btn-primary disabled">挑战</a>
                  </div>
                </div>
              </div>
              <div className="col-sm-4 mt-3">
                <div className="card p-2" style={{width: "100%"}}>
                  <div className="card-block">
                    <h4 className="card-title">苏州</h4>
                    <p className="card-text">苏州</p>
                    <a id="苏州" href="#" className="battle btn btn-primary disabled">挑战</a>
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

export default Lobby;