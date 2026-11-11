import { useState } from 'react';
import { products } from '../data/pcpData.js';
import { Badge, DataTable, Panel, Row, Segments } from '../components/ui.jsx';

export default function Produtos({ onOpen }) {
  const [filter, setFilter] = useState('Todos (12)');
  const rows = products.filter((product) => filter === 'Todos (12)' || (filter === 'Linha pesada (7)' && product.line === 'Pesada') || (filter === 'Linha leve (5)' && product.line === 'Leve'));
  return <>
    <div className="page-title"><div><h1>Produtos</h1><p>12 produtos ativos · 2 linhas de produção · roteiro e lista de materiais de cada produto</p></div></div>
    <Segments items={['Todos (12)','Linha pesada (7)','Linha leve (5)']} value={filter} onChange={setFilter} />
    <Panel className="flush"><DataTable headers={['Código','Produto','Linha','Lote mínimo','Etapas','Tempo por un','Materiais','Situação']}>
      {rows.map((product) => <Row key={product.code} onClick={() => onOpen(product)}><td className="code">{product.code}</td><td>{product.name}</td><td>{product.line}</td><td>{product.lot}</td><td>{product.steps}</td><td>{product.time}</td><td>{product.materials}</td><td><Badge>{product.active ? 'Ativo' : 'Inativo'}</Badge></td></Row>)}
    </DataTable></Panel>
  </>;
}
