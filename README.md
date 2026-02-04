# FinControl — Gerenciador de Vendas e Gastos

Sistema de controle financeiro para pequenos negócios e vendedores autônomos: vendas, despesas, lucros, taxas e metas em um só lugar.

## Paleta de cores

| Uso            | Cor           | Hex     |
|----------------|---------------|---------|
| Azul (primário)| #0052aa → #007bff (gradiente) |
| Preto          | #0F0F0F       |         |
| Cinza escuro   | #2A2A2A       |         |
| Lucro          | #1DB954       |         |
| Despesa        | #E63946       |         |
| Alerta / meta  | #F4C430       |         |

## Estrutura do projeto

- **backend/** — API Node.js + Express + MySQL
- **web/** — Interface HTML, CSS e JavaScript (consumo da API)
- **mobile/** — (futuro) App Android em Kotlin

## Como rodar

### 1. MySQL

- Instale o [MySQL](https://dev.mysql.com/downloads/) ou use [XAMPP](https://www.apachefriends.org/) e inicie o serviço MySQL.
- Crie o arquivo **`backend/.env`** com as variáveis de conexão:

```env
PORT=3000
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=sua_senha
MYSQL_DATABASE=fincontrol
```

O banco `fincontrol` e as tabelas são criados automaticamente na primeira execução do backend.

### 2. Backend

```bash
cd backend
npm install
npm start
```

A API ficará disponível em **http://localhost:3000**. Endpoints: `/api/health`, `/api/saldo`, `/api/produtos`, `/api/vendas`, `/api/despesas`, `/api/dashboard`, `/api/metas`.

### 3. Frontend (web)

- **Opção A:** Abrir **`web/index.html`** diretamente no navegador (duplo clique).  
  Se der erro de CORS ao chamar a API, use a opção B.
- **Opção B:** Servir a pasta `web` com um servidor estático:
  ```bash
  npx serve web
  ```
  Acesse o endereço exibido (ex.: http://localhost:3000 ou outra porta).

**Importante:** O frontend espera a API em **http://localhost:3000**. Se o backend rodar em outra porta, altere a constante `API_BASE` em **`web/js/app.js`**.

## Funcionalidades

- **Saldo:** definir saldo inicial e ver saldo atual (calculado).
- **Produtos:** cadastrar com nome, custo e valor sugerido.
- **Vendas:** registrar venda por produto; cálculo de lucro com e sem taxa (12,99%).
- **Despesas:** cadastrar com nome, motivo, valor e data.
- **Metas:** criar metas (mensal/anual) e acompanhar progresso (faturamento vs alvo).
- **Dashboard:** resumo por período (semanal/mensal/anual/total), gráficos de vendas e despesas, card “Meta do mês”.

## Guia de desenvolvimento

Siga o **[GUIA-DESENVOLVIMENTO.md](./GUIA-DESENVOLVIMENTO.md)** para as fases do projeto (0 a 8).

---

Desenvolvido para aprendizado e portfólio.
