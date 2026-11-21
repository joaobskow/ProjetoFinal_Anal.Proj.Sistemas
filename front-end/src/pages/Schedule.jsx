import { useState } from 'react';
import { useNav, useStore } from '../state/context.js';
import { Card, Code, EmptyState, OrderFlags, OrderStatus, PageHeader, Priority, Progress } from '../components/ui.jsx';
import Gantt from '../components/Gantt.jsx';
import Icon from '../components/Icon.jsx';
import { formatDate, labels } from '../domain/format.js';

export default function Schedule() {
  const { model, act } = useStore();
  const { go, matchesLine, line, openModal } = useNav();
  const [dragging, setDragging] = useState(null);
  const [over, setOver] = useState(null);
  const allIds = model.openOrders.map((order) => order.id);
  const rows = model.openOrders.filter((order) => matchesLine(order.line));

  const moveTo = (id, targetId) => {
    if (!id || !targetId || id === targetId || !allIds.includes(id)) return;
    const ids = allIds.filter((item) => item !== id);
    const targetIndex = ids.indexOf(targetId);
    const fromIndex = allIds.indexOf(id);
    const toIndex = allIds.indexOf(targetId);
    ids.splice(fromIndex < toIndex ? targetIndex + 1 : targetIndex, 0, id);
    act('reorder', { ids });
  };

  const step = (index, direction) => {
    const target = rows[index + direction];
    if (target) moveTo(rows[index].id, target.id);
  };

  return (
    <>
      <PageHeader
        eyebrow="Produção"
        title="Programação e sequenciamento"
        description={`Ordem de execução das ordens abertas${line !== 'todas' ? ` da ${labels.line[line].toLowerCase()}` : ''}. Arraste as linhas ou use as setas para mudar a sequência; para alterar datas e prioridade, use Reprogramar.`}
      />

      <Card title="Sequência de execução" description={`${rows.length} ordens abertas · a primeira da lista é a próxima a ser executada`} flush>
        {rows.length ? (
          <ol className="sequence-list">
            {rows.map((order, index) => (
              <li
                key={order.id}
                draggable
                onDragStart={(event) => {
                  setDragging(order.id);
                  event.dataTransfer.effectAllowed = 'move';
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  setOver(order.id);
                }}
                onDragLeave={() => setOver((current) => (current === order.id ? null : current))}
                onDrop={(event) => {
                  event.preventDefault();
                  moveTo(dragging, order.id);
                  setDragging(null);
                  setOver(null);
                }}
                onDragEnd={() => {
                  setDragging(null);
                  setOver(null);
                }}
                className={`sequence-item ${dragging === order.id ? 'is-dragging' : ''} ${over === order.id && dragging !== order.id ? 'is-over' : ''} ${order.late ? 'is-late' : ''}`}
              >
                <span className="sequence-grip" aria-hidden="true">
                  <Icon name="grip" size={16} />
                </span>
                <span className="sequence-pos">{index + 1}</span>
                <button type="button" className="sequence-main" onClick={() => go('ordem', order.id)}>
                  <span className="sequence-title">
                    <Code>{order.id}</Code>
                    <strong>{order.productName}</strong>
                  </span>
                  <small>
                    {order.requestId ? `${order.requestId} · ${order.client}` : 'Ordem para estoque'} · {labels.line[order.line]}
                  </small>
                </button>
                <span className="sequence-dates">
                  <small>Previsto</small>
                  {formatDate(order.startDate)} → <span className={order.late ? 'text-danger' : ''}>{formatDate(order.endDate)}</span>
                </span>
                <span className="sequence-progress">
                  <small>
                    {order.produced} de {order.planned} un
                  </small>
                  <Progress value={order.progress} showLabel={false} size="sm" />
                </span>
                <span className="sequence-badges">
                  <Priority value={order.priority} />
                  <OrderStatus status={order.status} />
                  <OrderFlags order={order} />
                </span>
                <span className="sequence-actions">
                  <button type="button" className="icon-btn" onClick={() => step(index, -1)} disabled={index === 0} aria-label={`Antecipar ${order.id}`}>
                    <Icon name="up" size={16} />
                  </button>
                  <button type="button" className="icon-btn" onClick={() => step(index, 1)} disabled={index === rows.length - 1} aria-label={`Adiar ${order.id}`}>
                    <Icon name="down" size={16} />
                  </button>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => openModal('reschedule', { orderId: order.id })}>
                    Reprogramar
                  </button>
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <EmptyState title="Nenhuma ordem aberta">Não há ordens abertas para esta linha.</EmptyState>
        )}
      </Card>

      {rows.length > 0 && (
        <Card title="Linha do tempo" description="Período previsto de cada ordem, na mesma sequência da lista acima">
          <Gantt orders={rows} referenceDate={model.referenceDate} onOpen={(order) => go('ordem', order.id)} />
        </Card>
      )}
    </>
  );
}
