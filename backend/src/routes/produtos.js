/**
 * Rotas: produtos
 * GET /api/produtos → lista
 * GET /api/produtos/:id → detalhe
 * POST /api/produtos → criar
 *   nome, custo obrigatórios.
 *   taxa_sugestao (% que vai pagar, ex: 12.99) + margem_lucro (% sobre custo, default 30) → calcula valor_sugerido para bom lucro.
 *   Ou envia valor_sugerido direto (opcional).
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../db/connection.js');

function calcularValorSugerido(custo, taxaPercentual, margemLucroPercentual = 30) {
  if (taxaPercentual >= 100) return null;
  const margem = 1 + margemLucroPercentual / 100;
  const depoisDaTaxa = 1 - taxaPercentual / 100;
  return Math.round((custo * margem / depoisDaTaxa) * 100) / 100;
}

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
    const { nome, custo, valor_sugerido, taxa_sugestao, margem_lucro } = req.body;
    if (!nome || nome.trim() === '') {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }
    const custoNum = parseFloat(custo);
    if (custoNum == null || isNaN(custoNum) || custoNum < 0) {
      return res.status(400).json({ error: 'Custo inválido (número >= 0)' });
    }
    let valorSugerido = null;
    const taxaNum = taxa_sugestao != null ? parseFloat(taxa_sugestao) : null;
    const margemNum = margem_lucro != null ? parseFloat(margem_lucro) : 30;
    if (taxaNum != null && !isNaN(taxaNum) && taxaNum >= 0 && taxaNum < 100) {
      valorSugerido = calcularValorSugerido(custoNum, taxaNum, isNaN(margemNum) ? 30 : Math.max(0, margemNum));
    }
    if (valorSugerido == null && valor_sugerido != null) {
      valorSugerido = parseFloat(valor_sugerido);
    }
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

router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

    const [existe] = await pool.query('SELECT id FROM produtos WHERE id = ?', [id]);
    if (existe.length === 0) return res.status(404).json({ error: 'Produto não encontrado' });

    const [vendas] = await pool.query('SELECT COUNT(*) AS total FROM vendas WHERE produto_id = ?', [id]);
    if (vendas[0].total > 0) {
      return res.status(400).json({
        error: 'Não é possível excluir: existem vendas vinculadas a este produto.',
      });
    }

    await pool.query('DELETE FROM produtos WHERE id = ?', [id]);
    res.json({ message: 'Produto excluído' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao excluir produto' });
  }
});

module.exports = router;
