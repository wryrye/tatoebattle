// websocket server
const io = require('socket.io')();
var randoMode = require('./src/Rando.js');
var companyMode = require('./src/Company.js');

class Room {
  constructor() {
    this.occupancy = 0;
    this.players = [];
    this.score = 0;

    this.round = {
      answer: null,
      first: null,
      submissions: 0
    }
  }
}

const roomMap = {}
const roomList = ['北京', '香港', '苏州', '桂林']
roomList.forEach((name) => {
  roomMap[name] = new Room();
});

io.on('connection', function (socket) {

  // find open room
  socket.on('request-join', (mode) => {
    switch (mode) {
      case 'rando':
        randoMode(this, socket, roomMap);
        break;
      case 'google':
      case 'baidu':
        companyMode(this, socket, roomMap);
        break;
    }
  });
});

const port = 3045;
io.listen(port);
console.log('listening on port:', port);