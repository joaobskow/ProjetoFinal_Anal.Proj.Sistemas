import { useNav, useStore } from '../state/context.js';
import { Badge, Button, Callout, Card, Code, EmptyState, Facts, OrderStatus, PageHeader, Priority, Qty, RequestStatus, RouteSteps, Table } from '../components/ui.jsx';
import { formatDateLong, formatDuration, formatNumber, labels } from '../domain/format.js';

export default function RequestDetail({ id }) {
  const { model } = useStore();
  const { back, go, openModal } = useNav();
  const request = model.requestById.get(id);
  if (!request) return (
      <EmptyState icon="alert" title="Pedido não encontrado">
        <Button onClick={() => go('pedidos')}>Ver a lista</Button>
      </EmptyState>
    );

  const openOrders = request.linkedOrders.filter((order) => order.open);
  const canGenerate = request.pending;

  return (
    <>
      <PageHeader
        eyebrow="Pedidos"
        onBack={back}
        title={`Pedido ${request.id}`}
        meta={
          <>
            <RequestStatus status={request.status} />
            <Priority value={request.priority} />
          </>
        }
        description={`${request.client} · ${request.productName}`}
        actions={
          canGenerate ? (
            <Button variant="primary" icon="plus" onClick={() => openModal('createOrder', { requestId: request.id })}>
              Gerar ordem de produção
            </Button>
          ) : (
            openOrders[0] && (
              <Button icon="orders" onClick={() => go('ordem', openOrders[0].id)}>
                Ver ordem {openOrders[0].id}
              </Button>
            )
          )
        }
      />

      {request.pending &&
        (request.fulfillable ? (
          <Callout tone="success" title="Pedido atendível com o estoque livre">
            Todos os {request.needs.length} materiais têm saldo livre suficiente para produzir {request.plannedQuantity} un.
          </Callout>
        ) : (
          <Callout tone="danger" title={`Falta de material para produzir ${request.plannedQuantity} un`}>
            {request.shortages.map((need) => `${need.name}: faltam ${formatNumber(need.missing)} ${need.unit}`).join(' · ')}.
          </Callout>
        ))}
      {request.pending && request.blockedStages.length > 0 && (
        <Callout tone="warning" icon="wrench" title="O roteiro usa um recurso em manutenção">
          {request.blockedStages.map((stage) => stage.resourceName).join(', ')} está parado. A ordem pode ser gerada, mas não deve ser liberada antes da volta do recurso.
        </Callout>
      )}

      <Card>
        <Facts
          columns={4}
          items={[
            ['Cliente', request.client],
            ['Produto', `${request.productId} · ${request.productName}`],
            ['Linha', labels.line[request.line]],
            ['Pedido em', formatDateLong(request.orderedAt)],
            ['Quantidade pedida', `${request.quantity} un`],
            ['Quantidade a produzir', `${request.plannedQuantity} un${request.plannedQuantity !== request.quantity ? ` (lote mínimo ${request.minimumLot})` : ''}`],
            ['Tempo total de fabricação', formatDuration(request.routeMinutes)],
            ['Entrega prometida', `${formatDateLong(request.deliveryDate)}${request.daysToDelivery >= 0 ? ` · em ${request.daysToDelivery} dias` : ''}`],
          ]}
        />
      </Card>

      <div className="grid-main-side">
        <Card
          title="Necessidade de materiais"
          description={`Para ${request.plannedQuantity} un · necessidade = quantidade × consumo por unidade × (1 + perda)`}
          flush
        >
          <Table
            rows={request.needs}
            rowKey={(need) => need.materialId}
            rowClassName={(need) => (need.shortage && request.pending ? 'is-danger' : '')}
            columns={[
              {
                key: 'name',
                label: 'Material',
                render: (need) => (
                  <span className="cell-stack">
                    <span className="cell-strong">{need.name}</span>
                    <small>
                      {need.materialId} · {labels.materialType[need.type]}
                    </small>
                  </span>
                ),
              },
              { key: 'perUnit', label: 'Por unidade', align: 'right', render: (need) => <Qty value={need.perUnit} unit={need.unit} /> },
              { key: 'loss', label: 'Perda', align: 'right', render: (need) => (need.loss ? `${formatNumber(need.loss)}%` : '—') },
              { key: 'required', label: 'Necessário', align: 'right', render: (need) => <Qty value={need.required} unit={need.unit} /> },
              { key: 'free', label: 'Saldo livre', align: 'right', render: (need) => <Qty value={need.free} unit={need.unit} tone={need.shortage ? 'danger' : undefined} /> },
              {
                key: 'status',
                label: '',
                render: (need) =>
                  need.shortage ? (
                    <Badge tone="danger">Faltam {formatNumber(need.missing)}</Badge>
                  ) : (
                    <Badge tone="success" icon="check">OK</Badge>
                  ),
              },
            ]}
          />
        </Card>

        <div className="stack">
          <Card title="Roteiro de fabricação" description={`Horas por etapa para ${request.plannedQuantity} un`}>
            <RouteSteps route={request.route} quantity={request.plannedQuantity} />
          </Card>
          <Card title="Ordens vinculadas" flush>
            {request.linkedOrders.length ? (
              <Table
                rows={request.linkedOrders}
                rowKey={(order) => order.id}
                onRowClick={(order) => go('ordem', order.id)}
                columns={[
                  { key: 'id', label: 'Ordem', render: (order) => <Code>{order.id}</Code> },
                  { key: 'qty', label: 'Qtd', align: 'right', render: (order) => `${order.produced}/${order.planned}` },
                  { key: 'status', label: 'Situação', render: (order) => <OrderStatus status={order.status} /> },
                ]}
              />
            ) : (
              <EmptyState icon="orders" title="Nenhuma ordem gerada">Gere uma ordem para programar a produção deste pedido.</EmptyState>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
