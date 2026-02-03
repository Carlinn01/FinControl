/**
 * Rotas: produtos
 * GET /api/produtos → lista
 * GET /api/produtos/:id → detalhe
 * POST /api/produtos → criar (valor_sugerido opcional, senão custo * 1.5)
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../db/connection.js');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, nome, custo, valor_sugerido, created_at FROM produtos ORDER BY nome'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar produtos' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });
    const [rows] = await pool.query(
      'SELECT id, nome, custo, valor_sugerido, created_at FROM produtos WHERE id = ?',
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar produto' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { nome, custo, valor_sugerido } = req.body;
    if (!nome || nome.trim() === '') {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }
    const custoNum = parseFloat(custo);
    if (custoNum == null || isNaN(custoNum) || custoNum < 0) {
      return res.status(400).json({ error: 'Custo inválido (número >= 0)' });
    }
    let valorSugerido = valor_sugerido != null ? parseFloat(valor_sugerido) : null;
    if (valorSugerido == null || isNaN(valorSugerido) || valorSugerido < 0) {
      valorSugerido = Math.round(custoNum * 1.5 * 100) / 100;
    }
    const [result] = await pool.query(
      'INSERT INTO produtos (nome, custo, valor_sugerido) VALUES (?, ?, ?)',
      [nome.trim(), custoNum, valorSugerido]
    );
    res.status(201).json({
      id: result.insertId,
      nome: nome.trim(),
      custo: custoNum,
      valor_sugerido: valorSugerido,
      message: 'Produto criado',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar produto' });
  }
});

module.exports = router;
