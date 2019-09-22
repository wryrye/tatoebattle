// websocket server
const io = require('socket.io')();
var randoMode = require('./src/Rando.js');
var companyMode = require('./src/Company.js');

io.on('connection', function (socket) {
  socket.on('request-join', (mode) => {
    switch (mode) {
      case 'rando':
        randoMode(this, socket);
        break;
      case 'google':
        companyMode(this, socket, mode);
        break;
      case 'baidu':
        companyMode(this, socket, mode);
        break;
    }
  });
});

const port = 3045;
io.listen(port);
console.log('listening on port:', port);