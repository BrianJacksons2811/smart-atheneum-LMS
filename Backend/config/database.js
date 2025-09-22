const mysql = require('mysql2/promise');
const pool = mysql.createPool({
  host: process.env.DB_HOST, user: process.env.DB_USER,
  password: process.env.DB_PASS, database: process.env.DB_NAME,
  waitForConnections: true, connectionLimit: 10, namedPlaceholders: true
});
module.exports = pool;

// Make sure you have a .env file with DB_HOST, DB_USER, DB_PASS, DB_NAME
