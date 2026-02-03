/**
 * Cria o banco de dados e as tabelas do FinControl (MySQL).
 * Execute uma vez ao configurar o projeto ou ao subir o servidor.
 */

const mysql = require('mysql2/promise');
const { config } = require('./config.js');
const { pool } = require('./connection.js');

const DB_NAME = config.database;

async function initDb() {
  // Conecta sem database para criar o banco se não existir
  const conn = await mysql.createConnection({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
  });

  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await conn.end();

  // Cria as tabelas
  await pool.query(`
    CREATE TABLE IF NOT EXISTS saldo_inicial (
      id INT AUTO_INCREMENT PRIMARY KEY,
      valor DECIMAL(12,2) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS produtos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nome VARCHAR(255) NOT NULL,
      custo DECIMAL(12,2) NOT NULL,
      valor_sugerido DECIMAL(12,2),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS vendas (
      id INT AUTO_INCREMENT PRIMARY KEY,
      produto_id INT NOT NULL,
      valor_bruto DECIMAL(12,2) NOT NULL,
      taxa_percentual DECIMAL(5,2) DEFAULT 12.99,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (produto_id) REFERENCES produtos(id)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS despesas (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nome VARCHAR(255) NOT NULL,
      motivo VARCHAR(255),
      valor DECIMAL(12,2) NOT NULL,
      data DATE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS metas (
      id INT AUTO_INCREMENT PRIMARY KEY,
      descricao VARCHAR(255) NOT NULL,
      valor_alvo DECIMAL(12,2) NOT NULL,
      periodo ENUM('mensal','anual') DEFAULT 'mensal',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('[FinControl] Banco e tabelas MySQL prontos.');
}

module.exports = { initDb };
