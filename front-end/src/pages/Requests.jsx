import { useMemo, useState } from 'react';
import { useNav, useStore } from '../state/context.js';
import { Badge, Card, Code, PageHeader, Priority, RequestStatus, SearchInput, Segmented, Table, Toolbar } from '../components/ui.jsx';
import { formatDate, labels } from '../domain/format.js';

const statusFilters = [
  { value: 'pendente', label: 'Pendentes' },
  { value: 'em_producao', label: 'Em produção' },
  { value: 'atendido', label: 'Atendidos' },
  { value: 'cancelado', label: 'Cancelados' },
  { value: 'todos', label: 'Todos' },
];

export default function Requests() {
  const { model } = useStore();
  const { go, matchesLine } = useNav();
  const [status, setStatus] = useState('pendente');
  const [priority, setPriority] = useState('todas');
  const [query, setQuery] = useState('');

  const inLine = model.requests.filter((request) => matchesLine(request.line));
  const rows = useMemo(
    () =>
      inLine
        .filter((request) => status === 'todos' || request.status === status)
        .filter((request) => priority === 'todas' || request.priority === priority)
        .filter((request) => `${request.id} ${request.client} ${request.productName}`.toLowerCase().includes(query.toLowerCase()))
        .sort((a, b) => a.deliveryDate.localeCompare(b.deliveryDate)),
    [inLine, status, priority, query],
  );

  return (
    <>
      <PageHeader
        eyebrow="Demanda"
        title="Pedidos de clientes"
        description="Cada pedido mostra se o estoque livre atende a quantidade a produzir, já arredondada pelo lote mínimo."
      />
      <Toolbar>
        <Segmented
          label="Situação do pedido"
          value={status}
          onChange={setStatus}
          options={statusFilters.map((filter) => ({
            ...filter,
            count: filter.value === 'todos' ? inLine.length : inLine.filter((request) => request.status === filter.value).length,
          }))}
        />
        <div className="toolbar-end">
          <select className="select" value={priority} onChange={(event) => setPriority(event.target.value)} aria-label="Prioridade">
            <option value="todas">Todas as prioridades</option>
            <option value="alta">Prioridade alta</option>
            <option value="normal">Prioridade normal</option>
            <option value="baixa">Prioridade baixa</option>
          </select>
          <SearchInput value={query} onChange={setQuery} placeholder="Buscar pedido, cliente ou produto" />
        </div>
      </Toolbar>
      <Card flush>
        <Table
          rows={rows}
          rowKey={(request) => request.id}
          onRowClick={(request) => go('pedido', request.id)}
          empty="Nenhum pedido encontrado com esses filtros."
          columns={[
            {
              key: 'id',
              label: 'Pedido',
              render: (request) => (
                <span className="cell-stack">
                  <Code>{request.id}</Code>
                  <span className="cell-strong">{request.client}</span>
                </span>
              ),
            },
            {
              key: 'product',
              label: 'Produto',
              render: (request) => (
                <span className="cell-stack">
                  <span className="cell-strong">{request.productName}</span>
                  <small>{labels.line[request.line]}</small>
                </span>
              ),
            },
            {
              key: 'qty',
              label: 'Quantidade',
              align: 'right',
              render: (request) => (
                <span className="cell-stack align-right">
                  {request.quantity} un
                  {request.plannedQuantity !== request.quantity && <small>produzir {request.plannedQuantity}</small>}
                </span>
              ),
            },
            {
              key: 'delivery',
              label: 'Entrega',
              render: (request) => (
                <span className="cell-stack">
                  {formatDate(request.deliveryDate)}
                  {['pendente', 'em_producao'].includes(request.status) && (
                    <small className={`nowrap ${request.daysToDelivery < 0 ? 'text-danger' : ''}`}>
                      {request.daysToDelivery < 0 ? `vencido há ${-request.daysToDelivery} dias` : `em ${request.daysToDelivery} dias`}
                    </small>
                  )}
                </span>
              ),
            },
            { key: 'priority', label: 'Prioridade', render: (request) => <Priority value={request.priority} /> },
            status === 'todos' && { key: 'status', label: 'Situação', render: (request) => <RequestStatus status={request.status} /> },
            {
              key: 'stock',
              label: 'Estoque',
              render: (request) =>
                request.pending ? (
                  request.fulfillable ? (
                    <Badge tone="success" icon="check">Atendível</Badge>
                  ) : (
                    <span className="cell-stack">
                      <Badge tone="danger" icon="alert">Falta material</Badge>
                      <small>{request.shortages.map((need) => need.name).join(', ')}</small>
                    </span>
                  )
                ) : request.linkedOrders.length ? (
                  <span className="muted">{request.linkedOrders.map((order) => order.id).join(', ')}</span>
                ) : (
                  <span className="muted">—</span>
                ),
            },
          ].filter(Boolean)}
        />
      </Card>
    </>
  );
}
