const Redis = require('./Redis.js');
const Colors = require('./Colors.js');

class Room {
    constructor() {
        this.occupancy = 0;
        this.players = [];
        this.lang = null
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

const roomList = ['Beijing', 'Hong Kong', 'Suzhou', 'Guilin']

roomList.forEach((name) => {
    roomMap[name] = new Room();
});

module.exports = {
    roomMap,
    startGame,
    nextRound,
    testGuess,
    resetRoom,
    resetRound
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

    Redis.getTrans(roomMap[room].lang).then(trans => {
        roomMap[room].round.answer = trans.zhSent;
        roomMap[room].round.question = trans.enSent;
        io.to(room).emit('next-round', { question: trans.enSent });
    })
}

function testGuess(answer, guess, lang) {
    const punctuation = ",.?！ 。？，\"“”";

    let htmlAnswer = '';
    let points = 0;

    switch (lang) {
        case 'cmn': {
            for (let char of answer) {
                // incorrect or punctuation
                if (guess.indexOf(char) == -1 || punctuation.indexOf(char) > -1) {
                    htmlAnswer += colorChar('000000', char) //black
                    continue;
                }
                // correct
                htmlAnswer += colorChar('7cfc00', char); //green
                guess = guess.replace(char, '');
                points++;
            }
        }
        case 'spa': {
            guess = guess.split(/([-,.\s])/);
            answer = answer.split(/([-,.\s])/);
            htmlAnswer = []

            console.log("guess: " + guess)
            console.log("answer: " + answer)

            answer.forEach(word => {
                const index = guess.indexOf(word)

                // incorrect
                if (index == -1 || punctuation.indexOf(word) > -1) {
                    htmlAnswer.push(colorChar('000000', word)); //black
                    return;
                }
                // correct
                htmlAnswer.push(colorChar('7cfc00', word)); //green
                guess.splice(index,1)
                points++;
            });

            htmlAnswer = htmlAnswer.join('');
        }
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

function resetRound(room) {
    roomMap[room].round = {
        answer: null,
        question: null,
        first: null,
        submissions: 0,
        score: 0
    }
}