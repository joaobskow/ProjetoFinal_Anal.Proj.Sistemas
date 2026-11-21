import { useState } from 'react';
import { useNav, useStore } from '../state/context.js';
import { Badge, Card, Code, PageHeader, SearchInput, Table, Toolbar } from '../components/ui.jsx';
import { formatDuration, labels } from '../domain/format.js';

export default function Products() {
  const { model } = useStore();
  const { go, matchesLine } = useNav();
  const [query, setQuery] = useState('');
  const rows = model.products
    .filter((product) => matchesLine(product.line))
    .filter((product) => `${product.id} ${product.name}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <>
      <PageHeader
        eyebrow="Cadastros"
        title="Produtos"
        description="Implementos fabricados, com o roteiro de etapas e a lista de materiais de cada um."
      />
      <Toolbar>
        <span className="toolbar-summary">
          {rows.length} de {model.products.length} produtos
        </span>
        <div className="toolbar-end">
          <SearchInput value={query} onChange={setQuery} placeholder="Buscar produto" />
        </div>
      </Toolbar>
      <Card flush>
        <Table
          rows={rows}
          rowKey={(product) => product.id}
          onRowClick={(product) => go('produto', product.id)}
          columns={[
            { key: 'id', label: 'Código', width: 80, render: (product) => <Code>{product.id}</Code> },
            { key: 'name', label: 'Produto', render: (product) => <span className="cell-strong">{product.name}</span> },
            { key: 'line', label: 'Linha', render: (product) => labels.line[product.line] },
            {
              key: 'route',
              label: 'Roteiro',
              render: (product) => (
                <span className="route-inline">
                  {product.route.map((stage) => (
                    <span key={stage.sequence} className={stage.resourceStatus !== 'disponivel' ? 'is-blocked' : ''} title={stage.resourceName}>
                      {stage.resourceName.split(/[ /]/)[0]}
                    </span>
                  ))}
                </span>
              ),
            },
            { key: 'time', label: 'Tempo por un', align: 'right', render: (product) => formatDuration(product.unitMinutes) },
            { key: 'lot', label: 'Lote mín.', align: 'right', render: (product) => `${product.minimumLot} un` },
            { key: 'bom', label: 'Materiais', align: 'right', render: (product) => product.bom.length },
            { key: 'active', label: 'Situação', render: (product) => (product.active ? <Badge tone="success">Ativo</Badge> : <Badge tone="muted">Inativo</Badge>) },
          ]}
        />
      </Card>
    </>
  );
}
