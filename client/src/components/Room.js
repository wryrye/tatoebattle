import React from "react";
import './Room.css'
import socketClient from "socket.io-client";
import $ from "jquery"
import { withRouter } from 'react-router-dom'
import queryParser from 'query-string';

window.$ = window.jQuery = require("jquery");
require('jquery-textfill/source/jquery.textfill.min.js');

var SineWaves = require('sine-waves/sine-waves.min.js');

class Room extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      socketServer: process.env.REACT_APP_SOCKET
    };
  }

  componentDidMount() {
    const { socketServer } = this.state;
    const socket = socketClient(socketServer);

    let { room, player, master } = this.props;

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

    socket.on('connect', function () {
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
    });

    /** submits guess  **/
    $('#submit-guess').click(function () {
      $(this).prop("disabled", true);
      socket.emit('submit-guess', { "room": room, "player": "<%= player %>", "guess": $("#text-input").val() });
      $("#text-input").val('');
    });

    /** listens for results **/
    var first = null;
    socket.on(room, function (obj) {
      switch (obj.op) {
        case 4: //get other players info
          $('#player' + opp).attr("src", "/images/" + obj.players[parseInt(opp) - 1].master + ".png");
          break;
        case 0: //next round
          enSent.removeClass("loading");
          enSent.html(obj.sent);
          enSent.parent().textfill({ maxFontPixels: 100 });
          zhSent.empty();
          $('#submit-guess').prop("disabled", false);
          break;
        case 1: // preliminary results for the genius who answers first
          zhSent.html(obj.sent);
          zhSent.parent().textfill({ maxFontPixels: 100 });
          animateWaves(obj.points);
          first = { 'points': obj.points }
          break;
        case 2:
          if (first) { // final results for both players
            animateWaves(-first.points + obj.points);
          } else {
            zhSent.html(obj.sent);
            zhSent.parent().textfill({ maxFontPixels: 100 });
            animateWaves(obj.points);
          }
          enSent.html("下一轮");
          enSent.addClass("loading");
          setTimeout(function () { socket.emit('ready-next', room); }, 4000); //ready for next round
          first = null;
          break;
        case 3: //game is over
          if (first) {
            animateWaves(-first.points + obj.points);
          } else {
            zhSent.html(obj.sent);
            animateWaves(obj.points);
          }
          var outcome = player === obj.winner ? "赢" : "输";
          enSent.html(outcome);
          setTimeout(function () { window.location.replace("/lobby/"); }, 4000);
          first = null;
          break;
        case 5: //game is over
          enSent.html("对手断线了");
          enSent.css("color", "red");
          enSent.css("font-weight", "bold");
          setTimeout(function () { window.location.replace("/lobby/"); }, 6000);
          first = null;
          break;
        default: //erm...
          console.log("default")
      }
    });

    $("#text-input").keyup(function (event) {
      if (event.keyCode === 13) {
        $('#submit-guess').click()
      }
    });

    this.initWaves();

    /** eye candy **/
    var step = parseFloat($('#waves1').css("width")) / 10;
    var waves1_width = parseFloat($('#waves1').css("width"));
    var waves2_width = parseFloat($('#waves2').css("width"));
    var waves2_right = parseFloat($('#waves2').css("right"));

    function animateWaves(points) {
      waves1_width += step * points;
      waves2_width -= step * points;
      waves2_right -= step * points;
      console.log("animating")
      $("#waves1").animate({
        width: waves1_width,
      }, 3000, function () {
      });
      $("#waves2").animate({
        width: waves2_width,
        right: waves2_right,
      }, 3000, function () {
      });
    }
  }

  initWaves() {
    var div = 1;
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      div = 2;
    }

    var waves1 = new SineWaves({
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

      waves: [
        {
          timeModifier: 4,
          lineWidth: 1,
          amplitude: -25,
          wavelength: 25
        },
        {
          timeModifier: 2,
          lineWidth: 2,
          amplitude: -40,
          wavelength: 50
        },
        {
          timeModifier: 1,
          lineWidth: 1,
          amplitude: -60,
          wavelength: 100
        },
        {
          timeModifier: 0.5,
          lineWidth: 1,
          amplitude: -75,
          wavelength: 200
        },
        {
          timeModifier: 0.25,
          lineWidth: 2,
          amplitude: -100,
          wavelength: 400
        }
      ],

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

    var waves2 = new SineWaves({
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

      waves: [
        {
          timeModifier: 4.2,
          lineWidth: 1,
          amplitude: 25,
          wavelength: 25
        },
        {
          timeModifier: 2.2,
          lineWidth: 2,
          amplitude: 40,
          wavelength: 50
        },
        {
          timeModifier: 1.2,
          lineWidth: 1,
          amplitude: 60,
          wavelength: 100
        },
        {
          timeModifier: 0.52,
          lineWidth: 1,
          amplitude: 75,
          wavelength: 200
        },
        {
          timeModifier: 0.252,
          lineWidth: 2,
          amplitude: 100,
          wavelength: 400
        }
      ],

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

    var resizeWave = function (wave, width) {
      var gradient = wave.ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, "rgba(23, 210, 168, 0.2)");
      gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.5)");
      gradient.addColorStop(1, "rgba(23, 210, 168, 0.2)");

      var index = -1;
      var length = wave.waves.length;
      while (++index < length) {
        wave.waves[index].strokeStyle = gradient;
      }

      // Clean Up
      index = void 0;
      length = void 0;
      gradient = void 0;
    }

  }


  render() {
    const { room, player } = this.props;
    console.log(room)

    return (
      <div>
        {player === 1 ?
        <div id="p1">P1</div> :
        <div id="p2">P2</div>}

        <h2 id='room' >{room}</h2>

        <img id="player1" src="" alt="" />
        <img id="player2" src="" alt="" />
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
            <input id="text-input" name="searchtext" className="form-control" type="text" />
            <span className="input-group-btn">
              <button className="btn btn-default" type="submit" id="submit-guess">输入</button>
            </span>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(Room);