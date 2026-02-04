# FinControl — App Android (Kotlin)

App que consome a **mesma API** do FinControl (backend Node.js). Permite ver saldo, definir saldo inicial, dashboard mensal e últimas vendas.

## Requisitos

- **Android Studio** (Ladybug ou mais recente)
- **Backend FinControl** rodando (ex.: `http://localhost:3000`)
- Emulador Android ou dispositivo físico na mesma rede que o PC

## Configurar a URL da API

A URL base está em **`app/src/main/java/com/fincontrol/app/api/RetrofitClient.kt`**:

- **Emulador:** `http://10.0.2.2:3000/api/` (10.0.2.2 = localhost do PC)
- **Dispositivo físico:** troque pelo IP do seu PC na rede, ex.: `http://192.168.1.100:3000/api/`

## Como abrir e rodar

1. Abra o **Android Studio**.
2. **File → Open** e selecione a pasta **`mobile`** (dentro de FinControl).
3. Espere o Gradle sincronizar.
4. Inicie o **backend** no PC (`cd backend` → `npm start`).
5. No Android Studio: **Run → Run 'app'** (ou Shift+F10) e escolha emulador ou dispositivo.

## O que o app faz hoje

- **Saldo atual** — exibe o saldo calculado pela API.
- **Definir saldo inicial** — botão que abre um diálogo para informar o valor.
- **Dashboard (mensal)** — cards com Lucro total e Total de despesas.
- **Últimas vendas** — lista as 10 últimas vendas (produto, valor, lucro).
- **Pull to refresh** — puxe a tela para baixo para atualizar os dados.

## Próximos passos (opcional)

- Tela de **registrar venda** (lista de produtos + valor).
- Tela de **cadastrar despesa**.
- Tela de **metas** com barra de progresso.
- Abas ou menu inferior para navegar entre Saldo, Vendas, Despesas, Dashboard.

## Estrutura do projeto

```
mobile/
├── app/
│   ├── src/main/
│   │   ├── java/com/fincontrol/app/
│   │   │   ├── MainActivity.kt
│   │   │   └── api/
│   │   │       ├── FinControlApi.kt   # Interface Retrofit
│   │   │       └── RetrofitClient.kt  # URL base e cliente
│   │   ├── res/
│   │   └── AndroidManifest.xml
│   └── build.gradle.kts
├── build.gradle.kts
├── settings.gradle.kts
└── README.md
```
