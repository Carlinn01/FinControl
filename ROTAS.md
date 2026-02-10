## Rotas FinControl — Backend, Web e Mobile

### 1. Backend API (Node/Express)

**Base da API:** `http://HOST:3000/api`

- **Saúde**
  - `GET /api/health` → `{ ok: true, message: "FinControl API" }`

- **Saldo**
  - `GET /api/saldo`  
    - Retorna saldo atual calculado (saldo_inicial + lucro líquido de vendas − despesas).
    - Response: `{ saldo, saldo_inicial, lucro_liquido_vendas, total_despesas }`
  - `GET /api/saldo/inicial`  
    - Último saldo inicial definido.  
    - Response: `{ id?, valor, created_at?, definido: boolean }`
  - `POST /api/saldo/inicial`  
    - Define novo saldo inicial.  
    - Body: `{ valor: number }`
    - Response: `{ id, valor, message }`

- **Produtos**
  - `GET /api/produtos`  
    - Lista produtos.  
    - Response: `[{ id, nome, custo, valor_sugerido, created_at }]`
  - `GET /api/produtos/:id`  
    - Detalhe de um produto.
  - `POST /api/produtos`  
    - Cria produto com sugestão de preço.  
    - Body:  
      `{ nome, custo, taxa_sugestao?, margem_lucro?, valor_sugerido? }`
  - `DELETE /api/produtos/:id`  
    - Exclui produto caso não tenha vendas vinculadas.

- **Vendas**
  - `GET /api/vendas?periodo=semanal|mensal|anual|total`  
    - Lista vendas (web usa para lista e gráficos, mobile para últimas vendas).  
    - Response:  
      `[{ id, produto_id, valor_bruto, taxa_percentual, produto_nome, custo, lucro_sem_taxa, lucro_com_taxa, created_at }]`
  - `POST /api/vendas`  
    - Registra venda.  
    - Body: `{ produto_id, valor_bruto, taxa_percentual? }`
    - Response: inclui `lucro_sem_taxa`, `lucro_com_taxa`, `valor_taxa`.

- **Despesas**
  - `GET /api/despesas?periodo=semanal|mensal|anual|total`  
    - Lista despesas.  
    - Response: `[{ id, nome, motivo, valor, data, created_at }]`
  - `POST /api/despesas`  
    - Cadastra despesa.  
    - Body: `{ nome, motivo?, valor, data? (YYYY-MM-DD) }`

- **Dashboard**
  - `GET /api/dashboard?periodo=semanal|mensal|anual|total`  
    - Resumo financeiro para gráficos / cards.  
    - Response: `{ periodo, saldo, lucro_total, total_despesas, total_taxas }`

- **Metas**
  - `GET /api/metas`  
    - Lista metas cadastradas.  
    - Response: `[{ id, descricao, valor_alvo, periodo, created_at }]`
  - `POST /api/metas`  
    - Cria meta.  
    - Body: `{ descricao, valor_alvo, periodo: "mensal" | "anual" }`
  - `GET /api/metas/:id/progresso`  
    - Progresso de uma meta em relação às vendas do período.  
    - Response: `{ meta_id, descricao, valor_alvo, valor_atual, percentual, falta, periodo }`

---

### 2. Frontend Web (`web/`)

**Base usada no JS:** `API_BASE = "http://localhost:3000/api"`

- **Início (Saldo)**
  - `GET /saldo` → `loadInicio()` mostra saldo atual.
  - `POST /saldo/inicial` → formulário de saldo inicial.

- **Produtos**
  - `GET /produtos` → lista produtos.
  - `POST /produtos` → formulário de cadastro com sugestão de valor.
  - `DELETE /produtos/:id` → botão de excluir produto.

- **Vendas**
  - `GET /produtos` → preencher select de produtos.
  - `GET /vendas` → lista últimas vendas.
  - `POST /vendas` → formulário de registrar venda.

- **Despesas**
  - `GET /despesas` → lista despesas.
  - `POST /despesas` → formulário de cadastro de despesa.

- **Metas**
  - `GET /metas` → lista metas.
  - `GET /metas/:id/progresso` → mostra barra de progresso de cada meta.
  - `POST /metas` → criação de meta via formulário.

- **Dashboard**
  - `GET /dashboard?periodo=...` → cards de saldo/lucro/despesas/taxas.
  - `GET /vendas?periodo=...` → dados do gráfico de vendas.
  - `GET /despesas?periodo=...` → dados do gráfico de despesas.
  - `GET /metas` + `GET /metas/:id/progresso` → card “Meta do mês”.

---

### 3. App Mobile Android (`mobile/`)

**Base do Retrofit (ajustar para emulador/celular):**
- Emulador: `http://10.0.2.2:3000/api/`
- Dispositivo físico: `http://SEU_IP_PC:3000/api/`

Interface `FinControlApi`:

- **Saldo / Dashboard / Vendas**
  - `GET saldo` → `getSaldo()`
  - `POST saldo/inicial` → `postSaldoInicial(SaldoInicialBody)`
  - `GET dashboard?periodo=` → `getDashboard(periodo)`
  - `GET vendas?periodo=` → `getVendas(periodo)`

- **Vendas (criar)**
  - `POST vendas` → `postVenda(VendaCreateBody)`

- **Despesas**
  - `POST despesas` → `postDespesa(DespesaCreateBody)`

- **Produtos**
  - `GET produtos` → `getProdutos()` (para listar nomes/IDs no app).

- **Metas**
  - `GET metas` → `getMetas()`
  - `POST metas` → `postMeta(MetaCreateBody)`
  - `GET metas/{id}/progresso` → `getMetaProgresso(id)`

Na `MainActivity` hoje:
- Usa `getSaldo`, `getDashboard("mensal")`, `getVendas("total")` para mostrar:
  - Card de saldo atual.
  - Lucro / despesas do mês.
  - Lista textual das últimas vendas.
- Usa `postSaldoInicial` para definir o saldo inicial via diálogo.

