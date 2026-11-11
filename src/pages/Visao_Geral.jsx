import { getSummary, orders, ordersForSchedule, requests, resources } from '../data/pcpData.js';
import { Alert, Badge, Callout, DataTable, LineFilter, Metric, Panel, Progress, Row } from '../components/ui.jsx';

export default function Visao_Geral({ onPage, onOpenOrder, onOpenRequest, line, setLine }) {
  const summary = getSummary();
  const openOrders = ordersForSchedule();
  const lateOrder = orders.find((order) => order.late);
  const shortageRequest = requests.find((request) => request.stock === 'Falta');
  const lowInventory = resources.length && onPage;
  return <>
    <div className="page-title"><div><h1>Visão geral do PCP</h1><p>Programação e andamento da produção · estoque de referência em 03/11/2026</p></div><div className="title-actions"><LineFilter value={line} onChange={setLine} /></div></div>
    <div className="metric-grid"><Metric label="Pedidos pendentes" value={summary.pendingRequests} detail={`${requests.filter((item) => item.status === 'Pendente' && item.stock === 'Falta').length} com falta de material`} /><Metric label="Ordens abertas" value={summary.openOrders} detail="Em produção, liberadas ou planejadas" /><Metric label="Ordens atrasadas" value={summary.lateOrders} detail={lateOrder ? `${lateOrder.id} · ${lateOrder.note}` : 'Nenhuma ordem atrasada'} tone="red" /><Metric label="Abaixo do estoque mínimo" value={summary.lowInventory} detail="Materiais abaixo do mínimo definido" tone="amber" /></div>
    <div className="dashboard-grid">
      <Panel title="Ordens abertas" subtitle="Ordenadas pela sequência de programação"><DataTable headers={['Ordem','Produto','Produzido','Progresso','Fim previsto','Situação']}>
        {openOrders.map((order) => <Row key={order.id} onClick={() => onOpenOrder(order)}><td className="code">{order.id}</td><td>{order.product}</td><td>{order.done} de {order.planned}</td><td><Progress value={Math.round(order.done / order.planned * 100)} /></td><td>{order.end}</td><td><Badge>{order.status}</Badge></td></Row>)}
      </DataTable></Panel>
      <Panel title="Alertas e pendências" subtitle="Pontos que exigem atenção"><div className="alert-list">
        {shortageRequest && <Alert title="Falta" text={`${shortageRequest.id} · ${shortageRequest.product} · ${shortageRequest.shortages.length} materiais insuficientes para o lote`} action="Ver pedido" onClick={() => onOpenRequest(shortageRequest)} />}
        {lateOrder && <Alert title="Atrasada" text={`${lateOrder.id} · ${lateOrder.product} · ${lateOrder.note}`} action="Ver ordem" onClick={() => onOpenOrder(lateOrder)} />}
        {lowInventory && <Alert title="Abaixo do mínimo" text={`${summary.lowInventory} materiais estão abaixo do mínimo de estoque.`} action="Ver estoque" onClick={() => onPage('Estoque')} />}
      </div></Panel>
    </div>
    <Panel title="Carga dos recursos produtivos" subtitle="Ocupação estimada para os próximos cinco dias, com base no roteiro das ordens abertas"><DataTable headers={['Recurso','Capacidade','Ocupação estimada','Situação']}>
      {resources.map((resource) => <Row key={resource.code}><td>{resource.name}</td><td>{resource.capacity}</td><td><Progress value={resource.occupancy} label={resource.status === 'Manutenção' ? 'parada' : `${resource.occupancy}%`} /></td><td><Badge>{resource.status}</Badge></td></Row>)}
    </DataTable></Panel>
    <Callout tone="info" title="Fonte dos dados">As telas usam os arquivos JSON exportados do banco. A estimativa de carga é calculada localmente a partir das ordens em aberto e do roteiro de cada produto.</Callout>
  </>;
}
