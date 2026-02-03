/**
 * Configuração da conexão MySQL (FinControl)
 * Use variáveis de ambiente: .env ou export no terminal
 */

require('dotenv').config();

const config = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '3306', 10),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'fincontrol',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

module.exports = { config };
