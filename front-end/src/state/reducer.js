import { isOpenOrder } from '../domain/pcp.js';

export const nextOrderNumber = (orders) => {
  const max = orders.reduce((top, order) => Math.max(top, Number(order.numero.replace('OP-', '')) || 0), 0);
  return `OP-${String(max + 1).padStart(4, '0')}`;
};

const renumberOpenOrders = (orders, orderedIds) => {
  const pool = orders.filter(isOpenOrder).map((order) => order.sequencia_programacao).sort((a, b) => a - b);
  const position = new Map(orderedIds.map((id, index) => [id, pool[index]]));
  return orders.map((order) => (position.has(order.numero) ? { ...order, sequencia_programacao: position.get(order.numero) } : order));
};

const openIdsBySequence = (orders) =>
  orders.filter(isOpenOrder).sort((a, b) => a.sequencia_programacao - b.sequencia_programacao).map((order) => order.numero);

const appendNote = (current, text) => (current ? `${current} · ${text}` : text);

export function reducer(state, action) {
  const { db } = state;
  switch (action.type) {
    case 'setReferenceDate':
      return { ...state, referenceDate: action.value };

    case 'reorder': {
      const current = openIdsBySequence(db.ordens);
      const ids = action.ids.filter((id) => current.includes(id));
      if (ids.length !== current.length || new Set(ids).size !== ids.length) return state;
      return { ...state, db: { ...db, ordens: renumberOpenOrders(db.ordens, ids) }, dirty: true };
    }

    case 'createOrder': {
      const { pedido, produto, quantidade, prioridade, inicio, fim, observacao } = action.value;
      const sequence = Math.max(0, ...db.ordens.map((order) => order.sequencia_programacao)) + 1;
      const order = {
        numero: nextOrderNumber(db.ordens),
        produto,
        pedido: pedido ?? null,
        prioridade,
        sequencia_programacao: sequence,
        quantidade_planejada: quantidade,
        quantidade_produzida: 0,
        data_emissao: state.referenceDate,
        data_inicio_prevista: inicio,
        data_fim_prevista: fim,
        data_conclusao: null,
        status: 'planejada',
        observacao: observacao || null,
      };
      const pedidos = pedido ? db.pedidos.map((item) => (item.numero === pedido ? { ...item, status: 'em_producao' } : item)) : db.pedidos;
      return { ...state, db: { ...db, ordens: [...db.ordens, order], pedidos }, dirty: true, lastCreated: order.numero };
    }

    case 'reschedule': {
      const { numero, inicio, fim, prioridade, posicao, motivo } = action.value;
      let ordens = db.ordens.map((order) =>
        order.numero === numero
          ? { ...order, data_inicio_prevista: inicio, data_fim_prevista: fim, prioridade, observacao: motivo ? appendNote(order.observacao, motivo) : order.observacao }
          : order,
      );
      const ids = openIdsBySequence(ordens).filter((id) => id !== numero);
      if (!isOpenOrder(db.ordens.find((order) => order.numero === numero) ?? {})) return state;
      ids.splice(Math.max(0, Math.min(ids.length, posicao - 1)), 0, numero);
      ordens = renumberOpenOrders(ordens, ids);
      return { ...state, db: { ...db, ordens }, dirty: true };
    }

    case 'release':
      return {
        ...state,
        db: { ...db, ordens: db.ordens.map((order) => (order.numero === action.id && order.status === 'planejada' ? { ...order, status: 'liberada' } : order)) },
        dirty: true,
      };

    case 'cancel': {
      const target = db.ordens.find((order) => order.numero === action.id);
      const ordens = db.ordens.map((order) =>
        order.numero === action.id ? { ...order, status: 'cancelada', observacao: appendNote(order.observacao, action.reason || 'Ordem cancelada') } : order,
      );
      const stillLinked = target?.pedido && ordens.some((order) => order.pedido === target.pedido && isOpenOrder(order));
      const pedidos = target?.pedido && !stillLinked
        ? db.pedidos.map((item) => (item.numero === target.pedido && item.status === 'em_producao' ? { ...item, status: 'pendente' } : item))
        : db.pedidos;
      return { ...state, db: { ...db, ordens, pedidos }, dirty: true };
    }

    case 'registerProduction': {
      const { numero, quantidade, refugo, data } = action.value;
      let finishedRequest = null;
      const ordens = db.ordens.map((order) => {
        if (order.numero !== numero) return order;
        const produced = order.quantidade_produzida + quantidade;
        const done = produced + refugo >= order.quantidade_planejada;
        const notes = refugo ? appendNote(order.observacao, `${refugo} un refugada(s) em ${data.split('-').reverse().join('/')}`) : order.observacao;
        if (done && order.pedido) finishedRequest = { pedido: order.pedido, numero: order.numero };
        return {
          ...order,
          quantidade_produzida: produced,
          status: done ? 'concluida' : 'em_producao',
          data_conclusao: done ? data : null,
          observacao: notes,
        };
      });
      const otherOpen = finishedRequest && ordens.some((order) => order.pedido === finishedRequest.pedido && order.numero !== finishedRequest.numero && isOpenOrder(order));
      const pedidos = finishedRequest && !otherOpen
        ? db.pedidos.map((item) => (item.numero === finishedRequest.pedido ? { ...item, status: 'atendido' } : item))
        : db.pedidos;
      return { ...state, db: { ...db, ordens, pedidos }, dirty: true };
    }

    case 'reset':
      return { ...state, db: action.db, referenceDate: action.db.configuracao.data_referencia, dirty: false };

    default:
      return state;
  }
}

export const initialState = (db) => ({ db, referenceDate: db.configuracao.data_referencia, dirty: false, lastCreated: null });
