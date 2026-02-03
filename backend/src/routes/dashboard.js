/**
 * GET /api/dashboard?periodo=semanal|mensal|anual|total
 * Retorna: saldo (atual total), lucro_total, total_despesas, total_taxas no período
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../db/connection.js');
const { wherePeriodoVendas, wherePeriodoDespesas } = require('../utils/periodo.js');

router.get('/', async (req, res) => {
  try {
    const periodo = req.query.periodo || 'total';
    const wVendas = wherePeriodoVendas(periodo);
    const wDespesas = wherePeriodoDespesas(periodo);

    // Saldo atual (sempre total, não filtrado por período)
    const [saldoInicialRows] = await pool.query(
      'SELECT valor FROM saldo_inicial ORDER BY id DESC LIMIT 1'
    );
    const saldoInicial = saldoInicialRows[0] ? Number(saldoInicialRows[0].valor) : 0;

    const [vendasRows] = await pool.query(`
      SELECT v.valor_bruto, v.taxa_percentual, p.custo
      FROM vendas v
      INNER JOIN produtos p ON p.id = v.produto_id
    `);
    let lucroLiquidoTotal = 0;
    let totalTaxasGeral = 0;
    for (const row of vendasRows) {
      const vb = Number(row.valor_bruto);
      const custo = Number(row.custo);
      const taxa = Number(row.taxa_percentual || 12.99) / 100;
      totalTaxasGeral += vb * taxa;
      lucroLiquidoTotal += vb - custo - vb * taxa;
    }

    const [despesasRows] = await pool.query('SELECT COALESCE(SUM(valor), 0) AS total FROM despesas');
    const totalDespesasGeral = Number(despesasRows[0].total);
    const saldo = saldoInicial + lucroLiquidoTotal - totalDespesasGeral;

    // No período: lucro, despesas, taxas
    let lucroTotalPeriodo = 0;
    const [vendasPeriodoRows] = await pool.query(
      `SELECT v.valor_bruto, v.taxa_percentual, p.custo FROM vendas v INNER JOIN produtos p ON p.id = v.produto_id WHERE 1=1 ${wVendas.sql}`,
      wVendas.params
    );
    let totalTaxasPeriodo = 0;
    for (const row of vendasPeriodoRows) {
      const vb = Number(row.valor_bruto);
      const custo = Number(row.custo);
      const taxa = Number(row.taxa_percentual || 12.99) / 100;
      totalTaxasPeriodo += vb * taxa;
      lucroTotalPeriodo += vb - custo - vb * taxa;
    }

    const [despesasPeriodoRows] = await pool.query(
      `SELECT COALESCE(SUM(valor), 0) AS total FROM despesas WHERE 1=1 ${wDespesas.sql}`,
      wDespesas.params
    );
    const totalDespesasPeriodo = Number(despesasPeriodoRows[0].total);

    res.json({
      periodo,
      saldo: Math.round(saldo * 100) / 100,
      lucro_total: Math.round(lucroTotalPeriodo * 100) / 100,
      total_despesas: Math.round(totalDespesasPeriodo * 100) / 100,
      total_taxas: Math.round(totalTaxasPeriodo * 100) / 100,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao gerar dashboard' });
  }
});

module.exports = router;
