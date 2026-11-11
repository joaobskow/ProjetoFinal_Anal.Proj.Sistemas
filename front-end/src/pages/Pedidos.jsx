import { useMemo, useState } from 'react';
import { getProduct, requests } from '../data/pcpData.js';
import { Badge, DataTable, LineFilter, Panel, Row, Segments } from '../components/ui.jsx';

export default function Pedidos({ onOpen }) {
  const [status, setStatus] = useState('Todos');
  const [priority, setPriority] = useState('Todas as prioridades');
  const [line, setLine] = useState('Todas as linhas');
  const [search, setSearch] = useState('');
  const rows = useMemo(() => requests.filter((request) => {
    const statusMatch = status === 'Todos' || (status === 'Pendentes' && request.status === 'Pendente') || (status === 'Em produção' && request.status === 'Em produção') || (status === 'Atendidos' && request.status === 'Atendido') || (status === 'Cancelados' && request.status === 'Cancelado');
    const priorityMatch = priority === 'Todas as prioridades' || request.priority === priority;
    const product = getProduct(request.productId);
    const lineMatch = line === 'Todas as linhas' || product?.line === line;
    const searchMatch = `${request.id} ${request.client} ${request.product}`.toLowerCase().includes(search.toLowerCase());
    return statusMatch && priorityMatch && lineMatch && searchMatch;
  }), [status, priority, line, search]);
  return <>
    <div className="page-title"><div><h1>Pedidos</h1></div><div className="title-actions"><LineFilter value={line} onChange={setLine} /><Segments items={['Todas as prioridades','Alta','Normal','Baixa']} value={priority} onChange={setPriority} /></div></div>
    <div className="page-tools"><Segments items={['Todos','Pendentes','Em produção','Atendidos','Cancelados']} value={status} onChange={setStatus} /><input className="search" placeholder="Buscar pedido, cliente ou produto" value={search} onChange={(event) => setSearch(event.target.value)} /></div>
    <Panel className="flush"><DataTable headers={['Pedido','Cliente','Produto','Qtd','Pedido em','Entrega','Prioridade','Situação','Estoque']}>
      {rows.map((request) => <Row key={request.id} onClick={() => onOpen(request)}><td className="code">{request.id}</td><td>{request.client}</td><td>{request.product}</td><td>{request.qty}</td><td className="muted">{request.ordered}</td><td>{request.delivery}</td><td><Badge>{request.priority}</Badge></td><td><Badge>{request.status}</Badge></td><td>{request.stock === 'Atendível' ? <Badge>{request.stock}</Badge> : <Badge>{request.stock}</Badge>}</td></Row>)}
    </DataTable></Panel>
  </>;
}
