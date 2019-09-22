const red = "\x1b[31m"
const green = "\x1b[32m";
const magenta = "\x1b[35m";
const cyan = "\x1b[36m";

const Game = require('./Game.js');

module.exports = function (io, socket) {

    (() => {
        for (let [room, info] of Object.entries(Game.roomMap)) {
            if (info.occupancy === 0) {
                socket.join(room);
                console.log(green, `Client Google has joined ${room}`)
                console.log(green, `Client ${socket.id} has joined ${room}`)
                socket.emit('accept-join', { room: room, player: info.occupancy = 2 });
                return;
            }
        }
        // @unhandled
        socket.emit('full');
    })();


    // start game when both players ready
    socket.on('ready-start', function (data) {
        const { room, player } = data;
        const roomInfo = Game.roomMap[room];

        console.log(green, `Client Google in ${room} is ready`)
        console.log(green, `Client ${socket.id} in ${room} is ready`)
        roomInfo.players.push({
            'uname': "Google",
            'master': "google2",
            'socket': null,
            'player': 1,
            'test': "ugh"
        });
        roomInfo.players.push(player);

        if (roomInfo.players.length >= 1) {
            console.log(green, `Starting game in ${room}...`);
            Game.startGame(io, room)
        }
    });

    // next round when both players ready
    socket.on('ready-next', function (room) {
        const roomInfo = Game.roomMap[room];

        if (++roomInfo.round.submissions == 1) {
            Game.nextRound(io, room)
        }
    });

    // evaluate submission
    socket.on('submit-guess', async function (data) {
        const { room, player, guess } = data;
        const roomInfo = Game.roomMap[room];

        let { htmlAnswer, points } = Game.testGuess(roomInfo.answer, guess)

        const [googleGuess] = await translate.translate(roomInfo.question, 'zh');
        let { points: googlePoints } = Game.testGuess(roomInfo.answer, googleGuess);

        roomInfo.score += googlePoints - points;
        const score = roomInfo.score;

        // player gets prelim results
        roomInfo.round.first = player
        socket.emit('prelim', { 'sent': htmlAnswer, score });

        sleep(4000).then(() => {
            console.log('Score: ' + score)

            // then final results
            if (-10 < score && score < 10) {
                io.to(room).emit('final', { 'sent': htmlAnswer, score });
                roomInfo.round.first = null
            } else { // winning score has been reached, game over!
                const winner = score >= 10 ? 1 : 2;
                console.log(cyan, `Player ${winner} has won!`)
                io.to(room).emit('game-over', { 'sent': htmlAnswer, score, winner });
                Game.resetRoom(room);
            }
        })
    });

    socket.on('disconnect', function (socket) {
        console.log(red, `Someone has disconnected`)
    });
}

const { Translate } = require('@google-cloud/translate');
const projectId = 'tatoebattle'
const translate = new Translate({ projectId });

async function googleTranslate() {
    const [translation] = await translate.translate(text, 'zh');
    return translation;
}

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms))
}
