const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.ONLINE_DB_USERNAME,
    host: process.env.ONLINE_DB_HOST,
    database: process.env.ONLINE_DB_NAME,
    password: process.env.ONLINE_DB_PASSWORD,
    port: process.env.ONLINE_DB_PORT,
    connectionString: process.env.POSTGRES_URL
  });
  

module.exports = pool;