import { useState } from 'react';
import { useNav, useStore } from '../state/context.js';
import { Badge, Card, PageHeader, Qty, SearchInput, Segmented, Table, Toolbar } from '../components/ui.jsx';
import { formatDateLong, formatNumber, labels, plural } from '../domain/format.js';

function StockMeter({ item }) {
  const scale = Math.max(item.minimum * 2, item.available, 1);
  return (
    <span className="stock-meter" title={`Disponível ${item.available} · mínimo ${item.minimum}`}>
      <span className={`stock-meter-fill ${item.belowMinimum ? 'is-low' : ''}`} style={{ width: `${(item.available / scale) * 100}%` }} />
      <span className="stock-meter-reserved" style={{ left: `${(item.free / scale) * 100}%`, width: `${(item.reserved / scale) * 100}%` }} />
      {item.minimum > 0 && <span className="stock-meter-min" style={{ left: `${(item.minimum / scale) * 100}%` }} />}
    </span>
  );
}

export default function Inventory() {
  const { model } = useStore();
  const { line } = useNav();
  const [filter, setFilter] = useState('todos');
  const [query, setQuery] = useState('');

  const lineProducts = new Set(model.products.filter((product) => line === 'todas' || product.line === line).map((product) => product.id));
  const inLine = model.inventory.filter((item) => line === 'todas' || item.usedBy.some((productId) => lineProducts.has(productId)));
  const rows = inLine
    .filter((item) => filter === 'todos' || (filter === 'baixo' ? item.belowMinimum : item.type === filter))
    .filter((item) => `${item.id} ${item.name}`.toLowerCase().includes(query.toLowerCase()));

  const count = (predicate) => inLine.filter(predicate).length;
  const updatedAt = model.inventory[0]?.updatedAt;

  return (
    <>
      <PageHeader
        eyebrow="Cadastros"
        title="Estoque de materiais"
        description={`Posição em ${formatDateLong(updatedAt)}. Saldo livre = disponível − reservado para ordens em aberto.${line !== 'todas' ? ` Mostrando materiais usados na ${labels.line[line].toLowerCase()}.` : ''}`}
      />
      <Toolbar>
        <Segmented
          label="Filtro de materiais"
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'todos', label: 'Todos', count: inLine.length },
            { value: 'baixo', label: 'Abaixo do mínimo', count: count((item) => item.belowMinimum) },
            { value: 'materia_prima', label: 'Matéria-prima', count: count((item) => item.type === 'materia_prima') },
            { value: 'componente', label: 'Componentes', count: count((item) => item.type === 'componente') },
            { value: 'embalagem', label: 'Embalagens', count: count((item) => item.type === 'embalagem') },
          ]}
        />
        <div className="toolbar-end">
          <SearchInput value={query} onChange={setQuery} placeholder="Buscar material" />
        </div>
      </Toolbar>
      <Card flush>
        <Table
          rows={rows}
          rowKey={(item) => item.id}
          rowClassName={(item) => (item.belowMinimum ? 'is-warning' : '')}
          empty="Nenhum material encontrado."
          columns={[
            {
              key: 'name',
              label: 'Material',
              render: (item) => (
                <span className="cell-stack">
                  <span className="cell-strong">{item.name}</span>
                  <small>{`${item.id} · ${labels.materialType[item.type]} · usado em ${plural(item.usedBy.length, 'produto')}`}</small>
                </span>
              ),
            },
            {
              key: 'available',
              label: 'Disponível',
              align: 'right',
              render: (item) => (
                <span className="cell-stack align-right">
                  <Qty value={item.available} unit={item.unit} />
                  <small>{item.reserved ? `${formatNumber(item.reserved)} reservado` : 'nada reservado'}</small>
                </span>
              ),
            },
            { key: 'free', label: 'Saldo livre', align: 'right', render: (item) => <Qty value={item.free} unit={item.unit} /> },
            { key: 'minimum', label: 'Mínimo', align: 'right', render: (item) => <Qty value={item.minimum} unit={item.unit} /> },
            { key: 'meter', label: 'Nível', width: 120, render: (item) => <StockMeter item={item} /> },
            { key: 'lead', label: 'Reposição', align: 'right', render: (item) => (item.leadTime == null ? '—' : `${item.leadTime} dias`) },
            {
              key: 'status',
              label: 'Situação',
              render: (item) =>
                item.belowMinimum ? (
                  <Badge tone="warning" icon="alert">Abaixo do mínimo</Badge>
                ) : item.empty ? (
                  <Badge tone="muted">Sem saldo</Badge>
                ) : (
                  <Badge tone="success">Normal</Badge>
                ),
            },
          ]}
        />
      </Card>
      <div className="legend-row">
        <span><i className="legend-swatch tone-primary" /> Disponível</span>
        <span><i className="legend-swatch legend-hatch" /> Reservado</span>
        <span><i className="legend-tick" /> Estoque mínimo</span>
      </div>
    </>
  );
}
