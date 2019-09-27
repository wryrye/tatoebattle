const path = require('path');
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const port = process.env.PORT || 5000;
server.listen(port);
console.log(`React listening on port: ${port}`);

/** react **/
if (process.env.ECOSYSTEM = 'PRODUCTION') {
  const build = '/../client/build'
  app.use(express.static(path.join(__dirname, build)));
  app.get('*', (req, res) => { res.sendFile(path.join(__dirname + `${build}/index.html`))});
}

/** websockets **/
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
