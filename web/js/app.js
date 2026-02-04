/**
 * FinControl - Frontend (Fase 4)
 */

const API_BASE = 'http://localhost:3000/api';

async function apiGet(path) {
  try {
    const res = await fetch(`${API_BASE}${path}`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Erro ${res.status}`);
    return data;
  } catch (err) {
    if (err.message.startsWith('Erro ')) throw err;
    throw new Error('Verifique a conexão e se a API está rodando em ' + API_BASE);
  }
}

async function apiPost(path, body) {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Erro ${res.status}`);
    return data;
  } catch (err) {
    if (err.message.startsWith('Erro ') || err.message.includes('Verifique')) throw err;
    throw new Error('Verifique a conexão e se a API está rodando em ' + API_BASE);
  }
}

async function apiDelete(path) {
  try {
    const res = await fetch(`${API_BASE}${path}`, { method: 'DELETE' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Erro ${res.status}`);
    return data;
  } catch (err) {
    if (err.message.startsWith('Erro ') || err.message.includes('Verifique')) throw err;
    throw new Error('Verifique a conexão e se a API está rodando em ' + API_BASE);
  }
}

function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

function toast(msg, tipo = '') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast toast--show' + (tipo ? ' toast--' + tipo : '');
  setTimeout(() => el.classList.remove('toast--show'), 3000);
}

// --- Navegação ---
function showView(nome) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('view--active'));
  document.querySelectorAll('.nav__link').forEach(l => l.classList.remove('nav__link--active'));
  const view = document.getElementById('view-' + nome);
  const link = document.querySelector('.nav__link[data-view="' + nome + '"]');
  if (view) view.classList.add('view--active');
  if (link) link.classList.add('nav__link--active');

  if (nome === 'inicio') loadInicio();
  else if (nome === 'produtos') { loadProdutos(); atualizarPreviewSugestao(); }
  else if (nome === 'vendas') loadVendas();
  else if (nome === 'metas') loadMetas();
  else if (nome === 'despesas') loadDespesas();
  else if (nome === 'dashboard') loadDashboard();
}

document.querySelectorAll('.nav__link[data-view]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    showView(link.getAttribute('data-view'));
  });
});

// --- Início: saldo ---
async function loadInicio() {
  const el = document.getElementById('saldo-atual');
  el.textContent = '…';
  try {
    const data = await apiGet('/saldo');
    el.textContent = formatarMoeda(data.saldo);
    el.classList.toggle('negativo', data.saldo < 0);
  } catch (err) {
    el.textContent = 'Erro ao carregar';
    toast(err.message || 'Erro ao carregar saldo', 'erro');
  }
}

document.getElementById('btn-definir-saldo').addEventListener('click', () => {
  document.getElementById('card-saldo-inicial').hidden = false;
});

document.getElementById('btn-cancelar-saldo').addEventListener('click', () => {
  document.getElementById('card-saldo-inicial').hidden = true;
});

document.getElementById('form-saldo-inicial').addEventListener('submit', async (e) => {
  e.preventDefault();
  const valor = parseFloat(e.target.valor.value);
  if (isNaN(valor) || valor < 0) {
    toast('Informe um valor maior ou igual a zero.', 'erro');
    return;
  }
  try {
    await apiPost('/saldo/inicial', { valor });
    toast('Saldo inicial definido!', 'ok');
    document.getElementById('card-saldo-inicial').hidden = true;
    e.target.reset();
    loadInicio();
  } catch (err) {
    toast(err.message || 'Erro ao salvar', 'erro');
  }
});

// --- Produtos ---
async function loadProdutos() {
  const el = document.getElementById('lista-produtos');
  el.textContent = 'Carregando…';
  try {
    const lista = await apiGet('/produtos');
    if (lista.length === 0) {
      el.innerHTML = '<p class="lista-vazia">Nenhum produto cadastrado.</p>';
      return;
    }
    el.innerHTML = lista.map(p =>
      `<div class="lista-item" data-id="${p.id}">
        <span><strong>${escapeHtml(p.nome)}</strong> — Custo ${formatarMoeda(p.custo)} · Sugerido ${formatarMoeda(p.valor_sugerido || 0)}</span>
        <button type="button" class="btn btn--sm btn--excluir" data-id="${p.id}" title="Excluir produto">Excluir</button>
      </div>`
    ).join('');
    el.querySelectorAll('.btn--excluir').forEach(btn => {
      btn.addEventListener('click', () => excluirProduto(parseInt(btn.getAttribute('data-id'), 10)));
    });
  } catch (err) {
    el.textContent = 'Erro ao carregar.';
    toast(err.message || 'Erro ao carregar produtos', 'erro');
  }
}

function calcularSugestaoProduto(custo, taxaPct, margemPct) {
  if (custo == null || isNaN(custo) || custo < 0 || taxaPct >= 100) return null;
  const taxa = (taxaPct == null || isNaN(taxaPct)) ? 12.99 : taxaPct;
  const margem = (margemPct == null || isNaN(margemPct)) ? 30 : margemPct;
  const valorSugerido = custo * (1 + margem / 100) / (1 - taxa / 100);
  const valorTaxa = valorSugerido * (taxa / 100);
  const lucroLiquido = valorSugerido - custo - valorTaxa;
  return {
    valorSugerido: Math.round(valorSugerido * 100) / 100,
    lucroLiquido: Math.round(lucroLiquido * 100) / 100,
    valorTaxa: Math.round(valorTaxa * 100) / 100,
  };
}

function atualizarPreviewSugestao() {
  const custo = parseFloat(document.getElementById('produto-custo').value);
  const taxa = parseFloat(document.getElementById('produto-taxa').value);
  const margem = parseFloat(document.getElementById('produto-margem').value);
  const el = document.getElementById('sugestao-preview');
  const r = calcularSugestaoProduto(custo, taxa, margem);
  if (r == null || isNaN(custo) || custo <= 0) {
    el.textContent = 'Preencha o custo e a taxa para ver o valor sugerido de venda.';
    return;
  }
  if (taxa >= 100) {
    el.textContent = 'A taxa deve ser menor que 100%.';
    return;
  }
  el.textContent = `Venda sugerida: ${formatarMoeda(r.valorSugerido)} → lucro líquido ${formatarMoeda(r.lucroLiquido)} (após taxa de ${formatarMoeda(r.valorTaxa)})`;
}

async function excluirProduto(id) {
  if (!confirm('Excluir este produto? Essa ação não pode ser desfeita.')) return;
  try {
    await apiDelete('/produtos/' + id);
    toast('Produto excluído.', 'ok');
    loadProdutos();
  } catch (err) {
    toast(err.message || 'Erro ao excluir', 'erro');
  }
}

document.getElementById('produto-custo').addEventListener('input', atualizarPreviewSugestao);
document.getElementById('produto-taxa').addEventListener('input', atualizarPreviewSugestao);
document.getElementById('produto-margem').addEventListener('input', atualizarPreviewSugestao);

document.getElementById('form-produto').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const nome = form.nome.value.trim();
  const custo = parseFloat(form.custo.value);
  const taxaSugestao = parseFloat(form.taxa_sugestao.value);
  const margemLucro = parseFloat(form.margem_lucro.value);
  if (!nome) {
    toast('Informe o nome do produto.', 'erro');
    return;
  }
  if (isNaN(custo) || custo < 0) {
    toast('Informe um custo válido (número ≥ 0).', 'erro');
    return;
  }
  if (isNaN(taxaSugestao) || taxaSugestao < 0 || taxaSugestao >= 100) {
    toast('Informe a taxa que você paga (entre 0 e 100%).', 'erro');
    return;
  }
  const body = {
    nome,
    custo,
    taxa_sugestao: taxaSugestao,
    margem_lucro: isNaN(margemLucro) || margemLucro < 0 ? 30 : margemLucro,
  };
  try {
    await apiPost('/produtos', body);
    toast('Produto cadastrado!', 'ok');
    form.reset();
    form.taxa_sugestao.value = '12.99';
    form.margem_lucro.value = '30';
    atualizarPreviewSugestao();
    loadProdutos();
  } catch (err) {
    toast(err.message || 'Erro ao cadastrar', 'erro');
  }
});

// --- Vendas ---
async function loadVendas() {
  const select = document.getElementById('select-produtos');
  const listaEl = document.getElementById('lista-vendas');

  try {
    const [produtos, vendas] = await Promise.all([apiGet('/produtos'), apiGet('/vendas')]);

    select.innerHTML = '<option value="">Selecione o produto</option>' +
      produtos.map(p => `<option value="${p.id}">${escapeHtml(p.nome)} — ${formatarMoeda(p.valor_sugerido || p.custo)}</option>`).join('');

    if (vendas.length === 0) {
      listaEl.innerHTML = '<p class="lista-vazia">Nenhuma venda registrada.</p>';
    } else {
      listaEl.innerHTML = vendas.slice(0, 20).map(v =>
        `<div class="lista-item">
          <span>${escapeHtml(v.produto_nome)} — ${formatarMoeda(v.valor_bruto)}</span>
          <span style="color: var(--lucro)">Lucro ${formatarMoeda(v.lucro_com_taxa)}</span>
        </div>`
      ).join('');
    }
  } catch (err) {
    listaEl.textContent = 'Erro ao carregar.';
    toast(err.message || 'Erro ao carregar', 'erro');
  }
}

document.getElementById('form-venda').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const produtoId = parseInt(form.produto_id.value, 10);
  const valorBruto = parseFloat(form.valor_bruto.value);
  if (!produtoId) {
    toast('Selecione um produto.', 'erro');
    return;
  }
  if (isNaN(valorBruto) || valorBruto < 0) {
    toast('Informe o valor da venda (número ≥ 0).', 'erro');
    return;
  }
  const body = { produto_id: produtoId, valor_bruto: valorBruto };
  try {
    const data = await apiPost('/vendas', body);
    const fb = document.getElementById('ultima-venda');
    fb.hidden = false;
    fb.innerHTML = `Venda registrada. Lucro sem taxa: ${formatarMoeda(data.lucro_sem_taxa)} · Com taxa (${data.taxa_percentual}%): ${formatarMoeda(data.lucro_com_taxa)}`;
    form.reset();
    loadVendas();
    toast('Venda registrada!', 'ok');
  } catch (err) {
    toast(err.message || 'Erro ao registrar venda', 'erro');
  }
});

// --- Despesas ---
function setDataHoje() {
  document.getElementById('input-data-despesa').value = new Date().toISOString().slice(0, 10);
}

async function loadDespesas() {
  setDataHoje();
  const el = document.getElementById('lista-despesas');
  el.textContent = 'Carregando…';
  try {
    const lista = await apiGet('/despesas');
    if (lista.length === 0) {
      el.innerHTML = '<p class="lista-vazia">Nenhuma despesa.</p>';
      return;
    }
    el.innerHTML = lista.map(d =>
      `<div class="lista-item">
        <span><strong>${escapeHtml(d.nome)}</strong> ${d.motivo ? '— ' + escapeHtml(d.motivo) : ''} · ${d.data}</span>
        <span style="color: var(--despesa)">${formatarMoeda(d.valor)}</span>
      </div>`
    ).join('');
  } catch (err) {
    el.textContent = 'Erro ao carregar.';
    toast(err.message || 'Erro ao carregar despesas', 'erro');
  }
}

document.getElementById('form-despesa').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const nome = form.nome.value.trim();
  const valor = parseFloat(form.valor.value);
  if (!nome) {
    toast('Informe o nome da despesa.', 'erro');
    return;
  }
  if (isNaN(valor) || valor < 0) {
    toast('Informe um valor válido (número ≥ 0).', 'erro');
    return;
  }
  const body = {
    nome,
    motivo: form.motivo.value.trim(),
    valor,
    data: form.data.value,
  };
  try {
    await apiPost('/despesas', body);
    toast('Despesa cadastrada!', 'ok');
    form.reset();
    setDataHoje();
    loadDespesas();
  } catch (err) {
    toast(err.message || 'Erro ao cadastrar', 'erro');
  }
});

// --- Metas ---
async function loadMetas() {
  const el = document.getElementById('lista-metas');
  el.textContent = 'Carregando…';
  try {
    const lista = await apiGet('/metas');
    if (lista.length === 0) {
      el.innerHTML = '<p class="lista-vazia">Nenhuma meta definida.</p>';
      return;
    }
    const fragment = document.createDocumentFragment();
    for (const m of lista) {
      const prog = await apiGet('/metas/' + m.id + '/progresso').catch(() => null);
      const div = document.createElement('div');
      div.className = 'meta-item';
      const pct = prog ? prog.percentual : 0;
      const acima = pct >= 100;
      const badge = prog ? (acima ? '<span class="meta-item__badge meta-item__badge--atingida">Atingida</span>' : '<span class="meta-item__badge meta-item__badge--andamento">Em andamento</span>') : '';
      div.innerHTML = `
        <strong>${escapeHtml(m.descricao)}</strong>${badge} — ${formatarMoeda(m.valor_alvo)} (${m.periodo})
        ${prog ? `
          <div class="meta-bar">
            <div class="meta-bar__fill ${acima ? '' : 'abaixo'}" style="width: ${Math.min(100, pct)}%"></div>
          </div>
          <small>${formatarMoeda(prog.valor_atual)} de ${formatarMoeda(prog.valor_alvo)} (${pct.toFixed(1)}%) · Falta ${formatarMoeda(prog.falta)}</small>
        ` : '<br><small>Nenhuma venda no período ainda.</small>'}
      `;
      fragment.appendChild(div);
    }
    el.innerHTML = '';
    el.appendChild(fragment);
  } catch (err) {
    el.textContent = 'Erro ao carregar.';
    toast(err.message || 'Erro ao carregar metas', 'erro');
  }
}

document.getElementById('form-meta').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const descricao = form.descricao.value.trim();
  const valorAlvo = parseFloat(form.valor_alvo.value);
  if (!descricao) {
    toast('Informe a descrição da meta.', 'erro');
    return;
  }
  if (isNaN(valorAlvo) || valorAlvo < 0) {
    toast('Informe o valor alvo (número ≥ 0).', 'erro');
    return;
  }
  const body = { descricao, valor_alvo: valorAlvo, periodo: form.periodo.value };
  try {
    await apiPost('/metas', body);
    toast('Meta criada!', 'ok');
    form.reset();
    loadMetas();
  } catch (err) {
    toast(err.message || 'Erro ao criar meta', 'erro');
  }
});

// --- Dashboard (gráficos Chart.js) ---
let chartVendas = null;
let chartDespesas = null;

function agruparPorData(items, campoData, campoValor) {
  const map = {};
  for (const item of items) {
    const dataStr = (item[campoData] || '').toString().slice(0, 10);
    if (!dataStr) continue;
    if (!map[dataStr]) map[dataStr] = 0;
    map[dataStr] += Number(item[campoValor]) || 0;
  }
  const datas = Object.keys(map).sort();
  return { datas, totais: datas.map(d => map[d]) };
}

function formatarLabelData(dataStr) {
  const d = new Date(dataStr + 'T12:00:00');
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

async function loadDashboard() {
  const periodo = document.getElementById('dashboard-periodo').value;
  const elSaldo = document.getElementById('dash-saldo');
  const elLucro = document.getElementById('dash-lucro');
  const elDespesas = document.getElementById('dash-despesas');
  const elTaxas = document.getElementById('dash-taxas');
  const resumo = document.getElementById('dashboard-resumo');

  elSaldo.textContent = elLucro.textContent = elDespesas.textContent = elTaxas.textContent = '…';
  try {
    const [data, vendas, despesas] = await Promise.all([
      apiGet('/dashboard?periodo=' + periodo),
      apiGet('/vendas?periodo=' + periodo),
      apiGet('/despesas?periodo=' + periodo),
    ]);

    elSaldo.textContent = formatarMoeda(data.saldo);
    elLucro.textContent = formatarMoeda(data.lucro_total);
    elDespesas.textContent = formatarMoeda(data.total_despesas);
    elTaxas.textContent = formatarMoeda(data.total_taxas);
    const periodos = { semanal: 'esta semana', mensal: 'este mês', anual: 'este ano', total: 'geral' };
    resumo.textContent = `Resumo ${periodos[periodo] || periodo}: lucro ${formatarMoeda(data.lucro_total)}, despesas ${formatarMoeda(data.total_despesas)}, taxas ${formatarMoeda(data.total_taxas)}.`;

    // Meta do mês (primeira meta mensal)
    const cardMeta = document.getElementById('card-meta-dashboard');
    try {
      const metas = await apiGet('/metas');
      const metaMensal = metas.find(m => m.periodo === 'mensal');
      if (metaMensal) {
        const prog = await apiGet('/metas/' + metaMensal.id + '/progresso');
        cardMeta.hidden = false;
        document.getElementById('meta-dash-titulo').textContent = metaMensal.descricao + ' — ' + formatarMoeda(metaMensal.valor_alvo);
        const bar = document.getElementById('meta-dash-bar');
        const pct = Math.min(100, prog.percentual);
        bar.style.width = pct + '%';
        bar.className = 'meta-bar__fill meta-dash__fill' + (prog.percentual >= 100 ? '' : ' abaixo');
        document.getElementById('meta-dash-texto').textContent =
          prog.percentual >= 100
            ? 'Meta atingida! ' + formatarMoeda(prog.valor_atual) + ' de ' + formatarMoeda(prog.valor_alvo)
            : formatarMoeda(prog.valor_atual) + ' de ' + formatarMoeda(prog.valor_alvo) + ' (' + prog.percentual.toFixed(1) + '%). Falta ' + formatarMoeda(prog.falta);
        cardMeta.classList.toggle('meta--atingida', prog.percentual >= 100);
      } else {
        cardMeta.hidden = true;
      }
    } catch (_) {
      cardMeta.hidden = true;
    }

    // Dados para gráficos: agrupar por data
    const vendasPorData = agruparPorData(vendas, 'created_at', 'valor_bruto');
    const despesasPorData = agruparPorData(despesas, 'data', 'valor');

    // Unir todas as datas e ordenar para labels únicos
    const todasDatas = [...new Set([...vendasPorData.datas, ...despesasPorData.datas])].sort();
    const temDados = todasDatas.length > 0;
    const labels = temDados ? todasDatas.map(formatarLabelData) : ['Nenhum dado no período'];
    const valoresVendas = temDados ? todasDatas.map(d => vendasPorData.totais[vendasPorData.datas.indexOf(d)] ?? 0) : [0];
    const valoresDespesas = temDados ? todasDatas.map(d => despesasPorData.totais[despesasPorData.datas.indexOf(d)] ?? 0) : [0];

    if (chartVendas) chartVendas.destroy();
    if (chartDespesas) chartDespesas.destroy();

    const opts = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(255,255,255,0.08)' },
          ticks: { color: '#8b8b8b' },
        },
        x: {
          grid: { display: false },
          ticks: { color: '#8b8b8b', maxRotation: 45 },
        },
      },
    };

    const canvasVendas = document.getElementById('chart-vendas');
    const ctxV = canvasVendas.getContext('2d');
    const gradLucro = ctxV.createLinearGradient(0, 0, 0, 220);
    gradLucro.addColorStop(0, '#1db954');
    gradLucro.addColorStop(1, '#0d8a3a');

    chartVendas = new Chart(canvasVendas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Vendas (R$)',
          data: valoresVendas,
          backgroundColor: gradLucro,
          borderRadius: 6,
        }],
      },
      options: opts,
    });

    const canvasDespesas = document.getElementById('chart-despesas');
    const ctxD = canvasDespesas.getContext('2d');
    const gradDespesa = ctxD.createLinearGradient(0, 0, 0, 220);
    gradDespesa.addColorStop(0, '#e63946');
    gradDespesa.addColorStop(1, '#c42d3a');

    chartDespesas = new Chart(canvasDespesas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Despesas (R$)',
          data: valoresDespesas,
          backgroundColor: gradDespesa,
          borderRadius: 6,
        }],
      },
      options: opts,
    });
  } catch (err) {
    elSaldo.textContent = elLucro.textContent = elDespesas.textContent = elTaxas.textContent = '—';
    resumo.textContent = 'Erro ao carregar. Verifique se a API está rodando.';
    toast(err.message || 'Erro ao carregar dashboard', 'erro');
    if (chartVendas) chartVendas.destroy();
    if (chartDespesas) chartDespesas.destroy();
    chartVendas = chartDespesas = null;
  }
}

document.getElementById('dashboard-periodo').addEventListener('change', loadDashboard);

// --- Utilitário ---
function escapeHtml(s) {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

// Inicialização
showView('inicio');
