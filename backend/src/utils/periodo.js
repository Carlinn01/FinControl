/**
 * Retorna condição SQL e params para filtro de período.
 * Uso: WHERE created_at >= ? AND created_at <= ?
 */

function getPeriodo(periodo) {
  const p = (periodo || 'total').toLowerCase();
  const hoje = new Date();
  let inicio, fim;

  switch (p) {
    case 'semanal': {
      const d = new Date(hoje);
      d.setDate(d.getDate() - 7);
      inicio = d.toISOString().slice(0, 10);
      fim = hoje.toISOString().slice(0, 10);
      break;
    }
    case 'mensal': {
      inicio = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-01`;
      fim = hoje.toISOString().slice(0, 10);
      break;
    }
    case 'anual': {
      inicio = `${hoje.getFullYear()}-01-01`;
      fim = hoje.toISOString().slice(0, 10);
      break;
    }
    default:
      return { sql: '', params: [] };
  }

  return {
    inicio,
    fim,
  };
}

/** Para vendas (created_at) */
function wherePeriodoVendas(periodo) {
  const p = getPeriodo(periodo);
  if (!p.sql) return { sql: '', params: [] };
  return {
    sql: ' AND v.created_at >= ? AND v.created_at <= ?',
    params: [p.inicio + ' 00:00:00', p.fim + ' 23:59:59'],
  };
}

/** Para despesas (campo data) */
function wherePeriodoDespesas(periodo) {
  const p = getPeriodo(periodo);
  if (!p.sql) return { sql: '', params: [] };
  return {
    sql: ' AND d.data >= ? AND d.data <= ?',
    params: [p.inicio, p.fim],
  };
}

module.exports = { getPeriodo, wherePeriodoVendas, wherePeriodoDespesas };
