module.exports = {
    getTrans,

}

// redis server
let redis = require("redis"),
  redisClient = redis.createClient(process.env.REDIS_URL),
  redisIndex = parseInt(Math.random() * 20000);

function getTrans() {
  return new Promise(resolve => {
    redisClient.lrange(redisIndex++, 0, 3, (err, data) => {
      if (err) { throw err; }
      resolve({ zhSent: data[1], enSent: data[2] });
    });
  });
}