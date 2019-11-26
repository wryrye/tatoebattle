const red = "\x1b[31m"
const green = "\x1b[32m";
const magenta = "\x1b[35m";
const cyan = "\x1b[36m";

const Game = require('./Game.js');
const Postgres = require('./Postgres.js');

module.exports = function (io, socket, lang) {

    let currentRoom = null;

    (() => {
        for (let [room, info] of Object.entries(Game.roomMap)) {
            if (info.occupancy < 2 && (info.lang == null || info.lang == lang)) {
                info.lang = lang;
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

        currentRoom = room;

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

    // evaluate guess
    socket.on('submit-guess', function (data) {
        const { room, player, guess } = data;
        const roomInfo = Game.roomMap[room];
        const roundInfo = roomInfo.round;
        const isFirst = roundInfo.first === null;
        const isP1 = player === 1;

        let { htmlAnswer, points } = Game.testGuess(roundInfo.answer, guess, roomInfo.lang)
        roundInfo.score += isP1 ? points : -points;

        // first gets prelim results
        if (isFirst) {
            roundInfo.first = player
            roundInfo.score += isP1 ? 1 : -1;
            const score = roomInfo.score + roundInfo.score;
            socket.emit('prelim', { answer: htmlAnswer, score });
        } else {
            let winner = null;
            if (roundInfo.score > 0) {
                winner = 1;
            } else if (roundInfo.score < 0) {
                winner = 2;
            }

            const score = roomInfo.score += roundInfo.score;

            // both get final results
            if (-10 < score && score < 10) {
                console.log('Score: ' + score)
                io.to(room).emit('final', { answer: htmlAnswer, score, winner });
                Game.resetRound(room)
            } else { // winning score has been reached, game over!
                const winner = score >= 10 ? 1 : 2;
                const winnerInfo = roomInfo.players[winner - 1];

                const loser = score >= 10 ? 2 : 1;
                const loserInfo = roomInfo.players[loser - 1];

                console.log(cyan, `Player ${winnerInfo.uname} has won!`)
                io.to(room).emit('game-over', { answer: htmlAnswer, score, winner });
                Game.resetRoom(room);

                const matchQuery = `INSERT INTO score_history (user_id, win, score) VALUES 
                ('${winnerInfo.uname}', B'1', ${Math.floor(Math.random() * 100)}),
                ('${loserInfo.uname}', B'0', ${Math.floor(Math.random() * 100)});`;

                Postgres.query(matchQuery)
            }
        }
    });

    socket.on('disconnect', (socket) => {
        console.log(red, `Client ${socket.id} has disconnected`)
        Game.disconnect(io, currentRoom);
    });
}
