import { addDays, daysBetween, formatDate } from '../domain/format.js';

const barTone = (order) => {
  if (order.late) return 'danger';
  if (order.dueRisk || order.blockedStages.length) return 'warning';
  if (order.status === 'em_producao') return 'primary';
  if (order.status === 'liberada') return 'info';
  return 'neutral';
};

export default function Gantt({ orders, referenceDate, onOpen, compact }) {
  if (!orders.length) return null;
  const dates = orders.flatMap((order) => [order.startDate, order.endDate, order.deliveryDate].filter(Boolean));
  dates.push(referenceDate);
  const sorted = [...dates].sort();
  const start = addDays(sorted[0], -2);
  const end = addDays(sorted[sorted.length - 1], 3);
  const span = Math.max(1, daysBetween(start, end));
  const pos = (iso) => `${(daysBetween(start, iso) / span) * 100}%`;
  const ticks = [];
  for (let day = 0; day <= span; day += 1) {
    const iso = addDays(start, day);
    if (new Date(`${iso}T00:00:00`).getDay() === 1) ticks.push(iso);
  }

  return (
    <div className={`gantt ${compact ? 'gantt-compact' : ''}`}>
      <div className="gantt-head">
        <span className="gantt-label-col">Ordem</span>
        <div className="gantt-axis">
          {ticks.map((iso) => (
            <span key={iso} className="gantt-tick" style={{ left: pos(iso) }}>
              {formatDate(iso)}
            </span>
          ))}
        </div>
      </div>
      <div className="gantt-body">
        <div className="gantt-grid" aria-hidden="true">
          {ticks.map((iso) => (
            <i key={iso} style={{ left: pos(iso) }} />
          ))}
          <b className="gantt-today" style={{ left: pos(referenceDate) }}>
            <span>Hoje · {formatDate(referenceDate)}</span>
          </b>
        </div>
        {orders.map((order) => {
          const left = daysBetween(start, order.startDate) / span;
          const width = Math.max(1, daysBetween(order.startDate, order.endDate) + 1) / span;
          return (
            <div className="gantt-row" key={order.id}>
              <button type="button" className="gantt-label-col gantt-label" onClick={() => onOpen?.(order)}>
                <span className="code">{order.id}</span>
                <small>{order.productName}</small>
              </button>
              <div className="gantt-track">
                <button
                  type="button"
                  className={`gantt-bar tone-${barTone(order)}`}
                  style={{ left: `${left * 100}%`, width: `${width * 100}%` }}
                  onClick={() => onOpen?.(order)}
                  title={`${order.id}: ${formatDate(order.startDate)} a ${formatDate(order.endDate)}`}
                >
                  <span className="gantt-bar-fill" style={{ width: `${order.progress * 100}%` }} />
                  <span className="gantt-bar-text">
                    {formatDate(order.startDate)} – {formatDate(order.endDate)}
                  </span>
                </button>
                {order.deliveryDate && (
                  <span className="gantt-due" style={{ left: pos(order.deliveryDate) }} title={`Entrega do pedido ${order.requestId}: ${formatDate(order.deliveryDate)}`} />
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="gantt-legend">
        <span><i className="legend-swatch tone-primary" /> Em produção</span>
        <span><i className="legend-swatch tone-info" /> Liberada</span>
        <span><i className="legend-swatch tone-neutral" /> Planejada</span>
        <span><i className="legend-swatch tone-warning" /> Em risco</span>
        <span><i className="legend-swatch tone-danger" /> Atrasada</span>
        <span><i className="legend-due" /> Entrega do pedido</span>
      </div>
    </div>
  );
}
