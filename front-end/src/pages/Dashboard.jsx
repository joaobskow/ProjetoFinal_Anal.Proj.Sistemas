import { useNav, useStore } from '../state/context.js';
import { Button, Card, Code, EmptyState, Kpi, OrderFlags, OrderStatus, PageHeader, Progress, Table } from '../components/ui.jsx';
import Gantt from '../components/Gantt.jsx';
import Icon from '../components/Icon.jsx';
import { formatDate, formatDateLong, formatDays, formatHours, labels, plural } from '../domain/format.js';

const alertIcon = {
  'Falta de material': 'inventory',
  'Ordem atrasada': 'clock',
  'Prazo do pedido': 'alert',
  'Recurso indisponível': 'wrench',
  'Estoque abaixo do mínimo': 'inventory',
};

export default function Dashboard() {
  const { model } = useStore();
  const { go, matchesLine, line, openModal } = useNav();
  const orders = model.openOrders.filter((order) => matchesLine(order.line));
  const pending = model.requests.filter((request) => request.pending && matchesLine(request.line));
  const shortages = pending.filter((request) => !request.fulfillable);
  const late = orders.filter((order) => order.late);
  const atRisk = orders.filter((order) => !order.late && (order.dueRisk || order.blockedStages.length));
  const lowStock = model.inventory.filter((item) => item.belowMinimum);
  const alerts = model.alerts.filter((alert) => alert.line == null || matchesLine(alert.line));
  const lineLabel = line === 'todas' ? 'todas as linhas' : labels.line[line].toLowerCase();

  return (
    <>
      <PageHeader
        eyebrow="Visão geral do PCP"
        title="Situação da produção"
        description={`Programação, andamento e restrições de ${lineLabel} em ${formatDateLong(model.referenceDate)}.`}
        actions={
          <>
            <Button icon="schedule" onClick={() => go('programacao')}>Abrir programação</Button>
            <Button variant="primary" icon="plus" onClick={() => openModal('createOrder')}>Nova ordem</Button>
          </>
        }
      />

      <div className="kpi-grid">
        <Kpi
          icon="requests"
          label="Pedidos pendentes"
          value={pending.length}
          detail={shortages.length ? `${plural(shortages.length, 'com falta', 'com falta')} de material` : 'Todos atendíveis com o estoque'}
          tone={shortages.length ? 'danger' : 'neutral'}
          onClick={() => go('pedidos')}
        />
        <Kpi
          icon="orders"
          label="Ordens abertas"
          value={orders.length}
          detail={`${orders.filter((order) => order.status === 'em_producao').length} em produção · ${orders.filter((order) => order.status === 'liberada').length} liberadas · ${orders.filter((order) => order.status === 'planejada').length} planejadas`}
          onClick={() => go('ordens')}
        />
        <Kpi
          icon="clock"
          label="Atrasadas ou em risco"
          value={late.length + atRisk.length}
          detail={`${plural(late.length, 'atrasada')} · ${atRisk.length} em risco`}
          tone={late.length ? 'danger' : atRisk.length ? 'warning' : 'success'}
          onClick={() => go('ordens')}
        />
        <Kpi
          icon="inventory"
          label="Abaixo do estoque mínimo"
          value={lowStock.length}
          detail={lowStock.map((item) => item.name).join(', ') || 'Nenhum material abaixo do mínimo'}
          tone={lowStock.length ? 'warning' : 'success'}
          onClick={() => go('estoque')}
        />
      </div>

      <div className="grid-main-side">
        <Card
          title="Programação das ordens abertas"
          description="Barras do início ao fim previsto; o losango marca a entrega prometida ao cliente."
          actions={<Button size="sm" variant="ghost" icon="chevronRight" onClick={() => go('programacao')}>Sequenciar</Button>}
        >
          {orders.length ? (
            <Gantt orders={orders} referenceDate={model.referenceDate} onOpen={(order) => go('ordem', order.id)} compact />
          ) : (
            <EmptyState title="Nenhuma ordem aberta">Não há ordens abertas para esta linha.</EmptyState>
          )}
        </Card>

        <Card title="Requer atenção" description={alerts.length ? plural(alerts.length, 'ponto', 'pontos') + ' para resolver' : undefined} className="attention-card">
          {alerts.length ? (
            <ul className="attention-list">
              {alerts.map((alert) => (
                <li key={alert.id}>
                  <button type="button" className={`attention-item tone-${alert.tone}`} onClick={() => go(alert.target.page, alert.target.id)}>
                    <span className="attention-icon">
                      <Icon name={alertIcon[alert.kind] ?? 'alert'} size={16} />
                    </span>
                    <span className="attention-text">
                      <small>{alert.kind}</small>
                      <strong>{alert.title}</strong>
                      <span>{alert.text}</span>
                    </span>
                    <Icon name="chevronRight" size={16} className="attention-arrow" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="Tudo em dia">Nenhuma falta, atraso ou restrição encontrada.</EmptyState>
          )}
        </Card>
      </div>

      <div className="grid-two">
        <Card title="Andamento das ordens" description="Quantidade produzida sobre a planejada, na sequência de execução" flush>
          <Table
            rows={orders}
            rowKey={(order) => order.id}
            onRowClick={(order) => go('ordem', order.id)}
            empty="Nenhuma ordem aberta."
            columns={[
              { key: 'seq', label: '#', width: 40, render: (order) => <span className="seq">{order.position}</span> },
              {
                key: 'order',
                label: 'Ordem',
                render: (order) => (
                  <span className="cell-stack">
                    <Code>{order.id}</Code>
                    <small>{order.productName}</small>
                  </span>
                ),
              },
              {
                key: 'progress',
                label: 'Produzido',
                width: 170,
                render: (order) => (
                  <span className="cell-stack">
                    <Progress value={order.progress} />
                    <small>
                      {order.produced} de {order.planned} un
                    </small>
                  </span>
                ),
              },
              { key: 'end', label: 'Fim', render: (order) => <span className={order.late ? 'text-danger' : ''}>{formatDate(order.endDate)}</span> },
              { key: 'status', label: 'Situação', render: (order) => <span className="flag-group"><OrderStatus status={order.status} /><OrderFlags order={order} /></span> },
            ]}
          />
        </Card>

        <Card title="Carga dos recursos" description="Horas restantes das ordens abertas em cada recurso" flush>
          <ul className="load-list">
            {model.resources.map((resource) => {
              const minutes = line === 'todas' ? resource.loadMinutes : resource.loadByLine[line] ?? 0;
              const days = minutes / (resource.capacityHours * 60);
              return (
                <li key={resource.id} className={resource.available ? '' : 'is-stopped'}>
                  <div className="load-head">
                    <strong>{resource.name}</strong>
                    <span>
                      {resource.available ? (
                        <>
                          {formatHours(minutes)} <small>· {formatDays(days)} de trabalho</small>
                        </>
                      ) : (
                        <span className="text-danger">
                          <Icon name="wrench" size={13} /> Em manutenção · {formatHours(minutes)} aguardando
                        </span>
                      )}
                    </span>
                  </div>
                  <Progress value={Math.min(1, days / 5)} tone={resource.available ? (days > 5 ? 'danger' : days > 3 ? 'warning' : 'primary') : 'danger'} showLabel={false} size="sm" />
                </li>
              );
            })}
          </ul>
          <p className="card-footnote">Escala da barra: 5 dias úteis da capacidade diária do recurso.</p>
        </Card>
      </div>
    </>
  );
}
