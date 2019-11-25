const red = "\x1b[31m"
const green = "\x1b[32m";
const magenta = "\x1b[35m";
const cyan = "\x1b[36m";

const Game = require('./Game.js');

module.exports = function (io, socket, company, lang) {

    let currentRoom = null;

    (() => {
        for (let [room, info] of Object.entries(Game.roomMap)) {
            if (info.occupancy === 0) {
                socket.join(room);
                console.log(green, `Client ${socket.id} has joined ${room}`)
                console.log(green, `Client ${company} has joined ${room}`)
                socket.emit('accept-join', { room: room, player: 1 });
                info.occupancy = 2;
                info.lang = lang;
                return;
            }
        }
        // @unhandled
        socket.emit('full');
    })();


    // start game when both players ready
    socket.on('ready-start', (data) => {
        const { room, player } = data;
        const roomInfo = Game.roomMap[room];

        currentRoom = room;

        console.log(green, `Client ${socket.id} in ${room} is ready`)
        console.log(green, `Client ${company} in ${room} is ready`)
        roomInfo.players.push(player);
        roomInfo.players.push({
            'uname': company,
            'master': company,
            'socket': null,
            'player': 2,
        });

        if (roomInfo.players.length >= 2) {
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

    // evaluate guess
    socket.on('submit-guess', async function (data) {
        const { room, player, guess } = data;
        const roomInfo = Game.roomMap[room];
        const roundInfo = roomInfo.round;

        let { htmlAnswer, points } = Game.testGuess(roundInfo.answer, guess, roomInfo.lang)
        roundInfo.score += points + 1;

        let score = roomInfo.score + roundInfo.score;

        // player gets prelim results
        socket.emit('prelim', { answer: htmlAnswer, score });

        // company guess
        const timeStart = process.hrtime()

        let companyTranslate;
        switch(company) {
            case('google'):
                companyTranslate = googleTranslate;
                break;
            case('baidu'):
                companyTranslate = baiduTranslate;
                break;
            case('spanishDict'):
                console.log("curiosity prevails!")
                companyTranslate = sdTranslate;
                break;
        }

        const companyGuess = await companyTranslate(roundInfo.question, roomInfo.lang);
        let { points: companyPoints } = Game.testGuess(roundInfo.answer, companyGuess, roomInfo.lang);
        roundInfo.score -= companyPoints;
        const elapsedTime = process.hrtime(timeStart)[0] * 1000;

        let remainingTime = 5000 - elapsedTime;
        remainingTime = remainingTime > 0 ? remainingTime : 0;

        sleep(remainingTime).then(() => {
            let winner = null;
            if (roundInfo.score > 0) {
                winner = 'P1';
            } else if (roundInfo.score < 0) {
                winner = 'P2';
            }

            const score = roomInfo.score += roundInfo.score;

            // then final results
            if (-10 < score && score < 10) {
                console.log('Score: ' + score)
                io.to(room).emit('final', { answer: htmlAnswer, score, winner });
                Game.resetRound(room)
            } else { // winning score has been reached, game over!
                const winner = score >= 10 ? 1 : 2;
                console.log(cyan, `Player ${winner} has won!`)
                io.to(room).emit('game-over', { answer: htmlAnswer, score, winner });
                Game.resetRoom(room);
            }
        })
    });

    socket.on('disconnect', (socket) => {
        console.log(red, `Client ${socket.id} has disconnected`)
        Game.disconnect(io, currentRoom);
    });
}

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms))
}

const isoCode3To1Map = {
    eng:'en',
    spa:'es',
    cmn:'zh'
}

// google
const { Translate: Google } = require('@google-cloud/translate');
const google = new Google({ projectId: 'tatoebattle'});

async function googleTranslate(text, lang3) {
    const [translation] = await google.translate(text, isoCode3To1Map[lang3]);
    return translation;
}

// baidu
const baidu = require("baidu-translate-api");

async function baiduTranslate(text, lang3) {
    const {trans_result:{dst: translation}} = await baidu(text, {from: 'en', to: isoCode3To1Map[lang3]})
    return translation;
}

// spanishDict
const axios = require('axios');

async function sdTranslate(text, lang3) {
    const response = await axios.get(`http://translate1.spanishdict.com/dictionary/translation_prompt?lang_from=en&trtext=${text}`);
    return response.data.results;
}