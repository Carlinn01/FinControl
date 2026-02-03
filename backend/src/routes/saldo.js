/**
 * Rotas: saldo atual e saldo inicial
 * GET /api/saldo → saldo atual (calculado)
 * POST /api/saldo/inicial → define saldo inicial
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../db/connection.js');

// Saldo atual = saldo_inicial (último) + soma(lucro líquido vendas) - soma(despesas)
router.get('/', async (req, res) => {
  try {
    const [saldoInicialRows] = await pool.query(
      'SELECT valor FROM saldo_inicial ORDER BY id DESC LIMIT 1'
    );
    const saldoInicial = saldoInicialRows[0] ? Number(saldoInicialRows[0].valor) : 0;

    const [vendasRows] = await pool.query(`
      SELECT v.valor_bruto, v.taxa_percentual, p.custo
      FROM vendas v
      INNER JOIN produtos p ON p.id = v.produto_id
    `);
    let lucroLiquidoVendas = 0;
    for (const row of vendasRows) {
      const vb = Number(row.valor_bruto);
      const custo = Number(row.custo);
      const taxa = Number(row.taxa_percentual || 12.99) / 100;
      lucroLiquidoVendas += vb - custo - vb * taxa;
    }

    const [despesasRows] = await pool.query(
      'SELECT COALESCE(SUM(valor), 0) AS total FROM despesas'
    );
    const totalDespesas = Number(despesasRows[0].total);

    const saldoAtual = saldoInicial + lucroLiquidoVendas - totalDespesas;

    res.json({
      saldo: Math.round(saldoAtual * 100) / 100,
      saldo_inicial: saldoInicial,
      lucro_liquido_vendas: Math.round(lucroLiquidoVendas * 100) / 100,
      total_despesas: totalDespesas,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao calcular saldo' });
  }
});

// Retorna o último saldo inicial registrado (para exibir ou preencher formulário)
router.get('/inicial', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, valor, created_at FROM saldo_inicial ORDER BY id DESC LIMIT 1'
    );
    if (rows.length === 0) {
      return res.json({ valor: 0, definido: false });
    }
    res.json({
      id: rows[0].id,
      valor: Number(rows[0].valor),
      created_at: rows[0].created_at,
      definido: true,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar saldo inicial' });
  }
});

// Define saldo inicial (insere novo registro)
router.post('/inicial', async (req, res) => {
  try {
    const valor = parseFloat(req.body.valor);
    if (valor == null || isNaN(valor) || valor < 0) {
      return res.status(400).json({ error: 'Valor inválido (deve ser um número >= 0)' });
    }
    const [result] = await pool.query('INSERT INTO saldo_inicial (valor) VALUES (?)', [valor]);
    res.status(201).json({
      id: result.insertId,
      valor,
      message: 'Saldo inicial definido',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao salvar saldo inicial' });
  }
});

module.exports = router;
