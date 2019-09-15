import React from "react";
import './Room.css'
import socketClient from "socket.io-client";
import $ from "jquery"
import { withRouter } from 'react-router-dom'

window.$ = window.jQuery = require("jquery");
require('jquery-textfill/source/jquery.textfill.min.js');

class Room extends React.Component {
  constructor(props) {
    super(props);

    this.username = "test";
    this.avatar = "jackie";

    this.state = {
      socketServer: "http://127.0.0.1:3045"
    };
  }

  componentDidMount() {
    const { socketServer } = this.state;
    const socket = socketClient(socketServer);

    var room = this.props.room;
    var player = this.props.player;
    var master = this.props.avatar;


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

    console.log("master:" + master);
    import(`../assets/images/${master}.png`).then((image) => {
      $('#player' + me).attr("src", image.default);
    });


    socket.on('connect', function () {
      var req = {
        'lobby': room,
        'player': {
          'uname': uname,
          'master': master,
          'socket': socket.id,
          'player': '<%= player %>',
          'test': "ugh"
        }
      }
      socket.emit('ready-start', req);
    });

    /** submits guess  **/
    $('#submit-guess').click(function () {
      $(this).prop("disabled", true);
      socket.emit('submit-guess', { "lobby": room, "player": "<%= player %>", "guess": $("#text-input").val() });
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


  render() {
    return (
      <div>
        <div id="p1">P1</div>
        <div id="p2">P2</div>

        <h2 id='room' >MY ROOM</h2>
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

export default withRouter(Room);