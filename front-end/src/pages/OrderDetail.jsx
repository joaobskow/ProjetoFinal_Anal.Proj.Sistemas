import { useNav, useStore } from '../state/context.js';
import { Badge, Button, Callout, Card, EmptyState, Facts, OrderFlags, OrderStatus, PageHeader, Priority, Qty, RouteSteps, Table } from '../components/ui.jsx';
import { formatDateLong, formatNumber, labels, plural, remainingText } from '../domain/format.js';

function ProgressRing({ value }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  return (
    <svg className="ring" viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r={radius} className="ring-track" />
      <circle cx="50" cy="50" r={radius} className="ring-fill" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - value)} />
    </svg>
  );
}

export default function OrderDetail({ id }) {
  const { model, act } = useStore();
  const { back, go, openModal, notify } = useNav();
  const order = model.orderById.get(id);
  if (!order) return (
      <EmptyState icon="alert" title="Ordem não encontrada">
        <Button onClick={() => go('ordens')}>Ver a lista</Button>
      </EmptyState>
    );

  const reserved = ['liberada', 'em_producao'].includes(order.status);
  const needs = order.open ? model.needsFor(order.productId, order.remaining) : order.needs;
  const checkStock = order.status === 'planejada';
  const shortages = checkStock ? needs.filter((need) => need.shortage) : [];
  const percent = Math.round(order.progress * 100);

  return (
    <>
      <PageHeader
        eyebrow="Ordens de produção"
        onBack={back}
        title={`Ordem ${order.id}`}
        meta={
          <>
            <OrderStatus status={order.status} />
            <OrderFlags order={order} />
          </>
        }
        description={`${order.productName} · ${order.requestId ? `pedido ${order.requestId} · ${order.client}` : 'ordem para estoque'}`}
        actions={
          order.open && (
            <>
              <Button
                variant="ghost-danger"
                icon="ban"
                onClick={() => openModal('cancel', { orderId: order.id })}
              >
                Cancelar
              </Button>
              <Button icon="calendar" onClick={() => openModal('reschedule', { orderId: order.id })}>Reprogramar</Button>
              {order.status === 'planejada' ? (
                <Button
                  variant="primary"
                  icon="play"
                  onClick={() => {
                    act('release', { id: order.id });
                    notify(`Ordem ${order.id} liberada para a produção.`);
                  }}
                >
                  Liberar ordem
                </Button>
              ) : (
                <Button variant="primary" icon="check" onClick={() => openModal('register', { orderId: order.id })}>Registrar produção</Button>
              )}
            </>
          )
        }
      />

      {order.late && (
        <Callout tone="danger" icon="clock" title={`Atrasada há ${plural(Math.abs(order.daysToEnd), 'dia')}`}>
          O fim previsto era {formatDateLong(order.endDate)} e ainda {remainingText(order.remaining)}.
          {order.blockedStages.length > 0 && ` O roteiro depende de ${order.blockedStages.map((stage) => stage.resourceName.toLowerCase()).join(', ')}, que está em manutenção.`}
        </Callout>
      )}
      {!order.late && order.blockedStages.length > 0 && (
        <Callout tone="warning" icon="wrench" title="Recurso do roteiro em manutenção">
          {order.blockedStages.map((stage) => stage.resourceName).join(', ')} está parado. Confirme a volta do recurso antes de {formatDateLong(order.endDate)} ou reprograme.
        </Callout>
      )}
      {order.dueRisk && (
        <Callout tone="warning" title="Conclusão prevista depois da entrega">
          Fim previsto em {formatDateLong(order.endDate)}, mas o pedido {order.requestId} deve ser entregue em {formatDateLong(order.deliveryDate)}.
        </Callout>
      )}

      <div className="order-summary">
        <Card className="order-progress-card">
          <div className="order-progress">
            <div className="ring-wrap">
              <ProgressRing value={order.progress} />
              <span className="ring-label">
                <strong>{percent}%</strong>
                <small>concluído</small>
              </span>
            </div>
            <dl className="order-numbers">
              <div>
                <dt>Planejado</dt>
                <dd>{order.planned} un</dd>
              </div>
              <div>
                <dt>Produzido</dt>
                <dd>{order.produced} un</dd>
              </div>
              <div>
                <dt>Restante</dt>
                <dd>{order.remaining} un</dd>
              </div>
            </dl>
          </div>
          {order.note && <p className="order-note">{order.note}</p>}
        </Card>
        <Card>
          <Facts
            columns={3}
            items={[
              ['Produto', `${order.productId} · ${order.productName}`],
              ['Linha', labels.line[order.line]],
              ['Prioridade', <Priority key="p" value={order.priority} />],
              ['Emissão', formatDateLong(order.issuedAt)],
              ['Início previsto', formatDateLong(order.startDate)],
              ['Fim previsto', formatDateLong(order.endDate)],
              ['Entrega do pedido', order.deliveryDate ? formatDateLong(order.deliveryDate) : 'Sem pedido (estoque)'],
              ['Posição na programação', order.open ? `${order.position}ª de ${model.openOrders.length}` : '—'],
              ['Conclusão', order.finishedAt ? formatDateLong(order.finishedAt) : '—'],
            ]}
          />
        </Card>
      </div>

      <div className="grid-main-side">
        <Card
          title="Materiais da ordem"
          description={
            checkStock
              ? `Necessidade para ${order.remaining} un comparada ao saldo livre`
              : reserved
                ? `Necessidade para as ${order.remaining} un restantes, já reservada no estoque`
                : `Consumo previsto para ${order.planned} un`
          }
          flush
          actions={shortages.length > 0 && <Badge tone="danger">{shortages.length} em falta</Badge>}
        >
          <Table
            rows={needs}
            rowKey={(need) => need.materialId}
            columns={[
              {
                key: 'name',
                label: 'Material',
                render: (need) => (
                  <span className="cell-stack">
                    <span className="cell-strong">{need.name}</span>
                    <small>{need.materialId}</small>
                  </span>
                ),
              },
              { key: 'required', label: 'Necessário', align: 'right', render: (need) => <Qty value={need.required} unit={need.unit} /> },
              { key: 'free', label: 'Saldo livre', align: 'right', render: (need) => <Qty value={need.free} unit={need.unit} tone={checkStock && need.shortage ? 'danger' : undefined} /> },
              {
                key: 'status',
                label: '',
                render: (need) =>
                  checkStock ? (
                    need.shortage ? <Badge tone="danger">Faltam {formatNumber(need.missing)}</Badge> : <Badge tone="success" icon="check">OK</Badge>
                  ) : reserved ? (
                    <Badge tone="info">Reservado</Badge>
                  ) : null,
              },
            ]}
          />
        </Card>
        <div className="stack">
          <Card title="Roteiro" description={order.open ? `Horas para as ${order.remaining} un restantes` : 'Etapas de fabricação'}>
            <RouteSteps route={order.route} quantity={order.open ? order.remaining : undefined} />
          </Card>
          {order.requestId && (
            <Button icon="requests" onClick={() => go('pedido', order.requestId)}>
              Abrir pedido {order.requestId}
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
