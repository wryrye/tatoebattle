const Redis = require('./Redis.js');
const Colors = require('./Colors.js');

class Room {
    constructor() {
        this.occupancy = 0;
        this.players = [];
        this.score = 0;

        this.round = {
            answer: null,
            question: null,
            first: null,
            submissions: 0,
            score: 0
        }
    }
}

const roomMap = {}

const roomList = ['北京', '香港', '苏州', '桂林']

roomList.forEach((name) => {
    roomMap[name] = new Room();
});

module.exports = {
    roomMap,
    startGame,
    nextRound,
    testGuess,
    resetRoom
}

// helper functions
function startGame(io, room) {
    io.to(room).emit('start-game', { 'players': roomMap[room].players });
    nextRound(io, room);

    // end game if no heartbeat
    let heartbeat = setInterval(function ping() {
        roomMap[room].players.forEach((player) => {
            if (player.uname === "google" ||
                player.uname === "baidu") return;
            if (!io.connected[player.socket]) {
                io.to(room).emit('disconnect');
                resetRoom(room);
                clearInterval(heartbeat);
            }
        });
    }, 15000);
}

function nextRound(io, room) {
    console.log(Colors.magenta, "Next round...");
    roomMap[room].round.submissions = 0;

    Redis.getTrans().then(trans => {
        roomMap[room].answer = trans.zhSent;
        roomMap[room].question = trans.enSent;
        io.to(room).emit('next-round', { 'sent': trans.enSent });
    })
}

function testGuess(answer, guess) {
    const punctuation = "“”！。？，\\\"";

    let htmlAnswer = '';
    let points = 0;

    for (let i of answer) {
        // incorrect or punctuation
        if (guess.indexOf(i) == -1 || punctuation.indexOf(i) > -1) {
            htmlAnswer += colorChar('000000', i) //black
            continue;
        }
        // correct
        htmlAnswer += colorChar('7cfc00', i); //green
        guess = guess.replace(i, '');
        points++;
    }

    return { htmlAnswer, points }
}

function colorChar(color, char) {
    return `<span style = "color:#${color};">${char}</span>`;
}

function resetRoom(room) {
    roomMap[room] = new Room()

    // io.in(room).clients((err, socketIds) => {
    //   if (err) throw err;
    //   socketIds.forEach(socketId => io.sockets.sockets[socketId].leave(room));
    // });
}