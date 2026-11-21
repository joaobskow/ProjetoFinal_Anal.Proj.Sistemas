import pedidos from './json/pedidos.json';
import produtos from './json/produtos.json';
import ordens from './json/ordens_producao.json';
import estoque from './json/estoque.json';
import materiais from './json/materiais.json';
import estrutura from './json/estrutura_produtos.json';
import recursos from './json/recursos.json';
import configuracao from './json/configuracao.json';

export const loadInitialData = () =>
  structuredClone({ pedidos, produtos, ordens, estoque, materiais, estrutura, recursos, configuracao });
