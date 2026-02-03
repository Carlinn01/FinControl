# FinControl — Gerenciador de Vendas e Gastos

Sistema de controle financeiro para pequenos negócios e vendedores autônomos: vendas, despesas, lucros, taxas e metas em um só lugar.

## Paleta de cores

| Uso            | Cor           | Hex     |
|----------------|---------------|---------|
| Azul (primário)| #0A2540       |         |
| Preto          | #0F0F0F       |         |
| Cinza escuro   | #2A2A2A       |         |
| Cinza médio    | #8B8B8B       |         |
| Lucro          | #1DB954       |         |
| Despesa        | #E63946       |         |
| Alerta / meta  | #F4C430       |         |

## Como desenvolver

Siga o **[GUIA-DESENVOLVIMENTO.md](./GUIA-DESENVOLVIMENTO.md)** etapa por etapa (Fase 0 → Fase 7, depois Fase 8 para o app).

## Estrutura do projeto

- **backend/** — API Node.js + Express + MySQL
- **web/** — Interface HTML, CSS e JavaScript
- **mobile/** — (futuro) App Android em Kotlin

## Rodar o projeto (após Fase 0 e 1)

1. **MySQL** — Instale o MySQL e crie o arquivo `backend/.env` (host, user, password, database).
2. **Backend:** `cd backend` → `npm install` → `npm start`
3. **Web:** abrir `web/index.html` no navegador ou usar um servidor estático.

---

Desenvolvido para aprendizado e portfólio.
