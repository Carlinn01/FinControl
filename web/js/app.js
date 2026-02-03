/**
 * FinControl - JavaScript principal (web)
 * Altere API_BASE para a URL do backend quando for consumir a API (Fase 4).
 */

const API_BASE = 'http://localhost:3000/api';

async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  return res.json();
}

async function apiPost(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  return res.json();
}

// Exemplo de uso (quando a API existir):
// const health = await apiGet('/health');
// console.log(health);
