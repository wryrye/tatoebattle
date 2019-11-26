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
    resetRound,
    disconnect
}

// helper functions
function startGame(io, room) {
    io.to(room).emit('start-game', { 'players': roomMap[room].players });
    nextRound(io, room);

    // end game if no heartbeat
    // let heartbeat = setInterval(function ping() {
    //     roomMap[room].players.forEach((player) => {
    //         if (player.uname === "google" ||
    //             player.uname === "baidu") return;
    //         if (!io.connected[player.socket]) {
    //             clearInterval(heartbeat);
    //             disconnect(room);
    //         }
    //     });
    // }, 15000);
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
    const engPunc = ',.?！;:"“”'
    const cmnPunc = '， 。？！；：《》'
    const spaPunc = '¿¡'
    const punctuation = engPunc + cmnPunc + spaPunc;

    let htmlAnswer = '';
    let points = 0;

    console.log("Guess: " + guess)
    console.log("Answer: " + answer)

    switch (lang) {
        case 'cmn': {
            for (let char of answer) {
                // punctuation
                if (punctuation.indexOf(char) != -1) {
                    htmlAnswer += colorChar('000000', char) // black
                    continue;
                }
                // incorrect 
                if (guess.indexOf(char) == -1) {
                    htmlAnswer += colorChar('ff0000', char) // red
                    continue;
                }
                // correct
                htmlAnswer += colorChar('7cfc00', char); // green
                guess = guess.replace(char, '');
                points++;
            }
            break;
        }
        case 'spa': {
            const regExp = new RegExp(`([${punctuation}\\s])`);

            const normGuess = guess.normalize('NFD')
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase()
                .split(regExp);

            const normAnswer = answer.normalize('NFD')
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase()
                .split(regExp);

            const origAnswer = answer.split(regExp);
            htmlAnswer = []

            for (let x = 0; x < normAnswer.length; x++) {
                const normWord = normAnswer[x];
                const origWord = origAnswer[x];

                let index = null;

                // punctuation
                if ((index = punctuation.indexOf(normWord) != -1)) {
                    htmlAnswer.push(colorChar('000000', origWord)) // black
                    continue;
                }
                // incorrect
                if ((index = normGuess.indexOf(normWord) == -1)) {
                    htmlAnswer.push(colorChar('ff0000', origWord)); // red
                    continue;
                }
                // correct
                htmlAnswer.push(colorChar('7cfc00', origWord)); // green
                normGuess.splice(index,1)
                points++;
            }

            htmlAnswer = htmlAnswer.join('');
            break;
        }
    }

    return { htmlAnswer, points }
}

function colorChar(color, char) {
    return `<span style = "color:#${color};">${char}</span>`;
}

function disconnect(io, room) {
    console.log(`Disconnecting ${room}...`)
    io.to(room).emit('disconnect');
    resetRoom(room);
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