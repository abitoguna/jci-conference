const { Pool } = require('pg');
require('dotenv').config();

// let connection = mysql.createConnection({
//     port: process.env.DB_PORT,
//     host: process.env.ONLINE_DB_HOST,
//     user: process.env.ONLINE_DB_USERNAME,
//     password: process.env.ONLINE_DB_PASSWORD,
//     database: process.env.ONLINE_DB_NAME,
//     connectTimeout: 60000
// });

const pool = new Pool({
    user: process.env.ONLINE_DB_USERNAME,
    host: process.env.ONLINE_DB_HOST,
    database: process.env.ONLINE_DB_NAME,
    password: process.env.ONLINE_DB_PASSWORD,
    port: process.env.ONLINE_DB_PORT,
    connectionString: process.env.POSTGRES_URL
  });
  

module.exports = pool;