import React from "react";
import './Room.css'
import $ from "jquery"
import { withRouter } from 'react-router-dom'
import queryParser from 'query-string';

window.$ = window.jQuery = require("jquery");
require('jquery-textfill/source/jquery.textfill.min.js');

var SineWaves = require('sine-waves/sine-waves.min.js');

class Room extends React.Component {
  constructor(props) {
    super(props);

    this.baseWave = {
      timeModifier: 0.25,
      lineWidth: 2,
      amplitude: -100,
      wavelength: 25
    }

    this.wavesP1 = [{ ...this.baseWave }];
    this.wavesP2 = [{ ...this.baseWave }];

    this.canvasRight = null;
    this.canvasWidth = null;
    this.canvasUnit = null;
  }

  componentDidMount() {
    const { socket, room, player, master } = this.props;

    if (!room || !player || !master) {
      let queryString = this.props.location.search;
      let queryObject = queryParser.parse(queryString);
      this.props = queryObject;
      console.log(this.props);
    }

    $("#text-input").keyup(function (event) {
      if (event.keyCode === 13) {
        $('#submit-guess').click()
      }
    });

    var zhSent = $('#chin-sent');
    var enSent = $('#eng-sent');

    enSent.html("等待对手");
    enSent.addClass("loading");
    enSent.parent().textfill({ maxFontPixels: 100 });

    $('#submit-guess').prop("disabled", true);

    var me = player === 1 ? 1 : 2;
    var opp = player === 1 ? 2 : 1;

    $('#avatar-P' + me).attr('src', `/assets/images/${master}.png`);


    var data = {
      'room': room,
      'player': {
        'master': master,
        'socket': socket.id,
        'player': player,
      }
    }
    socket.emit('ready-start', data);

    /** submits guess  **/
    $('#submit-guess').click(function () {
      $(this).prop("disabled", true);
      socket.emit('submit-guess', { room, player, guess: $("#text-input").val() });
      $("#text-input").val('');
    });

    /** listens for results **/
    var isFirst = null;

    socket.on('start-game', (data) => {
      $('#avatar-P' + opp).attr("src", `/assets/images/${data.players[parseInt(opp) - 1].master}.png`);
    });

    socket.on('next-round', (data) => {
      const { question } = data;

      enSent.removeClass("loading");
      enSent.html(question);
      enSent.parent().textfill({ maxFontPixels: 100 });

      zhSent.empty();

      $('#submit-guess').prop("disabled", false);
    });

    socket.on('prelim', (data) => {
      const { answer, score } = data;

      isFirst = true;

      zhSent.html(answer);
      zhSent.parent().textfill({ maxFontPixels: 100 });

      this.animateWaves(score);
    });

    socket.on('final', (data) => {
      const { answer, winner, score } = data;

      if (!isFirst) {
        zhSent.html(answer);
        zhSent.parent().textfill({ maxFontPixels: 100 });
        isFirst = null;
      }

      if (winner !== null) this.addWave(winner)
      this.animateWaves(score);

      enSent.html("Next round");
      enSent.addClass("loading");

      setTimeout(function () { socket.emit('ready-next', room); }, 4000); //ready for next round
    });

    socket.on('game-over', (data) => {
      const { answer, winner, score } = data;

      if (!isFirst) {
        zhSent.html(answer);
        zhSent.parent().textfill({ maxFontPixels: 100 });
      }

      if (winner !== null) this.addWave(winner)
      this.animateWaves(score);

      enSent.css("font-weight", "bold");
      enSent.html(player === winner ? 'VICTORY' : "DEFEAT");

      setTimeout(function () { window.location.replace("/lobby/"); }, 4000);
    });

    socket.on('disconnect', () => {
      enSent.html("Opponent disconnected...");
      enSent.css("color", "red");
      enSent.css("font-weight", "bold");

      setTimeout(function () { window.location.replace("/lobby/"); }, 6000);
    });

    this.createWave(1, true);
    this.createWave(2, true);

    this.canvasRight = parseFloat($('#waves-canvas-P2').css("right"));
    this.canvasWidth = parseFloat($('#waves-canvas-P1').css("width"));
    this.canvasUnit = this.canvasWidth / 10;
  }

  createWave(player, init) {
    const wrapper = $(`#waves-wrapper-P${player}`);
    const canvas = $(`#waves-canvas-P${player}`)

    const rgbaStr = player === 1 ? 
      "rgba(255, 0, 0, 0.2)" :
      "rgba(23, 210, 168, 0.2)"

    new SineWaves({
      el: canvas[0],
      speed: 30,
      width: () => { return wrapper.width(); },
      height: () => { return wrapper.height(); },
      ease: 'SineInOut',
      wavesWidth: '100%',
      waves: this[`wavesP${player}`],
      resizeEvent: this.getResizeEvent(rgbaStr)
    });
  }

  getResizeEvent = function (rgbaStr) {
    return function () {
      var gradient = this.ctx.createLinearGradient(0, 0, this.width, 0);
      gradient.addColorStop(0, rgbaStr);
      gradient.addColorStop(0.5, "rgba(255, 255, 255, 1)");
      gradient.addColorStop(1, rgbaStr);

      var index = -1;
      var length = this.waves.length;
      while (++index < length) {
        this.waves[index].strokeStyle = gradient;
      }

      // Clean Up
      index = void 0;
      length = void 0;
      gradient = void 0;
    }
  }

  addWave(winner) {
      let newWave = {
        type: ['Sine', 'Square', 'Sawtooth', 'Triangle'][Math.floor(Math.random() * 4) + 1],
        timeModifier: .1 + (Math.random() * .1),
        lineWidth: 1 + (Math.random() * 2),
        amplitude: 35 + (Math.random() * 100),
        wavelength: 100 + (Math.random() * 50)
      };

      if (newWave.type === 'Sine') {
        newWave.wavelength = 10 + (Math.random() * 20);
      }

      if (winner === 1) {
        this[`wavesP1`].push(newWave);
        this[`wavesP2`] =[{ ...this.baseWave }];
      } else {
        this[`wavesP2`].push(newWave);
        this[`wavesP1`] =[{ ...this.baseWave }];
      }

      const wavesCanvasP1 = $(`#waves-canvas-P1`);
      const wavesCanvasP2 = $(`#waves-canvas-P2`);

      const widthP1 = wavesCanvasP1.width();
      const widthP2 = wavesCanvasP2.width();

      this.createWave(1);
      this.createWave(2);

      wavesCanvasP1.width(widthP1);
      wavesCanvasP2.width(widthP2);
  }

  animateWaves(score) {
    const clampScore = Math.min(Math.max(score, -10), 10);
    const { canvasWidth, canvasUnit, canvasRight } = this;
    
    const wavesWidth1 = canvasWidth + (canvasUnit * clampScore);
    const wavesWidth2 = canvasWidth - (canvasUnit * clampScore);
    const wavesRight2 = canvasRight - (canvasUnit * clampScore);
    
    $("#waves-canvas-P1").animate({
      width: wavesWidth1,
    }, 3000, function () {
    });
    $("#waves-canvas-P2").animate({
      width: wavesWidth2,
      right: wavesRight2,
    }, 3000, function () {
    });
  }

  render() {
    const { room, player } = this.props;

    return (
      <div id="room" className="h-100 flexing">
        <div className="d-flex justify-content-between">
          <div id="P1" className="player mx-5">P1</div>
          <h2 id="room-name" className="" >{room}</h2>
          <div id="P2" className="player mx-5">P2</div>
        </div>

        <div className="row flexible">
          <img id="avatar-P1" className="col-3 mh-100 no-padding" src="" alt="" />
          <span id="waves-wrapper-P1" className="test mh-100 no-padding">
            <canvas id="waves-canvas-P1" className="waves"></canvas>
          </span>
          <span id="waves-wrapper-P2" className="test mh-100 no-padding">
            <canvas id="waves-canvas-P2" className="waves"></canvas>
          </span>
          <img id="avatar-P2" className="col-3 mh-100 no-padding" src="" alt="" />
        </div>

        <div id="entry" className="flexible">
          <div className="textfill"><span id="eng-sent"></span></div>
          <div className="textfill"><span id="chin-sent"></span></div>
          <div className="input-group p-3">
            <input id="text-input" name="searchtext" className="form-control" type="text" placeholder="Enter translation..." />
            <span className="input-group-btn">
              <button className="btn btn-default form-control" type="submit" id="submit-guess">&#8620;</button>
            </span>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(Room);