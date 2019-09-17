// redis server
var redis = require("redis"),
redis_client = redis.createClient(process.env.REDIS_URL);

rand_start = parseInt(Math.random() *20000)
redis_client.lrange(rand_start++,0,3, (err, data)=>{
  if(err){
    throw err;
  }
  console.log(data);
});

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
const roomList = ['北京', '香港', '苏州', '苏州']
roomList.forEach((name) => {
  roomMap[name] = new Room();
});

function resetRoom(room) {
  roomList[room] = new Room(room)
}

const red = "\x1b[31m"
const green = "\x1b[32m";
const magenta = "\x1b[35m";

io.on('connection', function (socket) {

  // find open room
  socket.on('request-join', () => {
    for (let [room, info] of Object.entries(roomMap)){
      if (info.occupancy < 2) {
        console.log(green, `Client ${socket.id} has joined ${room}`)
        socket.emit('accept-join', {room: room, player: ++info.occupancy}); 
        return;
      }
    }
    
    socket.emit('full');
  });

  // start game when both players ready
  socket.on('ready-start', function (data) {
    const { room, player} = data;

    console.log(green, `Client ${socket.id} in ${room} is ready`)

    roomMap[room].players.push(player);

    if (roomMap[room].players.length >= 2) {
      console.log(green, `Starting game in ${room}...`);
      startGame(room)

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
  });

  /** share players' information with eachother **/
  function startGame(room) {
    io.emit(room, { 'op': 4, 'players': roomList[room].players });
    nextRound(room);
  }

  socket.on('ready-next', function (room) {
    if (++roomList[room].ready == 2) {
      console.log(magenta, "Next round...")
      roomList[room].ready = 0
      nextRound(room)
    }
  });

  /** each round provides a new sentence **/
  function nextRound(room) {
    redis_client.lrange(rand_start++, 0, 3, (err, data) => {
      if (err) { throw err; }
      roomList[room].currSent = data[1];
      io.emit(room, { 'op': 0, 'sent': data[2] });
    });
  }

  /** listen for guess from client **/
  socket.on('submit-guess', function (obj) { //user submits guess
    result = testGuess(roomList[obj.room].currSent, obj.guess)
    if (roomList[obj.room].first == null) { // first user to answer gets preliminary results
      is_p1 = obj.player == 1;
      prev_score = roomList[obj.room].score
      points = is_p1 ? result.points : -result.points;
      roomList[obj.room].score += points;
      roomList[obj.room].first = points
      socket.emit(obj.room, { 'op': 1, 'sent': result.sent, 'points': points });
    } else {
      is_p1 = obj.player == 1;
      prev_score = roomList[obj.room].score;
      points = is_p1 ? result.points : -result.points;
      roomList[obj.room].score += points;
      score = roomList[obj.room].score;
      // console.log(score)
      if (score >= 10 || score <= -10) { //if a winning score has been reached, game over!
        winner = score >= 10 ? 1 : 2;
        io.emit(obj.room, { 'op': 3, 'sent': result.sent, 'points': points + roomList[obj.room].first, "winner": winner });
        resetRoom(obj.room);
      } else { //both players get final results
        io.emit(obj.room, { 'op': 2, 'sent': result.sent, 'points': points + roomList[obj.room].first });
        roomList[obj.room].first = null
      }

    }
  });

  socket.on('disconnect', function (socket) {
    console.log(red, "Someone left!")
  });
});

/** returns color-coded html string to display correctness of guess **/
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