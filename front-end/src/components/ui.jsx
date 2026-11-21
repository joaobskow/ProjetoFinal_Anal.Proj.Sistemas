import { useEffect } from 'react';
import Icon from './Icon.jsx';
import { formatNumber, labels } from '../domain/format.js';

const orderTone = { planejada: 'neutral', liberada: 'info', em_producao: 'primary', concluida: 'success', cancelada: 'muted' };
const requestTone = { pendente: 'warning', em_producao: 'info', atendido: 'success', cancelado: 'muted' };
const priorityTone = { alta: 'danger', normal: 'neutral', baixa: 'muted' };

export function Badge({ tone = 'neutral', children, icon, title }) {
  return (
    <span className={`badge tone-${tone}`} title={title}>
      {icon ? <Icon name={icon} size={12} strokeWidth={2.2} /> : <i className="badge-dot" />}
      {children}
    </span>
  );
}

export const OrderStatus = ({ status }) => <Badge tone={orderTone[status]}>{labels.orderStatus[status] ?? status}</Badge>;
export const RequestStatus = ({ status }) => <Badge tone={requestTone[status]}>{labels.requestStatus[status] ?? status}</Badge>;
export const Priority = ({ value }) => <span className={`priority tone-${priorityTone[value]}`}>{labels.priority[value] ?? value}</span>;

export function OrderFlags({ order }) {
  if (!order.late && !order.dueRisk && !order.blockedStages.length) return null;
  return (
    <span className="flag-group">
      {order.late && <Badge tone="danger" icon="clock">Atrasada</Badge>}
      {order.dueRisk && <Badge tone="warning" icon="alert">Após a entrega</Badge>}
      {order.blockedStages.length > 0 && !order.late && <Badge tone="warning" icon="wrench">Recurso parado</Badge>}
    </span>
  );
}

export function Button({ variant = 'secondary', icon, children, size, type = 'button', ...props }) {
  return (
    <button type={type} className={`btn btn-${variant} ${size ? `btn-${size}` : ''}`} {...props}>
      {icon && <Icon name={icon} size={size === 'sm' ? 14 : 16} />}
      {children}
    </button>
  );
}

export function PageHeader({ eyebrow, title, description, actions, onBack, meta }) {
  return (
    <header className="page-header">
      <div className="page-header-text">
        {onBack ? (
          <button type="button" className="back-link" onClick={onBack}>
            <Icon name="back" size={14} /> {eyebrow}
          </button>
        ) : (
          eyebrow && <span className="eyebrow">{eyebrow}</span>
        )}
        <div className="page-title-row">
          <h1>{title}</h1>
          {meta}
        </div>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </header>
  );
}

export function Card({ title, description, actions, children, className = '', flush }) {
  return (
    <section className={`card ${flush ? 'card-flush' : ''} ${className}`}>
      {(title || actions) && (
        <header className="card-header">
          <div>
            {title && <h2>{title}</h2>}
            {description && <p>{description}</p>}
          </div>
          {actions && <div className="card-actions">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  );
}

export function Kpi({ label, value, detail, tone = 'neutral', icon, onClick }) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag type={onClick ? 'button' : undefined} className={`kpi tone-${tone} ${onClick ? 'is-clickable' : ''}`} onClick={onClick}>
      <span className="kpi-label">
        {icon && (
          <span className="kpi-icon">
            <Icon name={icon} size={16} />
          </span>
        )}
        {label}
      </span>
      <strong className="kpi-value">{value}</strong>
      {detail && <span className="kpi-detail">{detail}</span>}
    </Tag>
  );
}

export function Table({ columns, rows, rowKey, onRowClick, empty = 'Nenhum registro encontrado.', rowClassName }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} className={column.align ? `align-${column.align}` : ''} style={column.width ? { width: column.width } : undefined}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              className={`${onRowClick ? 'is-clickable' : ''} ${rowClassName?.(row) ?? ''}`}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              tabIndex={onRowClick ? 0 : undefined}
              onKeyDown={onRowClick ? (event) => event.key === 'Enter' && onRowClick(row) : undefined}
            >
              {columns.map((column) => (
                <td key={column.key} className={`${column.align ? `align-${column.align}` : ''} ${column.className ?? ''}`}>
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="table-empty">
                {empty}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function Progress({ value, tone, showLabel = true, size }) {
  const percent = Math.round(Math.max(0, Math.min(1, value)) * 100);
  const resolvedTone = tone ?? (percent >= 100 ? 'success' : 'primary');
  return (
    <span className={`progress ${size ? `progress-${size}` : ''}`}>
      <span className="progress-track">
        <span className={`progress-fill tone-${resolvedTone}`} style={{ width: `${percent}%` }} />
      </span>
      {showLabel && <span className="progress-label">{percent}%</span>}
    </span>
  );
}

export function Segmented({ options, value, onChange, size, label }) {
  return (
    <div className={`segmented ${size ? `segmented-${size}` : ''}`} role="radiogroup" aria-label={label}>
      {options.map((option) => {
        const item = typeof option === 'string' ? { value: option, label: option } : option;
        return (
          <button
            type="button"
            role="radio"
            aria-checked={item.value === value}
            key={item.value}
            className={item.value === value ? 'is-active' : ''}
            onClick={() => onChange(item.value)}
          >
            {item.label}
            {item.count != null && <span className="segmented-count">{item.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

export function Callout({ tone = 'info', title, icon, children, action }) {
  return (
    <div className={`callout tone-${tone}`} role={tone === 'danger' ? 'alert' : undefined}>
      <span className="callout-icon">
        <Icon name={icon ?? (tone === 'success' ? 'checkCircle' : 'alert')} size={18} />
      </span>
      <div className="callout-body">
        {title && <strong>{title}</strong>}
        {children && <p>{children}</p>}
      </div>
      {action && <div className="callout-action">{action}</div>}
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder }) {
  return (
    <label className="search-input">
      <Icon name="search" size={16} />
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} aria-label={placeholder} />
    </label>
  );
}

export function Toolbar({ children }) {
  return <div className="toolbar">{children}</div>;
}

export function Facts({ items, columns = 4 }) {
  return (
    <dl className="facts" style={{ '--facts-columns': columns }}>
      {items.filter(Boolean).map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Code({ children }) {
  return <span className="code">{children}</span>;
}

export function Qty({ value, unit, tone }) {
  return (
    <span className={`qty ${tone ? `text-${tone}` : ''}`}>
      {formatNumber(value)}
      {unit && <small>{unit}</small>}
    </span>
  );
}

export function RouteSteps({ route, quantity }) {
  return (
    <ol className="route-steps">
      {route.map((stage) => {
        const blocked = stage.resourceStatus !== 'disponivel';
        return (
          <li key={stage.sequence} className={blocked ? 'is-blocked' : ''}>
            <span className="route-index">{blocked ? <Icon name="wrench" size={13} strokeWidth={2.2} /> : stage.sequence}</span>
            <div className="route-text">
              <strong>{stage.resourceName}</strong>
              <small>
                {stage.minutes} min/un
                {quantity ? ` · ${formatNumber((stage.minutes * quantity) / 60)} h no total` : ''}
              </small>
              {blocked && <em>{labels.resourceStatus[stage.resourceStatus]}</em>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function Modal({ title, description, onClose, children, footer, onSubmit, size }) {
  useEffect(() => {
    const onKey = (event) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form
        className={`modal ${size ? `modal-${size}` : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit?.();
        }}
      >
        <header className="modal-header">
          <div>
            <h2>{title}</h2>
            {description && <p>{description}</p>}
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Fechar">
            <Icon name="close" size={18} />
          </button>
        </header>
        <div className="modal-body">{children}</div>
        {footer && <footer className="modal-footer">{footer}</footer>}
      </form>
    </div>
  );
}

export function Field({ label, hint, children, full, error }) {
  return (
    <label className={`field ${full ? 'field-full' : ''} ${error ? 'has-error' : ''}`}>
      <span className="field-label">{label}</span>
      {children}
      {(error || hint) && <span className="field-hint">{error || hint}</span>}
    </label>
  );
}

export function EmptyState({ icon = 'checkCircle', title, children }) {
  return (
    <div className="empty-state">
      <Icon name={icon} size={22} />
      <strong>{title}</strong>
      {children && <div className="empty-state-body">{children}</div>}
    </div>
  );
}
