// var redis = require("redis"),
// redis_client = redis.createClient(process.env.REDIS_URL);

// rand_start = parseInt(Math.random() *20000)
// redis_client.lrange(rand_start++,0,3, (err, data)=>{
//   if(err){
//     throw err;
//   }
//   console.log(data);
// });

const io = require('socket.io')();

function resetLobby(lobby){
  lobbies[lobby] = {
    'count':0,
    'ready':0,
    'players':[],
    'currSent':"",
    'score':0,
    'first':null
  };
}

lobbies = {
  '北京':{
    'count':0,
    'ready':0,
    'players':[],
    'currSent':"",
    'score':0,
    'first':null
  },
  '香港':{
    'count':0,
    'ready':0,
    'players':[],
    'currSent':"",
    'score':0,
    'first':null
  },
  '苏州': {
    'count':0,
    'ready':0,
    'players':[],
    'currSent':"",
    'score':0,
    'first':null
  },
}

clients = {}

io.on('connection', function(socket){

  /**  share lobby info with clients **/
  socket.on('lobby-info', function(){
    socket.emit('lobby-info', lobbies);
  });

  /** let two players into lobby **/
  socket.on('request-join', function(lobby){
    if(lobbies[lobby].count++ < 2){
      console.log("\x1b[35m", "LOG: " + "a player has joined " + lobby)
      // lobbies[lobby].count++;
      socket.emit('accept-join', {'room':lobby, 'player': lobbies[lobby].count});
    }
  });

  /** when both ready, start game **/
  socket.on('ready-start', function(req){
    console.log("\x1b[35m", "LOG: " + "client " + socket.id + " is ready")
    console.log(JSON.stringify(req))
    lobbies[req.lobby].players.push(req.player);
    if(lobbies[req.lobby].players.length == 2){
      console.log("LOG: " + "start game")
      startGame(req.lobby)

      /** end game if either player stops responding to heartbeat **/
      var heartbeat = setInterval(function ping() {
        lobbies[req.lobby].players.forEach(function each(player) {
          if(!io.sockets.connected[player.socket]){
              io.emit(req.lobby, {'op':5});
              resetLobby(req.lobby);
              clearInterval(heartbeat);
          }
        });
      }, 15000);

    }
  });

  /** share players' information with eachother **/
  function startGame(lobby){
    io.emit(lobby, {'op':4, 'players':lobbies[lobby].players});
    nextRound(lobby);
  }

  socket.on('ready-next', function(lobby){
    if(++lobbies[lobby].ready == 2){
      console.log("LOG: " + "next round")
      lobbies[lobby].ready = 0
      nextRound(lobby)
    }
  });

  /** each round provides a new sentence **/
  function nextRound(lobby){
    redis_client.lrange(rand_start++,0,3, (err, data)=>{
      if(err){throw err;}
      lobbies[lobby].currSent = data[1];
      io.emit(lobby, {'op':0, 'sent':data[2]});
    });
  }

  /** listen for guess from client **/
  socket.on('submit-guess', function(obj){ //user submits guess
    result = testGuess(lobbies[obj.lobby].currSent, obj.guess)
    if(lobbies[obj.lobby].first == null){ // first user to answer gets preliminary results
      is_p1 = obj.player == 1;
      prev_score = lobbies[obj.lobby].score
      points =  is_p1 ? result.points :  -result.points;
      lobbies[obj.lobby].score+=points;
      lobbies[obj.lobby].first = points
      socket.emit(obj.lobby, {'op':1, 'sent':result.sent, 'points':points});
    }else{
      is_p1 = obj.player == 1;
      prev_score = lobbies[obj.lobby].score;
      points =  is_p1 ? result.points :  -result.points;
      lobbies[obj.lobby].score+=points;
      score = lobbies[obj.lobby].score;
      // console.log(score)
      if (score >= 10 || score <= -10){ //if a winning score has been reached, game over!
        winner = score >= 10 ? 1 : 2;
        io.emit(obj.lobby, {'op':3, 'sent':result.sent, 'points':points+lobbies[obj.lobby].first, "winner":winner});
        resetLobby(obj.lobby);
      }else{ //both players get final results
        io.emit(obj.lobby, {'op':2, 'sent':result.sent, 'points':points+lobbies[obj.lobby].first});
        lobbies[obj.lobby].first = null
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
  return {"sent":resultString, "points": points}
}


const port = 3045;
io.listen(port);
console.log('listening on port:', port);