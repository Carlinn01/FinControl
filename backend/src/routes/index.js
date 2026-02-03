/**
 * Agregador de rotas da API FinControl
 * Montado em /api
 */

const express = require('express');
const router = express.Router();

const saldo = require('./saldo.js');
const produtos = require('./produtos.js');
const vendas = require('./vendas.js');
const despesas = require('./despesas.js');
const dashboard = require('./dashboard.js');
const metas = require('./metas.js');

router.get('/health', (req, res) => {
  res.json({ ok: true, message: 'FinControl API' });
});

router.use('/saldo', saldo);
router.use('/produtos', produtos);
router.use('/vendas', vendas);
router.use('/despesas', despesas);
router.use('/dashboard', dashboard);
router.use('/metas', metas);

module.exports = router;
