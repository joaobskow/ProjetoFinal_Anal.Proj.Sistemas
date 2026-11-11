export function Badge({ children }) {
  const className = String(children).toLowerCase().replaceAll(' ', '-');
  return <span className={`badge ${className}`}>{children}</span>;
}

export function DataTable({ headers, children }) {
  return <div className="table-wrap"><table><thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{children}</tbody></table></div>;
}

export function Row({ children, onClick }) {
  return <tr className={onClick ? 'clickable' : ''} onClick={onClick}>{children}</tr>;
}

export function PageTitle({ title, subtitle, actions }) {
  return <div className="page-title"><div><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>{actions && <div className="title-actions">{actions}</div>}</div>;
}

export function Segments({ items, value, onChange }) {
  return <div className="segments">{items.map((item) => <button type="button" key={item} className={item === value ? 'active' : ''} onClick={() => onChange(item)}>{item}</button>)}</div>;
}

export function LineFilter({ value, onChange }) {
  return <Segments items={['Todas as linhas', 'Pesada', 'Leve']} value={value} onChange={onChange} />;
}

export function Panel({ title, subtitle, children, className = '' }) {
  return <article className={`panel ${className}`}><div className="panel-heading"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div></div>{children}</article>;
}

export function SummaryStrip({ items }) {
  return <div className="summary-strip">{items.map(([label, value]) => <div key={label}><small>{label}</small><strong>{value}</strong></div>)}</div>;
}

export function Progress({ value, label }) {
  return <div className="progress-cell"><span className="progress-track"><i style={{ width: `${value}%` }} className={value < 60 ? 'low' : ''} /></span><small>{label ?? `${value}%`}</small></div>;
}

export function Callout({ title, children, tone = '' }) {
  return <div className={`callout ${tone}`}><strong>{title}</strong><p>{children}</p></div>;
}

export function Alert({ title, text, action, onClick }) {
  return <div className="alert-item"><div className="alert-top"><Badge>{title}</Badge><button type="button" className="outline small" onClick={onClick}>{action} →</button></div><p>{text}</p></div>;
}

export function Metric({ label, value, detail, tone = '' }) {
  return <article className="metric-card"><span>{label}</span><strong className={tone}>{value}</strong><small>{detail}</small></article>;
}

export function StatusProgress({ done, planned }) {
  const value = planned ? Math.round(done / planned * 100) : 0;
  return <Progress value={value} />;
}
