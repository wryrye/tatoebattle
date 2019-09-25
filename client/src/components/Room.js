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
  }

  componentDidMount() {
    const { socket, room, player, master } = this.props;
    console.log('socketID:' + socket.id);

    if (!room || !player || !master) {
      let queryString = this.props.location.search;
      let queryObject = queryParser.parse(queryString);
      this.props = queryObject;
      console.log(this.props);
    }


    /** mobile-friendly **/
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      console.log(window.innerHeight);
      console.log(window.innerWidth);
      if (window.innerHeight > window.innerWidth) {
        window.alert("Please use Landscape!");
      }
      $("#room").css("font-size", "8em");
      $("#room").css("text-shadow", "-2px 0 red, 0 2px yellow, 2px 0 blue, 0 -2px red");
    }

    var zhSent = $('#chin-sent');

    var enSent = $('#eng-sent');
    enSent.html("等待对手");
    enSent.addClass("loading");
    enSent.parent().textfill({ maxFontPixels: 100 });

    $('#submit-guess').prop("disabled", true);

    /** initialize things **/
    var uname = "trash"
    // var master = JSON.parse(document.cookie).master;

    var me = player === 1 ? 1 : 2;
    var opp = player === 1 ? 2 : 1;

    $('#player' + me).attr('src', `/assets/images/${master}.png`);


    var data = {
      'room': room,
      'player': {
        'uname': uname,
        'master': master,
        'socket': socket.id,
        'player': player,
        'test': "ugh"
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

    socket.on('start-game', function (data) {
      $('#player' + opp).attr("src", `/assets/images/${data.players[parseInt(opp) - 1].master}.png`);
    });

    socket.on('next-round', function (data) {
      enSent.removeClass("loading");
      console.log(JSON.stringify(data))
      enSent.html(data.sent);
      enSent.parent().textfill({ maxFontPixels: 100 });
      zhSent.empty();
      $('#submit-guess').prop("disabled", false);
    });

    socket.on('prelim', function (data) {
      isFirst = true;
      zhSent.html(data.sent);
      zhSent.parent().textfill({ maxFontPixels: 100 });
      animateWaves(data.score);
    });

    socket.on('final', (data) => {
      if (!isFirst) {
        zhSent.html(data.sent);
        zhSent.parent().textfill({ maxFontPixels: 100 });
      }

      // this.initWaves('add');
      animateWaves(data.score);


      enSent.html("Next round");
      enSent.addClass("loading");
      setTimeout(function () { socket.emit('ready-next', room); }, 4000); //ready for next round
      isFirst = null;
    });

    socket.on('game-over', function (data) {
      if (!isFirst) {
        zhSent.html(data.sent);
        zhSent.parent().textfill({ maxFontPixels: 100 });
      }

      animateWaves(data.score);

      const outcome = player === data.winner ? "赢" : "输";
      enSent.html(outcome);
      enSent.css("font-weight", "bold");
      setTimeout(function () { window.location.replace("/lobby/"); }, 4000);
    });

    socket.on('disconnect', () => {
      enSent.html("Opponent disconnected...");
      enSent.css("color", "red");
      enSent.css("font-weight", "bold");
      setTimeout(function () { window.location.replace("/lobby/"); }, 6000);
    });

    $("#text-input").keyup(function (event) {
      if (event.keyCode === 13) {
        $('#submit-guess').click()
      }
    });

    this.initWaves();

    /** eye candy **/
    var step = parseFloat($('#waves1').css("width")) / 10;
    var baseWidth = parseFloat($('#waves1').css("width"));
    var baseRight = parseFloat($('#waves2').css("right"));;

    function animateWaves(score) {
      let clampScore = Math.min(Math.max(score, -10), 10);

      let wavesWidth1 = baseWidth + step * clampScore;
      let wavesWidth2 = baseWidth - step * clampScore;
      let wavesRight2 = baseRight - step * clampScore;
      console.log("animating")
      $("#waves1").animate({
        width: wavesWidth1,
      }, 3000, function () {
      });
      $("#waves2").animate({
        width: wavesWidth2,
        right: wavesRight2,
      }, 3000, function () {
      });
    }
  }

  initWaves(action) {
    var div = 1;
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      div = 2;
    }

    // add to streak
    if (action === 'add') {
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

      this.wavesP1.push(newWave);
    }

    new SineWaves({
      el: document.getElementById('waves1'),

      speed: 30,

      width: function () {
        return $('#container1').width();
      },

      height: function () {
        return $('#container1').height() / div;
      },

      ease: 'SineInOut',

      wavesWidth: '100%',

      waves: this.wavesP1,

      // Called on window resize
      resizeEvent: function () {
        var gradient = this.ctx.createLinearGradient(0, 0, this.width, 0);
        gradient.addColorStop(0, "rgba(255, 0, 0, 0.2)");
        gradient.addColorStop(0.5, "rgba(255, 255, 255, 1)");
        gradient.addColorStop(1, "rgba(255, 0, 0, 0.2)");

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
    });

    new SineWaves({
      el: document.getElementById('waves2'),

      speed: 30,

      width: function () {
        return $('#container2').width();
      },

      height: function () {
        return $('#container2').height() / div;
      },

      ease: 'SineInOut',

      wavesWidth: '100%',

      waves: this.wavesP2,

      // Called on window resize
      resizeEvent: function () {
        var gradient = this.ctx.createLinearGradient(0, 0, this.width, 0);
        gradient.addColorStop(0, "rgba(23, 210, 168, 0.2)");
        gradient.addColorStop(0.5, "rgba(255, 255, 255, 1)");
        gradient.addColorStop(1, "rgba(23, 210, 168, 0.2)");

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
    });

    // var resizeWave = function (wave, width) {
    //   var gradient = wave.ctx.createLinearGradient(0, 0, width, 0);
    //   gradient.addColorStop(0, "rgba(23, 210, 168, 0.2)");
    //   gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.5)");
    //   gradient.addColorStop(1, "rgba(23, 210, 168, 0.2)");

    //   var index = -1;
    //   var length = wave.waves.length;
    //   while (++index < length) {
    //     wave.waves[index].strokeStyle = gradient;
    //   }

    //   // Clean Up
    //   index = void 0;
    //   length = void 0;
    //   gradient = void 0;
    // }

  }


  render() {
    const { room, player } = this.props;

    return (
      <div className="h-100 flexing">
        <div className="d-flex justify-content-between">
          <div id="p1" className="mx-5">P1</div>
          <h2 id='room' className="" >{room}</h2>
          <div id="p2" className="mx-5">P2</div>
        </div>

        <div className="row flexible">
          <img id="player1" className="col-3 mh-100 no-padding" src="" alt="" />
          <span id="container1" className="col-3 mh-100 no-padding">
            <canvas id="waves1"></canvas>
          </span>
          <span id="container2" className="col-3 mh-100 no-padding">
            <canvas id="waves2"></canvas>
          </span>
          <img id="player2" className="col-3 mh-100 no-padding" src="" alt="" />
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