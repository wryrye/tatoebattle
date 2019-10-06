module.exports = { getTrans }


const redis = require("redis");
const client = redis.createClient(process.env.REDIS_URL);

let langRange = null;

let interval = setInterval(() => {
  client.get('lang_range', function (err, lang_range) {
    if (err) throw err;

    if (lang_range === null) return;

    langRange = JSON.parse(lang_range.replace(/'/g, '"'));

    clearInterval(interval)
  });
}, 3000);

function getTrans(lang) {
  return new Promise(resolve => {
    index = getRandomInt(...langRange[lang]);

    client.lrange(index, 0, 2, (err, data) => {
      if (err) { throw err; }
      resolve({ zhSent: data[1], enSent: data[0] });
    });
  });
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}