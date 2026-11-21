import { useNav, useStore } from '../state/context.js';
import { Badge, Callout, Card, Code, PageHeader, Progress, Table } from '../components/ui.jsx';
import Icon from '../components/Icon.jsx';
import { formatDays, formatHours, labels, plural } from '../domain/format.js';

const typeIcon = { maquina: 'factoryGear', posto_manual: 'wrench', equipe: 'resources' };

export default function Resources() {
  const { model } = useStore();
  const { go, line } = useNav();
  const stopped = model.resources.filter((resource) => !resource.available);
  const minutesFor = (resource) => (line === 'todas' ? resource.loadMinutes : resource.loadByLine[line] ?? 0);

  return (
    <>
      <PageHeader
        eyebrow="Cadastros"
        title="Recursos produtivos"
        description="Capacidade diária e carga restante das ordens abertas. Os recursos são compartilhados pelas duas linhas, então a capacidade é contada uma única vez."
      />

      {stopped.map((resource) => (
        <Callout key={resource.id} tone="danger" icon="wrench" title={`${resource.name} ${labels.resourceStatus[resource.status].toLowerCase()}`}>
          {resource.productCount} de {model.products.length} produtos passam por este recurso.{' '}
          {resource.waitingOrders.length
            ? `${plural(resource.waitingOrders.length, 'ordem aberta depende', 'ordens abertas dependem')} dele: ${resource.waitingOrders.map((order) => order.id).join(', ')}.`
            : 'Nenhuma ordem aberta depende dele agora.'}
        </Callout>
      ))}

      <div className="resource-grid">
        {model.resources.map((resource) => {
          const minutes = minutesFor(resource);
          const days = minutes / (resource.capacityHours * 60);
          return (
            <article key={resource.id} className={`resource-card ${resource.available ? '' : 'is-stopped'}`}>
              <header>
                <span className="resource-icon">
                  <Icon name={typeIcon[resource.type] ?? 'resources'} size={18} />
                </span>
                <div>
                  <strong>{resource.name}</strong>
                  <small>
                    {resource.id} · {labels.resourceType[resource.type]}
                  </small>
                </div>
              </header>
              {resource.available ? <Badge tone="success">Disponível</Badge> : <Badge tone="danger" icon="wrench">{labels.resourceStatus[resource.status]}</Badge>}
              <dl>
                <div>
                  <dt>Capacidade</dt>
                  <dd>{resource.capacityHours} h/dia</dd>
                </div>
                <div>
                  <dt>Carga restante</dt>
                  <dd>{formatHours(minutes)}</dd>
                </div>
              </dl>
              <div className="resource-load">
                <span>{resource.available ? `${formatDays(days)} de trabalho` : 'Sem capacidade enquanto parado'}</span>
                <Progress value={resource.available ? Math.min(1, days / 5) : 1} tone={resource.available ? (days > 5 ? 'danger' : days > 3 ? 'warning' : 'primary') : 'danger'} showLabel={false} size="sm" />
              </div>
              <small className="muted">Usado por {resource.productCount} de {model.products.length} produtos</small>
            </article>
          );
        })}
      </div>

      <Card title="Carga por linha de produção" description="Horas restantes das ordens abertas, separadas pela linha do produto" flush>
        <Table
          rows={model.resources}
          rowKey={(resource) => resource.id}
          columns={[
            {
              key: 'name',
              label: 'Recurso',
              render: (resource) => (
                <span className="cell-stack">
                  <span className="cell-strong">{resource.name}</span>
                  <small>{resource.capacityHours} h/dia</small>
                </span>
              ),
            },
            { key: 'pesada', label: 'Linha pesada', align: 'right', render: (resource) => formatHours(resource.loadByLine.pesada ?? 0) },
            { key: 'leve', label: 'Linha leve', align: 'right', render: (resource) => formatHours(resource.loadByLine.leve ?? 0) },
            { key: 'total', label: 'Total', align: 'right', render: (resource) => <strong>{formatHours(resource.loadMinutes)}</strong> },
            { key: 'days', label: 'Dias de carga', align: 'right', render: (resource) => (resource.available ? formatDays(resource.loadDays) : '—') },
            {
              key: 'orders',
              label: 'Ordens na fila',
              render: (resource) =>
                resource.waitingOrders.length ? (
                  <span className="chip-list">
                    {resource.waitingOrders.map((order) => (
                      <button type="button" key={order.id} className="chip" onClick={() => go('ordem', order.id)}>
                        <Code>{order.id}</Code>
                      </button>
                    ))}
                  </span>
                ) : (
                  <span className="muted">—</span>
                ),
            },
            { key: 'status', label: 'Situação', render: (resource) => (resource.available ? <Badge tone="success">Disponível</Badge> : <Badge tone="danger">Parado</Badge>) },
          ]}
        />
      </Card>
    </>
  );
}
