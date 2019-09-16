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

function resetRoom(room) {
  rooms[room] = {
    'count': 0,
    'ready': 0,
    'players': [],
    'currSent': "",
    'score': 0,
    'first': null
  };
}

var rooms = {
  '北京': {
    'count': 0,
    'ready': 0,
    'players': [],
    'currSent': "",
    'score': 0,
    'first': null
  },
  '香港': {
    'count': 0,
    'ready': 0,
    'players': [],
    'currSent': "",
    'score': 0,
    'first': null
  },
  '苏州': {
    'count': 0,
    'ready': 0,
    'players': [],
    'currSent': "",
    'score': 0,
    'first': null
  },
}

clients = {}

io.on('connection', function (socket) {

  /**  share lobby info with clients **/
  socket.on('lobby-info', function () {
    socket.emit('lobby-info', rooms);
  });

  /** let two players into a room **/
  socket.on('request-join', function (room) {
    if (rooms[room].count++ < 2) {
      console.log("\x1b[35m", "LOG: " + "a player has joined " + room)
      socket.emit('accept-join', { 'room': room, 'player': rooms[room].count });
    }
  });

  /** when both ready, start game **/
  socket.on('ready-start', function (data) {
    console.log("\x1b[35m", "LOG: " + "Client " + socket.id + " is ready")
    console.log(JSON.stringify(data))

    rooms[data.room].players.push(data.player);
    if (rooms[data.room].players.length == 2) {
      console.log("LOG: " + "Starting game...")
      startGame(data.room)

      /** end game if either player stops responding to heartbeat **/
      var heartbeat = setInterval(function ping() {
        rooms[data.room].players.forEach(function each(player) {
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
    io.emit(room, { 'op': 4, 'players': rooms[room].players });
    nextRound(room);
  }

  socket.on('ready-next', function (room) {
    if (++rooms[room].ready == 2) {
      console.log("LOG: " + "next round")
      rooms[room].ready = 0
      nextRound(room)
    }
  });

  /** each round provides a new sentence **/
  function nextRound(room) {
    redis_client.lrange(rand_start++, 0, 3, (err, data) => {
      if (err) { throw err; }
      rooms[room].currSent = data[1];
      io.emit(room, { 'op': 0, 'sent': data[2] });
    });
  }

  /** listen for guess from client **/
  socket.on('submit-guess', function (obj) { //user submits guess
    result = testGuess(rooms[obj.room].currSent, obj.guess)
    if (rooms[obj.room].first == null) { // first user to answer gets preliminary results
      is_p1 = obj.player == 1;
      prev_score = rooms[obj.room].score
      points = is_p1 ? result.points : -result.points;
      rooms[obj.room].score += points;
      rooms[obj.room].first = points
      socket.emit(obj.room, { 'op': 1, 'sent': result.sent, 'points': points });
    } else {
      is_p1 = obj.player == 1;
      prev_score = rooms[obj.room].score;
      points = is_p1 ? result.points : -result.points;
      rooms[obj.room].score += points;
      score = rooms[obj.room].score;
      // console.log(score)
      if (score >= 10 || score <= -10) { //if a winning score has been reached, game over!
        winner = score >= 10 ? 1 : 2;
        io.emit(obj.room, { 'op': 3, 'sent': result.sent, 'points': points + rooms[obj.room].first, "winner": winner });
        resetRoom(obj.room);
      } else { //both players get final results
        io.emit(obj.room, { 'op': 2, 'sent': result.sent, 'points': points + rooms[obj.room].first });
        rooms[obj.room].first = null
      }

    }
  });

  socket.on('disconnect', function (socket) {
    console.log("Someone left!")
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