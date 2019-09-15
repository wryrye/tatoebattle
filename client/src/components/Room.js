import React from "react";
import './Room.css'

class Room extends React.Component {
  constructor(props) {
    super(props);
    
    this.username = "test";
    this.avatar = "jackie";

    this.state = {
      socketServer: "http://127.0.0.1:3045"
    };
  }

  
  render() {
    return (
      <div>
        <div id="p1">P1</div>
        <div id="p2">P2</div>

        <h2 id='room' >MY ROOM</h2>
        <img id="player1" src="" alt=""/>
        <img id="player2" src="" alt=""/>
        <span id="container1">
          <canvas id="waves1"></canvas>
        </span>
        <span id="container2">
          <canvas id="waves2"></canvas>
        </span>


        <div id="entry">
          <div className="textfill"><span id="eng-sent"></span></div>
          <div className="textfill"><span id="chin-sent"></span></div>
          <div className="input-group p-3">
            <input id="text-input" name="searchtext" value="" className="form-control" type="text" />
            <span className="input-group-btn">
              <button className="btn btn-default" type="submit" id="submit-guess">输入</button>
            </span>
          </div>
        </div>
      </div>
    );
  }
}

export default Room;