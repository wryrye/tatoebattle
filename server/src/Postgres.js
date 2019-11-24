
const { Pool, Client } = require('pg')
const connectionString = process.env.DATABASE_URL;
const auth = process.env.ECOSYSTEM === 'HEROKU' ? {ssl: true} : {}

const pool = new Pool({
  connectionString: connectionString,
  ...auth
})

module.exports = {
  query: (text, params) => pool.query(text, params),
}

// async function testSQL(){
//   const res = await pool.query('SELECT NOW()')

//   return res;
// }
