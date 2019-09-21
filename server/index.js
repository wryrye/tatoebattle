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
      sentence: null,
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

function resetRoom(room) {
  roomMap[room] = new Room()
}

const red = "\x1b[31m"
const green = "\x1b[32m";
const magenta = "\x1b[35m";
const cyan = "\x1b[36m";

io.on('connection', function (socket) {

  // find open room
  socket.on('request-join', () => {
    for (let [room, info] of Object.entries(roomMap)) {
      if (info.occupancy < 2) {
        console.log(green, `Client ${socket.id} has joined ${room}`)
        socket.emit('accept-join', { room: room, player: ++info.occupancy });
        return;
      }
    }
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
  socket.on('submit-guess', function (obj) { //user submits guess
    result = testGuess(roomMap[obj.room].currSent, obj.guess)
    if (roomMap[obj.room].first == null) { // first user to answer gets preliminary results
      is_p1 = obj.player == 1;
      prev_score = roomMap[obj.room].score
      points = is_p1 ? result.points : -result.points;
      roomMap[obj.room].score += points;
      roomMap[obj.room].first = points
      socket.emit(obj.room, { 'op': 1, 'sent': result.sent, 'points': points });
    } else {
      is_p1 = obj.player == 1;
      prev_score = roomMap[obj.room].score;
      points = is_p1 ? result.points : -result.points;
      roomMap[obj.room].score += points;
      score = roomMap[obj.room].score;
      // console.log(score)
      if (score >= 10 || score <= -10) { //if a winning score has been reached, game over!
        winner = score >= 10 ? 1 : 2;
        console.log(cyan, `Player ${winner} has won!`)
        io.emit(obj.room, { 'op': 3, 'sent': result.sent, 'points': points + roomMap[obj.room].first, "winner": winner });
        resetRoom(obj.room);
      } else { //both players get final results
        io.emit(obj.room, { 'op': 2, 'sent': result.sent, 'points': points + roomMap[obj.room].first });
        roomMap[obj.room].first = null
      }
    }
  });

  socket.on('disconnect', function (socket) {
    console.log(red, `Player has left`)
  });
});

function startGame(room) {
  io.emit(room, { 'op': 4, 'players': roomMap[room].players });
  nextRound(room);

  // end game if no heartbeat
  let heartbeat = setInterval(function ping() {
    roomMap[room].players.forEach((player) => {
      if (!io.sockets.connected[player.socket]) {
        io.emit(data.room, { 'op': 5 });
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
    roomMap[room].currSent = trans.zhSent;
    io.emit(room, { 'op': 0, 'sent': trans.enSent });
  })
}

function testGuess(actual, guess) {
  var points = 0;
  var punct = "“”！。？，\\\"";
  var resultString = '';
  for (var i of actual) {
    if (punct.indexOf(i) > -1) {//if a char is punctuation
      resultString += '<span style = "color:#000000;">' + i + '</span>'; //black
      continue;
    }
    if (guess.indexOf(i) > -1) {//if char is right
      points++;
      guess = guess.replace(i, '');
      resultString += '<span style = "color:#7cfc00;">' + i + '</span>'; //green
    } else {//if char is wrong
      resultString += '<span style = "color:#000000;">' + i + '</span>'; //black
    }
  }
  return { "sent": resultString, "points": points }
}

const port = 3045;
io.listen(port);
console.log('listening on port:', port);