/**
 * Pool de conexões MySQL (mysql2/promise)
 */

const mysql = require('mysql2/promise');
const { config } = require('./config.js');

const pool = mysql.createPool({
  ...config,
});

module.exports = { pool };
