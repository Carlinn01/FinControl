/**
 * Rotas: vendas
 * GET /api/vendas?periodo=semanal|mensal|anual|total
 * POST /api/vendas → produto_id, valor_bruto, taxa_percentual (opcional, default 12.99)
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../db/connection.js');
const { wherePeriodoVendas } = require('../utils/periodo.js');

router.get('/', async (req, res) => {
  try {
    const periodo = req.query.periodo || 'total';
    const { sql: whereSql, params: whereParams } = wherePeriodoVendas(periodo);

    const [rows] = await pool.query(
      `SELECT v.id, v.produto_id, v.valor_bruto, v.taxa_percentual, v.created_at,
              p.nome AS produto_nome, p.custo,
              (v.valor_bruto - p.custo) AS lucro_sem_taxa,
              (v.valor_bruto - p.custo - (v.valor_bruto * COALESCE(v.taxa_percentual, 12.99) / 100)) AS lucro_com_taxa
       FROM vendas v
       INNER JOIN produtos p ON p.id = v.produto_id
       WHERE 1=1 ${whereSql}
       ORDER BY v.created_at DESC`,
      whereParams
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar vendas' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { produto_id, valor_bruto, taxa_percentual } = req.body;
    const produtoId = parseInt(produto_id, 10);
    if (isNaN(produtoId) || produtoId < 1) {
      return res.status(400).json({ error: 'produto_id inválido' });
    }
    const valorBruto = parseFloat(valor_bruto);
    if (valorBruto == null || isNaN(valorBruto) || valorBruto < 0) {
      return res.status(400).json({ error: 'valor_bruto inválido (número >= 0)' });
    }
    const taxa = taxa_percentual != null ? parseFloat(taxa_percentual) : 12.99;
    let taxaPct = isNaN(taxa) ? 12.99 : taxa;
    if (taxaPct < 0 || taxaPct > 100) {
      return res.status(400).json({ error: 'taxa_percentual deve estar entre 0 e 100' });
    }

    const [prodRows] = await pool.query('SELECT id, custo FROM produtos WHERE id = ?', [produtoId]);
    if (prodRows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    const custo = Number(prodRows[0].custo);
    const lucroSemTaxa = valorBruto - custo;
    const valorTaxa = valorBruto * (taxaPct / 100);
    const lucroComTaxa = valorBruto - custo - valorTaxa;

    const [result] = await pool.query(
      'INSERT INTO vendas (produto_id, valor_bruto, taxa_percentual) VALUES (?, ?, ?)',
      [produtoId, valorBruto, taxaPct]
    );

    res.status(201).json({
      id: result.insertId,
      produto_id: produtoId,
      valor_bruto: valorBruto,
      taxa_percentual: taxaPct,
      lucro_sem_taxa: Math.round(lucroSemTaxa * 100) / 100,
      lucro_com_taxa: Math.round(lucroComTaxa * 100) / 100,
      valor_taxa: Math.round(valorTaxa * 100) / 100,
      message: 'Venda registrada',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao registrar venda' });
  }
});

module.exports = router;
