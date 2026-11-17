import { daysBetween, formatDate, plural } from './format.js';

const OPEN_ORDER_STATUSES = ['planejada', 'liberada', 'em_producao'];

export const isOpenOrder = (order) => OPEN_ORDER_STATUSES.includes(order.status);
export const plannedQuantityFor = (quantity, minimumLot) => Math.ceil(quantity / minimumLot) * minimumLot;
export const requiredQuantity = (component, quantity) =>
  quantity * component.quantidade * (1 + (component.perda_percentual ?? 0) / 100);

export function buildModel(db, referenceDate) {
  const materialById = new Map(db.materiais.map((material) => [material.codigo, material]));
  const stockById = new Map(db.estoque.map((stock) => [stock.material, stock]));
  const resourceById = new Map(db.recursos.map((resource) => [resource.codigo, resource]));
  const structureByProduct = new Map(db.estrutura.map((entry) => [entry.produto, entry.componentes]));
  const requestById = new Map(db.pedidos.map((request) => [request.numero, request]));

  const freeStock = (materialId) => {
    const stock = stockById.get(materialId);
    return stock ? stock.quantidade_disponivel - stock.quantidade_reservada : 0;
  };

  const inventory = db.estoque.map((stock) => {
    const material = materialById.get(stock.material) ?? {};
    const free = stock.quantidade_disponivel - stock.quantidade_reservada;
    const belowMinimum = stock.quantidade_disponivel < stock.estoque_minimo;
    const empty = stock.quantidade_disponivel === 0;
    return {
      id: stock.material,
      name: material.descricao ?? stock.material,
      type: material.tipo,
      unit: material.unidade_medida ?? '',
      leadTime: material.prazo_reposicao_dias ?? null,
      available: stock.quantidade_disponivel,
      reserved: stock.quantidade_reservada,
      free,
      minimum: stock.estoque_minimo,
      updatedAt: stock.data_atualizacao,
      belowMinimum,
      empty,
      usedBy: db.estrutura.filter((entry) => entry.componentes.some((component) => component.material === stock.material)).map((entry) => entry.produto),
    };
  });
  const inventoryById = new Map(inventory.map((item) => [item.id, item]));

  const products = db.produtos.map((product) => {
    const route = [...product.roteiro]
      .sort((a, b) => a.sequencia - b.sequencia)
      .map((stage) => {
        const resource = resourceById.get(stage.recurso);
        return {
          sequence: stage.sequencia,
          resourceId: stage.recurso,
          resourceName: resource?.descricao ?? stage.recurso,
          resourceStatus: resource?.status ?? 'inativo',
          minutes: stage.tempo_unitario_min,
        };
      });
    const bom = (structureByProduct.get(product.codigo) ?? []).map((component) => ({
      materialId: component.material,
      name: materialById.get(component.material)?.descricao ?? component.material,
      type: materialById.get(component.material)?.tipo,
      unit: materialById.get(component.material)?.unidade_medida ?? '',
      perUnit: component.quantidade,
      loss: component.perda_percentual ?? 0,
      raw: component,
    }));
    return {
      id: product.codigo,
      name: product.descricao,
      unit: product.unidade_medida,
      minimumLot: product.lote_minimo,
      active: product.ativo,
      line: product.linha_producao ?? null,
      route,
      bom,
      unitMinutes: route.reduce((sum, stage) => sum + stage.minutes, 0),
      blockedStages: route.filter((stage) => stage.resourceStatus !== 'disponivel'),
    };
  });
  const productById = new Map(products.map((product) => [product.id, product]));

  const needsFor = (productId, quantity) =>
    (productById.get(productId)?.bom ?? []).map((component) => {
      const required = requiredQuantity(component.raw, quantity);
      const free = freeStock(component.materialId);
      return { ...component, required, free, missing: Math.max(0, required - free), shortage: required > free + 1e-9 };
    });

  const orders = db.ordens.map((order) => {
    const product = productById.get(order.produto);
    const request = order.pedido ? requestById.get(order.pedido) : null;
    const open = isOpenOrder(order);
    const remaining = Math.max(0, order.quantidade_planejada - order.quantidade_produzida);
    const progress = order.quantidade_planejada ? Math.min(1, order.quantidade_produzida / order.quantidade_planejada) : 0;
    const late = open && order.data_fim_prevista < referenceDate;
    const dueRisk = Boolean(open && request && order.data_fim_prevista > request.data_entrega);
    const blockedStages = open ? product?.blockedStages ?? [] : [];
    const daysToEnd = daysBetween(referenceDate, order.data_fim_prevista);
    return {
      id: order.numero,
      raw: order,
      productId: order.produto,
      productName: product?.name ?? order.produto,
      line: product?.line ?? null,
      requestId: order.pedido,
      client: request?.cliente ?? null,
      deliveryDate: request?.data_entrega ?? null,
      priority: order.prioridade,
      sequence: order.sequencia_programacao,
      planned: order.quantidade_planejada,
      produced: order.quantidade_produzida,
      remaining,
      progress,
      issuedAt: order.data_emissao,
      startDate: order.data_inicio_prevista,
      endDate: order.data_fim_prevista,
      finishedAt: order.data_conclusao,
      status: order.status,
      note: order.observacao,
      open,
      late,
      dueRisk,
      blockedStages,
      daysToEnd,
      route: product?.route ?? [],
      needs: needsFor(order.produto, order.quantidade_planejada),
      remainingMinutesByResource: Object.fromEntries((product?.route ?? []).map((stage) => [stage.resourceId, open ? remaining * stage.minutes : 0])),
    };
  });
  const orderById = new Map(orders.map((order) => [order.id, order]));
  const openOrders = orders.filter((order) => order.open).sort((a, b) => a.sequence - b.sequence);
  openOrders.forEach((order, index) => {
    order.position = index + 1;
  });

  const requests = db.pedidos.map((request) => {
    const product = productById.get(request.produto);
    const plannedQuantity = plannedQuantityFor(request.quantidade, product?.minimumLot ?? 1);
    const needs = needsFor(request.produto, plannedQuantity);
    const shortages = needs.filter((need) => need.shortage);
    const linkedOrders = orders.filter((order) => order.requestId === request.numero);
    const pending = request.status === 'pendente';
    return {
      id: request.numero,
      raw: request,
      client: request.cliente,
      productId: request.produto,
      productName: product?.name ?? request.produto,
      line: product?.line ?? null,
      quantity: request.quantidade,
      plannedQuantity,
      minimumLot: product?.minimumLot ?? 1,
      orderedAt: request.data_pedido,
      deliveryDate: request.data_entrega,
      daysToDelivery: daysBetween(referenceDate, request.data_entrega),
      priority: request.prioridade,
      status: request.status,
      pending,
      needs,
      shortages,
      fulfillable: shortages.length === 0,
      linkedOrders,
      blockedStages: product?.blockedStages ?? [],
      routeMinutes: (product?.unitMinutes ?? 0) * plannedQuantity,
      route: product?.route ?? [],
    };
  });

  const resources = db.recursos.map((resource) => {
    const loadMinutes = openOrders.reduce((sum, order) => sum + (order.remainingMinutesByResource[resource.codigo] ?? 0), 0);
    const loadByLine = openOrders.reduce((acc, order) => {
      const minutes = order.remainingMinutesByResource[resource.codigo] ?? 0;
      if (minutes && order.line) acc[order.line] = (acc[order.line] ?? 0) + minutes;
      return acc;
    }, {});
    const dailyMinutes = resource.capacidade_horas_dia * 60;
    const available = resource.status === 'disponivel';
    return {
      id: resource.codigo,
      name: resource.descricao,
      type: resource.tipo,
      status: resource.status,
      available,
      line: resource.linha_producao ?? 'ambas',
      capacityHours: resource.capacidade_horas_dia,
      loadMinutes,
      loadByLine,
      loadDays: dailyMinutes ? loadMinutes / dailyMinutes : 0,
      waitingOrders: openOrders.filter((order) => order.remainingMinutesByResource[resource.codigo]),
      productCount: products.filter((product) => product.route.some((stage) => stage.resourceId === resource.codigo)).length,
    };
  });

  const alerts = [
    ...requests.filter((request) => request.pending && !request.fulfillable).map((request) => ({
      id: `shortage-${request.id}`,
      tone: 'danger',
      kind: 'Falta de material',
      title: `${request.id} · ${request.productName}`,
      text: request.shortages.map((need) => `${need.name}: faltam ${formatMissing(need)}`).join(' · '),
      target: { page: 'pedido', id: request.id },
      line: request.line,
    })),
    ...openOrders.filter((order) => order.late).map((order) => ({
      id: `late-${order.id}`,
      tone: 'danger',
      kind: 'Ordem atrasada',
      title: `${order.id} · ${order.productName}`,
      text: `Fim previsto em ${formatDate(order.endDate)} · ${plural(Math.abs(order.daysToEnd), 'dia')} de atraso · ${plural(order.remaining, 'unidade')} a produzir`,
      target: { page: 'ordem', id: order.id },
      line: order.line,
    })),
    ...openOrders.filter((order) => order.dueRisk).map((order) => ({
      id: `due-${order.id}`,
      tone: 'warning',
      kind: 'Prazo do pedido',
      title: `${order.id} · ${order.requestId}`,
      text: 'O fim previsto da ordem é posterior à entrega prometida ao cliente.',
      target: { page: 'ordem', id: order.id },
      line: order.line,
    })),
    ...openOrders.filter((order) => order.blockedStages.length && !order.late).map((order) => ({
      id: `blocked-${order.id}`,
      tone: 'warning',
      kind: 'Recurso indisponível',
      title: `${order.id} · ${order.productName}`,
      text: `Depende de ${order.blockedStages.map((stage) => stage.resourceName.toLowerCase()).join(', ')}, que está em manutenção.`,
      target: { page: 'ordem', id: order.id },
      line: order.line,
    })),
    ...inventory.filter((item) => item.belowMinimum).map((item) => ({
      id: `stock-${item.id}`,
      tone: 'warning',
      kind: 'Estoque abaixo do mínimo',
      title: item.name,
      text: `${formatQty(item.available, item.unit)} em estoque para mínimo de ${formatQty(item.minimum, item.unit)}`,
      target: { page: 'estoque' },
      line: null,
    })),
  ];

  return {
    referenceDate,
    products,
    productById,
    inventory,
    inventoryById,
    orders,
    orderById,
    openOrders,
    requests,
    requestById: new Map(requests.map((request) => [request.id, request])),
    resources,
    alerts,
    needsFor,
  };
}

const qtyFormat = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });
const formatQty = (value, unit) => `${qtyFormat.format(value)} ${unit}`.trim();
const formatMissing = (need) => formatQty(need.missing, need.unit);
