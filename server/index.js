require('newrelic');
const path = require('path');
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const Postgres = require('./src/Postgres.js');

const port = process.env.PORT || 5000;
server.listen(port);
console.log(`Server listening on port: ${port}`);

const rankQuery = `SELECT 
user_id,
RANK () OVER (ORDER BY total_wins DESC) AS rank,
total_wins,
total_score
FROM (
SELECT 
    user_id,
    SUM(CAST(win AS INT)) as total_wins,
    SUM(score) as total_score
FROM 
    score_history
GROUP BY user_id
ORDER BY user_id ASC
) as myTableAlias
ORDER BY rank;`


app.get('/lb', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { rows } = await Postgres.query(rankQuery)
  res.send(rows);
})

/** heroku **/
if (process.env.ECOSYSTEM === 'HEROKU') {
  const build = '/../client/build'
  app.use(express.static(path.join(__dirname, build)));
  app.get('*', (req, res) => { res.sendFile(path.join(__dirname + `${build}/index.html`)) });

  const fs = require('fs');
  const jsonPath = '/tmp/google-credentials.json'
  fs.writeFile(jsonPath, process.env.GOOGLE_CREDENTIALS_JSON, (err) => {
    if (err) throw err;
    process.env.GOOGLE_APPLICATION_CREDENTIALS = jsonPath
    console.log('Google credentials written to file!');
  });
}

/** websockets **/
var randoMode = require('./src/Rando.js');
var companyMode = require('./src/Company.js');

io.on('connection', function (socket) {
  socket.on('request-join', (mode, lang) => {
    switch (mode) {
      case 'rando':
        randoMode(this, socket, lang);
        break;
      case 'google':
        companyMode(this, socket, mode, lang);
        break;
      case 'baidu':
        companyMode(this, socket, mode, lang);
        break;
      case 'spanishDict':
        companyMode(this, socket, mode, lang);
        break;
    }
  });
});
