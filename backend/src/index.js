/**
 * FinControl - Servidor da API
 * Banco: MySQL (configure .env)
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDb } = require('./db/init.js');
const routes = require('./routes/index.js');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'FinControl API', health: '/api/health' });
});

app.use('/api', routes);

async function start() {
  try {
    await initDb();
  } catch (err) {
    console.error('[FinControl] Erro ao conectar no MySQL:', err.message);
    console.error('Verifique o arquivo .env e se o MySQL está rodando. Veja MYSQL-SETUP.md');
    process.exit(1);
  }
  app.listen(PORT, () => {
    console.log(`FinControl API rodando em http://localhost:${PORT}`);
  });
}

start();
