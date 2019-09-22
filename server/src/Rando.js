const red = "\x1b[31m"
const green = "\x1b[32m";
const magenta = "\x1b[35m";
const cyan = "\x1b[36m";

const Game = require('./Game.js');

module.exports = function (io, socket) {

    (() => {
        for (let [room, info] of Object.entries(Game.roomMap)) {
            if (info.occupancy < 2) {
                socket.join(room);
                console.log(green, `Client ${socket.id} has joined ${room}`)
                socket.emit('accept-join', { room: room, player: ++info.occupancy });
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

        console.log(green, `Client ${socket.id} in ${room} is ready`)
        roomInfo.players.push(player);

        if (roomInfo.players.length >= 2) {
            console.log(green, `Starting game in ${room}...`);
            Game.startGame(io, room)
        }
    });

    // next round when both players ready
    socket.on('ready-next', function (room) {
        const roomInfo = Game.roomMap[room];

        if (++roomInfo.round.submissions == 2) {
            Game.nextRound(io, room)
        }
    });

    // evaluate submission
    socket.on('submit-guess', function (data) {
        const { room, player, guess } = data;
        const roomInfo = Game.roomMap[room];
        const isFirst = roomInfo.round.first === null;
        const isP1 = player === 1;

        let { htmlAnswer, points } = Game.testGuess(roomInfo.answer, guess)
        points = isP1 ? points : -points;

        roomInfo.score += points;
        const score = roomInfo.score;

        // first gets prelim results
        if (isFirst) {
            roomInfo.round.first = player
            socket.emit('prelim', { 'sent': htmlAnswer, score });
        } else {
            console.log('Score: ' + score)

            // both get final results
            if (-10 < score && score < 10) {
                io.to(room).emit('final', { 'sent': htmlAnswer, score });
                roomInfo.round.first = null
            } else { // winning score has been reached, game over!
                const winner = score >= 10 ? 1 : 2;
                console.log(cyan, `Player ${winner} has won!`)
                io.to(room).emit('game-over', { 'sent': htmlAnswer, score, winner });
                Game.resetRoom(room);
            }
        }
    });

    socket.on('disconnect', function (socket) {
        console.log(red, `Someone has disconnected`)
    });
}

