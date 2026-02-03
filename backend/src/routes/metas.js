/**
 * Rotas: metas
 * GET /api/metas → lista
 * POST /api/metas → descricao, valor_alvo, periodo (mensal|anual)
 * GET /api/metas/:id/progresso → valor_atual (vendas no período), valor_alvo, percentual
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../db/connection.js');
const { wherePeriodoVendas } = require('../utils/periodo.js');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, descricao, valor_alvo, periodo, created_at FROM metas ORDER BY id DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar metas' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { descricao, valor_alvo, periodo } = req.body;
    if (!descricao || descricao.trim() === '') {
      return res.status(400).json({ error: 'Descrição é obrigatória' });
    }
    const valorAlvo = parseFloat(valor_alvo);
    if (valorAlvo == null || isNaN(valorAlvo) || valorAlvo < 0) {
      return res.status(400).json({ error: 'Valor alvo inválido (número >= 0)' });
    }
    const periodoSql = periodo === 'anual' ? 'anual' : 'mensal';

    const [result] = await pool.query(
      'INSERT INTO metas (descricao, valor_alvo, periodo) VALUES (?, ?, ?)',
      [descricao.trim(), valorAlvo, periodoSql]
    );
    res.status(201).json({
      id: result.insertId,
      descricao: descricao.trim(),
      valor_alvo: valorAlvo,
      periodo: periodoSql,
      message: 'Meta criada',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar meta' });
  }
});

// Progresso: valor atual = soma vendas no período da meta (mensal ou anual)
router.get('/:id/progresso', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

    const [metaRows] = await pool.query(
      'SELECT id, descricao, valor_alvo, periodo FROM metas WHERE id = ?',
      [id]
    );
    if (metaRows.length === 0) return res.status(404).json({ error: 'Meta não encontrada' });
    const meta = metaRows[0];
    const valorAlvo = Number(meta.valor_alvo);
    const periodoMeta = meta.periodo || 'mensal';

    const { sql: whereSql, params: whereParams } = wherePeriodoVendas(periodoMeta === 'anual' ? 'anual' : 'mensal');

    const [vendasRows] = await pool.query(
      `SELECT SUM(v.valor_bruto) AS total FROM vendas v WHERE 1=1 ${whereSql}`,
      whereParams
    );
    const valorAtual = Number(vendasRows[0]?.total || 0);
    const percentual = valorAlvo > 0 ? Math.min(100, (valorAtual / valorAlvo) * 100) : 0;
    const falta = Math.max(0, valorAlvo - valorAtual);

    res.json({
      meta_id: id,
      descricao: meta.descricao,
      valor_alvo: valorAlvo,
      valor_atual: Math.round(valorAtual * 100) / 100,
      percentual: Math.round(percentual * 100) / 100,
      falta: Math.round(falta * 100) / 100,
      periodo: periodoMeta,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao calcular progresso da meta' });
  }
});

module.exports = router;
