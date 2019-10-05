module.exports = { getTrans }


const redis = require("redis");
const client = redis.createClient(process.env.REDIS_URL);
let index = null;

let interval = setInterval(() => {
  client.get('lang_range', function (err, langRange) {
    if (err) throw err;

    if (langRange === null) return;

    langRange = langRange.replace(/'/g, '"');
    langRange = JSON.parse(langRange);

    index = getRandomInt(...langRange['cmn']);

    clearInterval(interval)
  });
}, 3000);

function getTrans() {
  return new Promise(resolve => {
    client.lrange(index++, 0, 2, (err, data) => {
      if (err) { throw err; }
      console.log(`LOOK@ME: ${data}`)
      resolve({ zhSent: data[1], enSent: data[0] });
    });
  });
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}