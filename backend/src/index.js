/**
 * FinControl - Servidor da API
 * Fase 0/1: ponto de entrada. Complete conforme o GUIA-DESENVOLVIMENTO.md
 */

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Rota de saúde (Fase 1)
app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'FinControl API' });
});

app.listen(PORT, () => {
  console.log(`FinControl API rodando em http://localhost:${PORT}`);
});
