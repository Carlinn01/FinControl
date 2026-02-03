/**
 * Rotas: despesas
 * GET /api/despesas?periodo=semanal|mensal|anual|total
 * POST /api/despesas → nome, motivo?, valor, data (YYYY-MM-DD)
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../db/connection.js');
const { wherePeriodoDespesas } = require('../utils/periodo.js');

router.get('/', async (req, res) => {
  try {
    const periodo = req.query.periodo || 'total';
    const { sql: whereSql, params: whereParams } = wherePeriodoDespesas(periodo);

    const [rows] = await pool.query(
      `SELECT id, nome, motivo, valor, data, created_at FROM despesas WHERE 1=1 ${whereSql} ORDER BY data DESC, id DESC`,
      whereParams
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar despesas' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { nome, motivo, valor, data } = req.body;
    if (!nome || nome.trim() === '') {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }
    const valorNum = parseFloat(valor);
    if (valorNum == null || isNaN(valorNum) || valorNum < 0) {
      return res.status(400).json({ error: 'Valor inválido (número >= 0)' });
    }
    const dataStr = data || new Date().toISOString().slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dataStr)) {
      return res.status(400).json({ error: 'Data inválida (use YYYY-MM-DD)' });
    }

    const [result] = await pool.query(
      'INSERT INTO despesas (nome, motivo, valor, data) VALUES (?, ?, ?, ?)',
      [nome.trim(), (motivo || '').trim(), valorNum, dataStr]
    );
    res.status(201).json({
      id: result.insertId,
      nome: nome.trim(),
      motivo: (motivo || '').trim(),
      valor: valorNum,
      data: dataStr,
      message: 'Despesa cadastrada',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao cadastrar despesa' });
  }
});

module.exports = router;
