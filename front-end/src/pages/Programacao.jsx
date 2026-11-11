import { useMemo, useState } from 'react';
import { getProduct, ordersForSchedule } from '../data/pcpData.js';
import { Badge, DataTable, LineFilter, Panel, Row } from '../components/ui.jsx';

export default function Programacao({ onOpen, onReschedule, notify }) {
  const [rows, setRows] = useState(() => ordersForSchedule());
  const [line, setLine] = useState('Todas as linhas');
  const move = (index, direction) => setRows((current) => {
    const next = [...current];
    const target = index + direction;
    if (target < 0 || target >= next.length) return current;
    [next[index], next[target]] = [next[target], next[index]];
    return next;
  });
  const save = () => notify('Programação salva localmente. Conecte o endpoint para persistir no backend.');
  const visible = useMemo(() => rows.filter((order) => line === 'Todas as linhas' || getProduct(order.productId)?.line === line), [rows, line]);
  return <>
    <div className="page-title"><div><h1>Programação e sequenciamento</h1><p>Ordene as ordens abertas e ajuste as datas previstas</p></div><div className="title-actions"><LineFilter value={line} onChange={setLine} /><button className="outline" onClick={() => setRows(ordersForSchedule())}>Descartar</button><button className="primary" onClick={save}>Salvar programação</button></div></div>
    <Panel title="Sequência de execução" subtitle={`${visible.length} ordens abertas · use as setas para mudar a posição`}><DataTable headers={['Pos.','Ordem','Produto','Início previsto','Fim previsto','Prioridade','Situação','Ações']}>
      {visible.map((order, index) => <Row key={order.id}><td>⠿　{index + 1}</td><td className="code clickable-code" onClick={() => onOpen(order)}>{order.id}</td><td>{order.product}</td><td>{order.start}</td><td className={order.late?'negative':''}>{order.end}</td><td><Badge>{order.priority}</Badge></td><td><Badge>{order.status}</Badge></td><td className="action-cell"><button title="Mover para cima" onClick={() => move(rows.findIndex((item) => item.id === order.id),-1)}>↑</button><button title="Mover para baixo" onClick={() => move(rows.findIndex((item) => item.id === order.id),1)}>↓</button><button onClick={() => onReschedule(order)}>Reprogramar</button></td></Row>)}
    </DataTable></Panel>
    <Panel title="Linha do tempo" subtitle="Datas previstas a partir da programação atual; a linha vermelha marca 03/11">
      <div className="timeline"><div className="timeline-dates">{['19/10','26/10','02/11','09/11','16/11'].map((date) => <span key={date}>{date}</span>)}</div>{visible.map((order, index) => <div className="timeline-row" key={order.id}><span>{order.id} · {order.product}</span><div className="timeline-track"><i className={`timeline-bar color-${index % 4}`} style={{ left: `${Math.max(0, index * 12)}%`, width: `${Math.min(60, 28 + index * 7)}%` }}>{order.id}</i></div></div>)}</div>
    </Panel>
  </>;
}
