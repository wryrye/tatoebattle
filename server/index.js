const red = "\x1b[31m"
const green = "\x1b[32m";
const magenta = "\x1b[35m";
const cyan = "\x1b[36m";

// redis server
let redis = require("redis"),
  redisClient = redis.createClient(process.env.REDIS_URL),
  redisIndex = parseInt(Math.random() * 20000);

function getTrans() {
  return new Promise(resolve => {
    redisClient.lrange(redisIndex++, 0, 3, (err, data) => {
      if (err) { throw err; }
      resolve({ zhSent: data[1], enSent: data[2] });
    });
  });
}

// websocket server

const io = require('socket.io')();

class Room {
  constructor() {
    this.occupancy = 0;
    this.players = [];
    this.score = 0;

    this.round = {
      answer: null,
      submissions: 0,
      first: null
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
  socket.on('request-join', () => {
    for (let [room, info] of Object.entries(roomMap)) {
      if (info.occupancy < 2) {
        socket.join(room);
        console.log(green, `Client ${socket.id} has joined ${room}`)
        socket.emit('accept-join', { room: room, player: ++info.occupancy });
        return;
      }
    }
    // @unhandled
    socket.emit('full');
  });

  // start game when both players ready
  socket.on('ready-start', function (data) {
    const { room, player } = data;

    console.log(green, `Client ${socket.id} in ${room} is ready`)
    roomMap[room].players.push(player);

    if (roomMap[room].players.length >= 2) {
      console.log(green, `Starting game in ${room}...`);
      startGame(room)
    }
  });

  // next round when both players ready
  socket.on('ready-next', function (room) {
    if (++roomMap[room].round.submissions == 2) {
      nextRound(room)
    }
  });

  // evaluate submission
  socket.on('submit-guess', function (data) {
    const { room, player, guess } = data;
    const isP1 = player == 1;
    const roomInfo = roomMap[room];
    const isFirst = roomInfo.first == null;

    let { htmlAnswer, points } = testGuess(roomInfo.answer, guess)
    points = isP1 ? points : -points;

    roomInfo.score += points;
    const score = roomInfo.score;



    // first submitter gets prelim results
    if (isFirst) { 
      roomInfo.first = points
      socket.emit('prelim', {'sent': htmlAnswer, score });
    } else {
      //if a winning score has been reached, game over!
      console.log('Score: ' + score)

      if (score >= 10 || score <= -10) { 
        const winner = score >= 10 ? 1 : 2;
        console.log(cyan, `Player ${winner} has won!`)
        io.to(room).emit('game-over', { 'sent': htmlAnswer, score, winner });
        resetRoom(room);
      } else { // both players get final results
        io.to(room).emit('final', { 'sent': htmlAnswer, score });
        roomInfo.first = null
      }
    }
  });

  socket.on('disconnect', function (socket) {
    console.log(red, `Someone has disconnected`)
  });
});

function startGame(room) {
  io.to(room).emit('start-game', {'players': roomMap[room].players });
  nextRound(room);

  // end game if no heartbeat
  let heartbeat = setInterval(function ping() {
    roomMap[room].players.forEach((player) => {
      if (!io.sockets.connected[player.socket]) {
        io.to(room).emit('disconnect');
        resetRoom(data.room);
        clearInterval(heartbeat);
      }
    });
  }, 15000);
}

function nextRound(room) {
  console.log(magenta, "Next round...");
  roomMap[room].round.submissions = 0;

  getTrans().then(trans => {
    roomMap[room].answer = trans.zhSent;
    io.to(room).emit('next-round', {'sent': trans.enSent });
  })
}

function testGuess(answer, guess) {
  const punct = "“”！。？，\\\"";

  let htmlAnswer = '';
  let points = 0;

  for (let i of answer) {
    if (guess.indexOf(i) == -1 || punct.indexOf(i) > -1) {//if a char is punctuation
      htmlAnswer += colorChar('000000', i) //black
    }
    if (guess.indexOf(i) > -1) {//if char is right
      htmlAnswer += colorChar('7cfc00', i); //green
      guess = guess.replace(i, '');
      points++;
    } 
  }

  return { htmlAnswer, points }
}

function colorChar(color, char){
  return `<span style = "color:#${color};">${char}</span>`;
}

function resetRoom(room) {
  roomMap[room] = new Room()

  // io.in(room).clients((err, socketIds) => {
  //   if (err) throw err;
  //   socketIds.forEach(socketId => io.sockets.sockets[socketId].leave(room));
  // });
}

const port = 3045;
io.listen(port);
console.log('listening on port:', port);