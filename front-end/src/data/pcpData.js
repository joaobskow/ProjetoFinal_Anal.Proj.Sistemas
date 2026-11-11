import rawPedidos from './json/pedidos.json';
import rawProdutos from './json/produtos.json';
import rawOrdens from './json/ordens_producao.json';
import rawEstoque from './json/estoque.json';
import rawMateriais from './json/materiais.json';
import rawEstrutura from './json/estrutura_produtos.json';
import rawRecursos from './json/recursos.json';
import appConfig from './json/configuracao.json';

export const referenceDate = appConfig.data_referencia;
export const referenceDateLabel = new Intl.DateTimeFormat('pt-BR').format(new Date(`${referenceDate}T00:00:00`));
export const scheduleWeekLabels = Array.from({ length: 5 }, (_, index) => {
  const date = new Date(`${referenceDate}T00:00:00`);
  date.setDate(date.getDate() + (index - 2) * 7);
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(date);
});

export const displayDate = (value, withYear = false) => {
  if (!value) return '—';
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  return new Intl.DateTimeFormat('pt-BR', withYear
    ? { day: '2-digit', month: '2-digit', year: 'numeric' }
    : { day: '2-digit', month: '2-digit' }).format(date);
};

export const numberPt = (value) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(value ?? 0);

const productById = Object.fromEntries(rawProdutos.map((product) => [product.codigo, product]));
const materialById = Object.fromEntries(rawMateriais.map((material) => [material.codigo, material]));
const stockById = Object.fromEntries(rawEstoque.map((stock) => [stock.material, stock]));
const resourceById = Object.fromEntries(rawRecursos.map((resource) => [resource.codigo, resource]));
const structureByProduct = Object.fromEntries(rawEstrutura.map((structure) => [structure.produto, structure.componentes]));

const priorityLabel = { normal: 'Normal', alta: 'Alta', baixa: 'Baixa' };
const requestStatusLabel = { pendente: 'Pendente', em_producao: 'Em produção', atendido: 'Atendido', cancelado: 'Cancelado' };

export const products = rawProdutos.map((product) => {
  const minutes = product.roteiro.reduce((sum, stage) => sum + stage.tempo_unitario_min, 0);
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return {
    code: product.codigo,
    name: product.descricao,
    line: product.linha_producao === 'pesada' ? 'Pesada' : 'Leve',
    lot: `${product.lote_minimo} un`,
    minimumLot: product.lote_minimo,
    steps: product.roteiro.length,
    time: `${hours ? `${hours} h ` : ''}${remainder ? `${remainder} min` : ''}`.trim(),
    materials: structureByProduct[product.codigo]?.length ?? 0,
    active: product.ativo,
    route: product.roteiro.map((stage) => ({
      sequence: stage.sequencia,
      resourceId: stage.recurso,
      resource: resourceById[stage.recurso]?.descricao ?? stage.recurso,
      minutes: stage.tempo_unitario_min,
    })),
    structure: (structureByProduct[product.codigo] ?? []).map((component) => ({
      ...component,
      materialInfo: materialById[component.material],
      stock: stockById[component.material],
    })),
  };
});

export const inventory = rawEstoque.map((stock) => {
  const material = materialById[stock.material];
  const free = stock.quantidade_disponivel - stock.quantidade_reservada;
  const status = free <= 0 ? 'Sem estoque' : free < stock.estoque_minimo ? 'Abaixo do mínimo' : 'Disponível';
  return {
    code: stock.material,
    name: material?.descricao ?? stock.material,
    type: material?.tipo === 'materia_prima' ? 'Matéria-prima' : material?.tipo === 'embalagem' ? 'Embalagem' : 'Componente',
    unit: material?.unidade_medida ?? '—',
    available: numberPt(stock.quantidade_disponivel),
    reserved: numberPt(stock.quantidade_reservada),
    free: numberPt(free),
    minimum: numberPt(stock.estoque_minimo),
    min: numberPt(stock.estoque_minimo),
    replenishment: material?.prazo_reposicao_dias ? `${material.prazo_reposicao_dias} dias` : '—',
    status,
    _freeValue: free,
    _minimumValue: stock.estoque_minimo,
    _raw: stock,
  };
});

const stockFree = (materialId) => {
  const stock = stockById[materialId];
  return stock ? stock.quantidade_disponivel - stock.quantidade_reservada : 0;
};

export const requests = rawPedidos.map((request) => {
  const product = productById[request.produto];
  const minimumLot = product?.lote_minimo ?? 1;
  const plannedQuantity = Math.ceil(request.quantidade / minimumLot) * minimumLot;
  const shortages = (structureByProduct[request.produto] ?? []).filter((component) => {
    const required = component.quantidade * plannedQuantity * (1 + (component.perda_percentual ?? 0) / 100);
    return required > stockFree(component.material);
  });
  return {
    id: request.numero,
    client: request.cliente,
    productId: request.produto,
    product: product?.descricao ?? request.produto,
    qty: request.quantidade,
    plannedQuantity,
    ordered: displayDate(request.data_pedido),
    delivery: displayDate(request.data_entrega),
    deliveryDate: request.data_entrega,
    priority: priorityLabel[request.prioridade] ?? request.prioridade,
    status: requestStatusLabel[request.status] ?? request.status,
    stock: shortages.length ? 'Falta' : 'Atendível',
    shortages,
    _raw: request,
  };
});

export const orders = rawOrdens.map((order) => {
  const product = productById[order.produto];
  const request = rawPedidos.find((item) => item.numero === order.pedido);
  const late = !order.data_conclusao && order.data_fim_prevista < referenceDate && order.quantidade_produzida < order.quantidade_planejada;
  const status = late ? 'Atrasada' : ({ concluida: 'Concluída', em_producao: 'Em produção', liberada: 'Liberada', planejada: 'Planejada', cancelada: 'Cancelada' }[order.status] ?? order.status);
  return {
    id: order.numero,
    productId: order.produto,
    product: product?.descricao ?? order.produto,
    request: order.pedido ?? 'Estoque',
    client: request?.cliente ?? 'Estoque',
    planned: order.quantidade_planejada,
    done: order.quantidade_produzida,
    start: displayDate(order.data_inicio_prevista),
    end: displayDate(order.data_fim_prevista),
    startDate: order.data_inicio_prevista,
    endDate: order.data_fim_prevista,
    priority: priorityLabel[order.prioridade] ?? order.prioridade,
    status,
    sequence: order.sequencia_programacao,
    note: order.observacao,
    late,
    route: product?.route ?? [],
    structure: product?.structure ?? [],
    _raw: order,
  };
});

const activeOrders = orders.filter((order) => !['Concluída', 'Cancelada'].includes(order.status));
export const resources = rawRecursos.map((resource) => {
  const remainingMinutes = activeOrders.reduce((sum, order) => {
    const remainingUnits = Math.max(0, order.planned - order.done);
    const minutes = order.route.find((stage) => stage.resourceId === resource.codigo)?.minutes ?? 0;
    return sum + remainingUnits * minutes;
  }, 0);
  const fiveDayCapacity = resource.capacidade_horas_dia * 5 * 60;
  const occupancy = resource.status === 'manutencao' ? 0 : Math.min(100, Math.round(remainingMinutes / fiveDayCapacity * 100));
  const productCount = rawProdutos.filter((product) => product.roteiro.some((stage) => stage.recurso === resource.codigo)).length;
  return {
    code: resource.codigo,
    name: resource.descricao,
    type: resource.tipo === 'posto_manual' ? 'Posto manual' : resource.tipo === 'equipe' ? 'Equipe' : 'Máquina',
    status: resource.status === 'manutencao' ? 'Manutenção' : 'Disponível',
    capacity: `${resource.capacidade_horas_dia} h/dia`,
    occupancy,
    products: `${productCount} de ${rawProdutos.length}`,
    _remainingMinutes: remainingMinutes,
  };
});

export const getProduct = (id) => products.find((item) => item.code === id);
export const getRequest = (id) => requests.find((item) => item.id === id);
export const getOrder = (id) => orders.find((item) => item.id === id);
export const getSummary = () => ({
  pendingRequests: requests.filter((item) => item.status === 'Pendente').length,
  openOrders: activeOrders.length,
  lateOrders: orders.filter((item) => item.late).length,
  lowInventory: inventory.filter((item) => item.status === 'Abaixo do mínimo').length,
});

export const dashboardSummary = getSummary();
export const openOrders = orders.filter((order) => !['Concluída', 'Cancelada'].includes(order.status));
export const lowInventoryItems = inventory.filter((item) => item.status !== 'Disponível');
export const ordersForSchedule = () => openOrders.toSorted((a, b) => a.sequence - b.sequence);
