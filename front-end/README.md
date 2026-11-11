# AgroPCP desktop

Aplicativo de planejamento e controle da produção feito em React e Electron, empacotado como instalador Windows. As telas estão separadas em `src/pages/`, com nomes em português correspondentes à navegação.

## Dados

O app usa os arquivos JSON em `src/data/json/`: `pedidos.json`, `produtos.json`, `ordens_producao.json`, `estoque.json`, `materiais.json`, `estrutura_produtos.json` e `recursos.json`. Atualize esses arquivos mantendo os nomes e a estrutura de campos para trocar os dados exibidos. Os arquivos em `AgroVale_JSON/` são mantidos como dados-fonte do projeto.

`src/data/pcpData.js` relaciona os registros por código e prepara os valores para as telas. `src/services/pcpApi.js` e `src/services/api.js` mantêm os métodos iniciais para a futura API em `../back-end/`; como os endpoints ainda não foram conectados, a interface usa os JSON locais.

## Desenvolvimento e build

Execute os comandos abaixo dentro desta pasta:

1. `npm install`
2. `npm run dev` abre a janela desktop durante o desenvolvimento.
3. `npm run desktop:dist` gera o instalador Windows em `release/`.

Copie `.env.example` para `.env.local` e defina `VITE_API_URL` quando o back-end estiver disponível.
