# AgroPCP

Sistema de **Planejamento e Controle da Produção (PCP)** da empresa **AgroVale Implementos**, uma metalúrgica de implementos agrícolas. Projeto final da disciplina **Análise e Projeto de Sistemas** (UNISC), prof. Rafael Peiter.

O AgroPCP transforma pedidos de clientes em ordens de produção: calcula a necessidade de materiais, verifica o estoque disponível, programa as ordens nos recursos produtivos e acompanha o andamento da produção. É um aplicativo desktop (Windows) feito em React e Electron.

## Integrantes

- Augusto Bittencourt
- Dionatan Vaz Durigon
- João Vitor Beskow
- Natanael Zeminhani Lemos

## Funcionalidades

- **Visão geral:** indicadores, linha do tempo das ordens abertas, lista do que requer atenção (faltas, atrasos, prazos, recursos parados, estoque mínimo) e carga dos recursos.
- **Pedidos e detalhe do pedido:** necessidade de materiais com perdas e lote mínimo, verificação do saldo livre e geração de ordem de produção.
- **Produtos e detalhe do produto:** roteiro de produção e estrutura (lista de materiais).
- **Estoque:** disponível, reservado, saldo livre, nível em relação ao mínimo e alerta de estoque mínimo.
- **Recursos:** capacidade diária, horas de carga restante e carga separada por linha de produção.
- **Ordens de produção e detalhe da ordem:** andamento, liberação, registro de produção e refugo, reprogramação e cancelamento.
- **Programação:** sequência de execução (arrastar ou setas), reprogramação de datas, prioridade e posição, e linha do tempo com a entrega de cada pedido.
- **Linha de produção:** filtro global (Todas, Pesada, Leve) aplicado a todas as telas.
- **Data de referência:** data base configurável (padrão 03/11/2026, em `configuracao.json`), usada para calcular ordens atrasadas e manter a demonstração reproduzível.
- **Tema claro e escuro.**

## Regras de cálculo

| Item | Regra |
|---|---|
| Quantidade a produzir | `ceil(pedido / lote) × lote` |
| Necessário (material) | `qtd a produzir × qtd por unidade × (1 + perda%)` |
| Saldo livre | `disponível − reservado` |
| Horas necessárias | `qtd × minutos por unidade ÷ 60` |
| Reservas | ordens com situação liberada ou em produção |
| Atrasada | ordem aberta com `fim previsto < data de referência` (calculado, não gravado) |
| Após a entrega | ordem aberta com `fim previsto > entrega do pedido` |
| Abaixo do mínimo | `disponível < estoque mínimo` |
| Carga do recurso | soma de `restante × minutos da etapa` das ordens abertas |
| Progresso | `produzido ÷ planejado` |

## Tecnologias

| Camada | Tecnologia | Situação |
|---|---|---|
| Interface | React 19 + Vite | Implementada |
| Aplicativo desktop | Electron + electron-builder (instalador NSIS, Windows x64) | Implementado |
| Dados | Arquivos JSON locais | Em uso |
| Backend / regras de negócio | Python | Planejado |
| Banco de dados local | A definir | Planejado |
| Protótipo | Figma | Concluído |
| Gestão de tarefas | Trello | Em uso |

## Estrutura do repositório

```
.
├── front-end/
│   ├── desktop/             # Processo principal e preload do Electron
│   ├── src/
│   │   ├── pages/           # Telas (Dashboard, Requests, Orders, Schedule, ...)
│   │   ├── modals/          # Nova ordem, reprogramar, registrar produção, data de referência
│   │   ├── components/      # Componentes de interface, ícones e linha do tempo (Gantt)
│   │   ├── domain/          # Regras do PCP (pcp.js) e formatação (format.js)
│   │   ├── state/           # Estado da aplicação (store.jsx) e navegação (nav.jsx)
│   │   ├── data/
│   │   │   ├── json/        # Dados usados pelo app e configuracao.json
│   │   │   └── source.js    # Carga inicial a partir dos JSON
│   │   └── services/        # api.js e pcpApi.js (contrato da futura API)
│   ├── AgroVale_JSON/       # Dados-fonte originais do projeto
│   └── package.json
├── back-end/                # Reservado para a API em Python
└── README.md
```

## Dados

O app lê 7 arquivos JSON, no layout definido pelo professor, em `front-end/src/data/json/`:

| Arquivo | Conteúdo |
|---|---|
| `produtos.json` | 12 produtos com roteiro de produção |
| `materiais.json` | 17 materiais |
| `estrutura_produtos.json` | Estrutura de produto (lista de materiais) |
| `estoque.json` | Saldos, reservas e estoque mínimo |
| `recursos.json` | 5 recursos produtivos e capacidade |
| `pedidos.json` | Pedidos de clientes |
| `ordens_producao.json` | Ordens de produção |

Para trocar os dados exibidos, edite esses arquivos mantendo os nomes e a estrutura de campos. A pasta `AgroVale_JSON/` guarda os dados-fonte originais.

## Como executar

### Pré-requisitos

- [Node.js](https://nodejs.org/) 20.19 ou superior (testado com 22.16, exigência do Vite 7)
- npm 10 ou superior (com npm 11, os scripts de instalação do Electron e do esbuild já estão liberados em `allowScripts` no `package.json`)
- Git

### Desenvolvimento

```bash
git clone https://github.com/joaobskow/ProjetoFinal_Anal.Proj.Sistemas.git
cd ProjetoFinal_Anal.Proj.Sistemas/front-end
npm install
npm run dev
```

O comando abre a janela do Electron com a interface React em modo de desenvolvimento.

### Gerar o instalador (Windows)

```bash
npm run desktop:dist
```

O instalador é gerado em `front-end/release/`. Para apenas testar o empacotamento sem instalador, use `npm run desktop:dir`.

### Backend (opcional, quando disponível)

Copie `front-end/.env.example` para `front-end/.env.local` e ajuste `VITE_API_URL`. Enquanto o backend não estiver conectado, a interface usa os JSON locais.

## Próximos passos

- Implementar o backend em Python e o banco de dados local.
- Conectar as telas aos métodos de `pcpApi.js`.
- Persistir a geração de ordens, o registro de produção e a reprogramação.

## Links do projeto

- Protótipo (Figma): [Projeto Final Anál. Proj. Sistemas](https://www.figma.com/design/vMEFhY4YRPuULu6EoY3RVu/Projeto-Final-Anál.-Proj.-Sistemas?t=uvsYldlGcNwQHk16-1)
- Gestão de tarefas (Trello): [Trello](https://trello.com/invite/b/6adf57f8c927a350614db426/ATTI5f5de082e38fe67dc719c7086c6662cfE865FED1/projeto-anal-proj-sistemas)
- Documentação (Google Docs): [Projeto Final - Docs ](https://docs.google.com/document/d/1U2CdJ5d7HSKThf1hgOce_oOHP-b2E2a9MM8U5CLR6kU/edit?usp=sharing)

## Cronograma da disciplina

| Data | Entrega |
|---|---|
| 10/11/2026 | Estudo de caso |
| 17/11/2026 | Protótipos |
| 01/12/2026 | Sistema funcionando, repositório e Trello |
