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

    this.wrapperP1Ref = React.createRef();
    this.canvasP1Ref = React.createRef();
    this.wrapperP2Ref = React.createRef();
    this.canvasP2Ref = React.createRef();

    this.state = {
      questionText: 'Waiting for opponent',
      questionClass: 'loading',
      answerText: '',
      buttonDisabled: true,
      avatarP1Src: '',
      avatarP2Src: '',
      avatarP1Style: null,
      avatarP2Style: null,
      wrapperStyle: null,
      circleClass: null,
      victory: null,
    }

    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    const { socket, room, player, master, username } = this.props;

    if (!room || !player || !master) {
      let queryString = this.props.location.search;
      let queryObject = queryParser.parse(queryString);
      this.props = queryObject;
      console.log(this.props);
    }

    var zhSent = $('#chin-sent'); // fix
    var enSent = $('#eng-sent'); // fix

    enSent.parent().textfill({ maxFontPixels: 100 }); // fix

    const opponent = player === 1 ? 2 : 1;

    this.setState({ [`avatarP${player}Src`]: `/assets/images/${master}.png` })

    var data = {
      'room': room,
      'player': {
        'master': master,
        'socket': socket.id,
        'player': player,
        'uname': username,
      }
    }

    socket.emit('ready-start', data);

    /** listens for results **/
    var isFirst = null;

    socket.on('start-game', (data) => {
      this.setState({ [`avatarP${opponent}Src`]: `/assets/images/${data.players[opponent - 1].master}.png` })
    });

    socket.on('next-round', (data) => {
      const { question } = data;

      this.setState({
        questionText: question,
        questionClass: '',
        answerText: '',
        buttonDisabled: false
      });

      enSent.parent().textfill({ maxFontPixels: 100 }); //fix
    });

    socket.on('prelim', (data) => {
      const { answer, score } = data;

      isFirst = true;

      this.setState({ answerText: answer })

      zhSent.parent().textfill({ maxFontPixels: 100 }); //fix

      this.animateWaves(score);
    });

    socket.on('final', (data) => {
      const { answer, winner, score } = data;
      console.log(data)


      if (!isFirst) {
        this.setState({ answerText: answer })

        zhSent.parent().textfill({ maxFontPixels: 100 }); //fix  
      }

      isFirst = null;

      if (winner !== null) this.addWave(winner)
      this.animateWaves(score);

      this.setState({
        questionText: 'Next round',
        questionClass: 'loading'
      })

      setTimeout(function () { socket.emit('ready-next', room); }, 4000); //ready for next round
    });

    socket.on('game-over', (data) => {
      const { answer, winner, score } = data;

      if (!isFirst) {
        this.setState({ answerText: answer })

        zhSent.parent().textfill({ maxFontPixels: 100 });
      }

      if (winner !== null) this.addWave(winner)
      this.animateWaves(score);


      // victory animation
      const dir = winner === 1 ? 'right' : 'left';

      setTimeout(() => {
        this.setState({
          [`avatarP${winner}Style`]: { zIndex: 3 },
          wrapperStyle: { zIndex: 3 },
          circleClass: 'active'
        })

        setTimeout(() => { 
          this.setState({
            victory: 
            <div id='victory-container'>
              <div className='victory-item' style={{color:'#0ebfc2', textAlign: dir, [dir]: '0vw'}}>VICTORY</div>
              <div className='victory-item' style={{color:'#9f2cad', textAlign: dir, [dir]: '10vw'}}>VICTORY</div>
              <div className='victory-item' style={{color:'yellow', textAlign: dir, [dir]: '20vw'}}>VICTORY</div>
            </div>
          })
         }, 1500);

        setTimeout(() => { window.location.replace("/lobby/"); }, 5000);
      }, 3000);

    });

    socket.on('disconnect', () => {
      this.setState({
        questionText: 'Opponent disconnected',
        questionClass: 'disconnect'
      })

      setTimeout(function () { window.location.replace("/lobby/"); }, 6000);
    });

    this.createWave(1, true);
    this.createWave(2, true);

    this.canvasRight = parseFloat($('#waves-canvas-P2').css("right"));
    this.canvasWidth = parseFloat($('#waves-canvas-P1').css("width"));
    this.canvasUnit = this.canvasWidth / 10;
  }

  handleKeyUp(e) {
    if (e.keyCode === 13) {
      this.handleSubmit();
    }
  }

  handleSubmit() {
    const { socket, room, player } = this.props;

    this.setState({ buttonDisabled: true })
    socket.emit('submit-guess', { room, player, guess: $("#text-input").val() });
    $("#text-input").val('');
  }

  createWave(player, init) {
    const canvas = this[`canvasP${player}Ref`].current;
    const wrapper = this[`wrapperP${player}Ref`].current;

    const rgbaStr = player === 1 ?
      "rgba(255, 0, 0, 0.2)" :
      "rgba(23, 210, 168, 0.2)"

    new SineWaves({
      el: canvas,
      speed: 30,
      width: () => { return wrapper.offsetWidth; },
      height: () => { return wrapper.offsetHeight - 10; },
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
      this[`wavesP2`] = [{ ...this.baseWave }];
    } else {
      this[`wavesP2`].push(newWave);
      this[`wavesP1`] = [{ ...this.baseWave }];
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
    const { room } = this.props;
    const { wrapperStyle, circleClass, avatarP1Src, avatarP2Src, avatarP1Style, avatarP2Style, questionText, questionClass, answerText, buttonDisabled } = this.state

    return (
      <div id="room" className="h-100 flexing">
        <div className="circle_wrapper" style={wrapperStyle}>
          <p id="circle" href="#" className={circleClass} />
        </div>

        <div className="d-flex justify-content-between">
          <div id="P1" className="player mx-5">P1</div>
          <h2 id="room-name" className="" >{room}</h2>
          <div id="P2" className="player mx-5">P2</div>
        </div>

        <div id="battlefield" className="row flexible">
          <span className="avatar-wrapper col-2 mh-100 no-padding" style={avatarP1Style}>
            <img id="avatar-P1" className="avatar" src={avatarP1Src} alt="" />
          </span>

          <span id="waves-wrapper-P1" className="col-4 mh-100 no-padding" ref={this.wrapperP1Ref}>
            <canvas id="waves-canvas-P1" className="waves" ref={this.canvasP1Ref}></canvas>
          </span>
          <span id="waves-wrapper-P2" className="col-4 mh-100 no-padding" ref={this.wrapperP2Ref}>
            <canvas id="waves-canvas-P2" className="waves" ref={this.canvasP2Ref}></canvas>
          </span>
          <span className="avatar-wrapper col-2 mh-100 no-padding" style={avatarP2Style}>
            <img id="avatar-P2" className="avatar" src={avatarP2Src} alt="" />
          </span>
        </div>

        <div id="entry" className="flexible">
          <div className="textfill"><span id="eng-sent" className={questionClass}>{questionText}</span></div>
          <div className="textfill"><span id="chin-sent" dangerouslySetInnerHTML={{ __html: answerText }} ></span></div>
          <div className="input-group p-3">
            <input id="text-input" name="searchtext" className="form-control" type="text" placeholder="Enter translation..." onKeyUp={this.handleKeyUp} />
            <span className="input-group-btn">
              <button className="btn btn-default form-control" type="submit" id="submit-guess" onClick={this.handleSubmit} disabled={buttonDisabled}>&#8620;</button>
            </span>
          </div>
        </div>

        {this.state.victory}
      </div>
    );
  }

  componentWillUnmount(){
    const { socket } = this.props;
    socket.removeAllListeners();
    socket.disconnect();
  }
}

export default withRouter(Room);