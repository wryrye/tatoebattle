import React from "react";
import './Room.css'

class Room extends React.Component {
  render() {
    return (
      <div>
        <div id="p1">P1</div>
        <div id="p2">P2</div>

        <h2 id='room' >MY ROOM</h2>
        <img id="player1" src="" />
        <img id="player2" src="" />
        <span id="container1">
          <canvas id="waves1"></canvas>
        </span>
        <span id="container2">
          <canvas id="waves2"></canvas>
        </span>


        <div id="entry">
          <div class="textfill"><span id="eng-sent"></span></div>
          <div class="textfill"><span id="chin-sent"></span></div>
          <div class="input-group p-3">
            <input id="text-input" name="searchtext" value="" class="form-control" type="text" />
            <span class="input-group-btn">
              <button class="btn btn-default" type="submit" id="submit-guess">输入</button>
            </span>
          </div>
        </div>
      </div>
    );
  }
}

export default Room;