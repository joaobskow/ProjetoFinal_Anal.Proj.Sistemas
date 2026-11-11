import { orders, products, resources } from '../data/pcpData.js';
import { Badge, Callout, DataTable, LineFilter, Panel, Progress, Row } from '../components/ui.jsx';

export default function Recursos({ line, setLine }) {
  return <>
    <div className="page-title"><div><h1>Recursos produtivos</h1><p>5 recursos · carga estimada sobre a capacidade diária</p></div><div className="title-actions"><LineFilter value={line} onChange={setLine} /></div></div>
    {resources.some((resource) => resource.status === 'Manutenção') && <Callout tone="danger" title="Cabine de pintura em manutenção">O recurso está marcado como manutenção nos dados. Ordens com esse recurso no roteiro podem precisar de reprogramação.</Callout>}
    <div className="resource-grid">{resources.map((resource) => <article className="resource-card" key={resource.code}><h3>{resource.name}</h3><small>{resource.type} · {resource.code}</small><p><Badge>{resource.status}</Badge></p><small>Capacidade</small><strong>{resource.capacity}</strong><small>Ocupação estimada em 5 dias</small><Progress value={resource.occupancy} label={resource.status === 'Manutenção' ? 'parada' : `${resource.occupancy}%`} /><small>Produtos no roteiro</small><strong>{resource.products}</strong></article>)}</div>
    <Panel title="Carga por linha de produção" subtitle="Estimativa calculada a partir das ordens abertas e dos roteiros cadastrados"><DataTable headers={['Linha','Produtos','Ordens abertas','Recurso com manutenção','Situação']}>
      {['Pesada','Leve'].map((productionLine) => {
        const lineProducts = products.filter((product) => product.line === productionLine);
        const lineOrders = orders.filter((order) => !['Concluída','Cancelada'].includes(order.status) && products.find((product) => product.code === order.productId)?.line === productionLine);
        const maintenanceResource = resources.find((resource) => resource.status === 'Manutenção');
        const atRisk = lineOrders.some((order) => order.route.some((stage) => stage.resourceId === maintenanceResource?.code));
        const criticalResource = lineProducts.flatMap((product) => product.route.map((stage) => resources.find((resource) => resource.code === stage.resourceId))).filter(Boolean).toSorted((a,b) => b.occupancy - a.occupancy)[0];
        return <Row key={productionLine}><td>{`Linha ${productionLine.toLowerCase()}`}</td><td>{lineProducts.length}</td><td>{lineOrders.length}</td><td>{criticalResource ? `${criticalResource.name} · ${criticalResource.status === 'Manutenção' ? 'manutenção' : `${criticalResource.occupancy}% de ocupação`}` : '—'}</td><td><Badge>{atRisk ? 'Em risco' : 'Normal'}</Badge></td></Row>;
      })}
    </DataTable></Panel>
  </>;
}
