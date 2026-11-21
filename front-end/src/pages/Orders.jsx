import { useState } from 'react';
import { useNav, useStore } from '../state/context.js';
import { Button, Callout, Card, Code, OrderFlags, OrderStatus, PageHeader, Priority, Progress, SearchInput, Segmented, Table, Toolbar } from '../components/ui.jsx';
import { formatDate, remainingText } from '../domain/format.js';

const filters = {
  abertas: (order) => order.open,
  atencao: (order) => order.open && (order.late || order.dueRisk || order.blockedStages.length > 0),
  concluida: (order) => order.status === 'concluida',
  cancelada: (order) => order.status === 'cancelada',
  todas: () => true,
};

export default function Orders() {
  const { model } = useStore();
  const { go, matchesLine, openModal } = useNav();
  const [filter, setFilter] = useState('abertas');
  const [query, setQuery] = useState('');
  const inLine = model.orders.filter((order) => matchesLine(order.line));
  const rows = inLine
    .filter(filters[filter])
    .filter((order) => `${order.id} ${order.productName} ${order.requestId ?? 'estoque'} ${order.client ?? ''}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => (a.open === b.open ? a.sequence - b.sequence : a.open ? -1 : 1));
  const shortClosed = inLine.filter((order) => order.status === 'concluida' && order.produced < order.planned);

  return (
    <>
      <PageHeader
        eyebrow="Produção"
        title="Ordens de produção"
        description="Acompanhe a quantidade produzida, o prazo e a situação de cada ordem."
        actions={<Button variant="primary" icon="plus" onClick={() => openModal('createOrder')}>Nova ordem</Button>}
      />
      <Toolbar>
        <Segmented
          label="Filtro de ordens"
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'abertas', label: 'Abertas', count: inLine.filter(filters.abertas).length },
            { value: 'atencao', label: 'Atrasadas ou em risco', count: inLine.filter(filters.atencao).length },
            { value: 'concluida', label: 'Concluídas', count: inLine.filter(filters.concluida).length },
            { value: 'cancelada', label: 'Canceladas', count: inLine.filter(filters.cancelada).length },
            { value: 'todas', label: 'Todas', count: inLine.length },
          ]}
        />
        <div className="toolbar-end">
          <SearchInput value={query} onChange={setQuery} placeholder="Buscar ordem, produto ou pedido" />
        </div>
      </Toolbar>
      <Card flush>
        <Table
          rows={rows}
          rowKey={(order) => order.id}
          onRowClick={(order) => go('ordem', order.id)}
          rowClassName={(order) => (order.late ? 'is-danger' : '')}
          empty="Nenhuma ordem encontrada com esses filtros."
          columns={[
            { key: 'seq', label: 'Seq.', width: 52, render: (order) => (order.open ? <span className="seq">{order.position}</span> : <span className="muted">—</span>) },
            {
              key: 'order',
              label: 'Ordem',
              render: (order) => (
                <span className="cell-stack">
                  <Code>{order.id}</Code>
                  <span className="cell-strong">{order.productName}</span>
                  <small>{order.requestId ? `${order.requestId} · ${order.client}` : 'Ordem para estoque'}</small>
                </span>
              ),
            },
            {
              key: 'progress',
              label: 'Produzido',
              width: 150,
              render: (order) => (
                <span className="cell-stack">
                  <Progress value={order.progress} tone={order.status === 'cancelada' ? 'muted' : undefined} />
                  <small>
                    {order.produced} de {order.planned}
                    {order.open && order.remaining > 0 ? ` · ${remainingText(order.remaining, '').trim()}` : ''}
                  </small>
                </span>
              ),
            },
            {
              key: 'dates',
              label: 'Previsto',
              render: (order) => (
                <span className="cell-stack">
                  <span className="nowrap">
                    {formatDate(order.startDate)} → <span className={order.late ? 'text-danger' : ''}>{formatDate(order.endDate)}</span>
                  </span>
                  {order.deliveryDate && <small>entrega {formatDate(order.deliveryDate)}</small>}
                </span>
              ),
            },
            { key: 'priority', label: 'Prioridade', render: (order) => <Priority value={order.priority} /> },
            {
              key: 'status',
              label: 'Situação',
              render: (order) => (
                <span className="flag-group">
                  <OrderStatus status={order.status} />
                  <OrderFlags order={order} />
                </span>
              ),
            },
          ]}
        />
      </Card>
      {shortClosed.length > 0 && filter !== 'abertas' && (
        <Callout tone="info" title="Ordens concluídas com diferença">
          {shortClosed.map((order) => `${order.id}: ${order.produced} de ${order.planned} un${order.note ? ` (${order.note})` : ''}`).join(' · ')}
        </Callout>
      )}
    </>
  );
}
