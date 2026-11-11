import { useMemo, useState } from 'react';
import { inventory } from '../data/pcpData.js';
import { Badge, DataTable, Panel, Row, Segments } from '../components/ui.jsx';

const categories = ['Todos (17)','Abaixo do mínimo (2)','Matéria-prima (5)','Componente (11)','Embalagem (1)'];

export default function Estoque() {
  const [category, setCategory] = useState(categories[0]);
  const [search, setSearch] = useState('');
  const rows = useMemo(() => inventory.filter((material) => {
    const typeFilter = category === categories[0] || (category.startsWith('Abaixo') && material.status === 'Abaixo do mínimo') || (category.startsWith('Matéria-prima') && material.type === 'Matéria-prima') || (category.startsWith('Componente') && material.type === 'Componente') || (category.startsWith('Embalagem') && material.type === 'Embalagem');
    return typeFilter && `${material.code} ${material.name}`.toLowerCase().includes(search.toLowerCase());
  }), [category, search]);
  return <>
    <div className="page-title"><div><h1>Estoque</h1><p>Posição em 03/11/2026 · saldo livre = disponível − reservado</p></div></div>
    <div className="page-tools"><Segments items={categories} value={category} onChange={setCategory} /><input className="search" placeholder="Buscar material" value={search} onChange={(event) => setSearch(event.target.value)} /></div>
    <Panel className="flush"><DataTable headers={['Código','Material','Tipo','Un','Disponível','Reservado','Saldo livre','Mínimo','Reposição','Situação']}>
      {rows.map((material) => <Row key={material.code}><td className="code">{material.code}</td><td>{material.name}</td><td>{material.type}</td><td>{material.unit}</td><td>{material.available}</td><td>{material.reserved}</td><td>{material.free}</td><td>{material.minimum}</td><td>{material.replenishment}</td><td><Badge>{material.status}</Badge></td></Row>)}
    </DataTable></Panel>
  </>;
}
