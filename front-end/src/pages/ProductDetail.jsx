import { useNav, useStore } from '../state/context.js';
import { Badge, Button, Callout, Card, Code, EmptyState, Facts, OrderStatus, PageHeader, Qty, RouteSteps, Table } from '../components/ui.jsx';
import { formatDuration, formatNumber, labels } from '../domain/format.js';

export default function ProductDetail({ id }) {
  const { model } = useStore();
  const { back, go } = useNav();
  const product = model.productById.get(id);
  if (!product) return (
      <EmptyState icon="alert" title="Produto não encontrado">
        <Button onClick={() => go('produtos')}>Ver a lista</Button>
      </EmptyState>
    );
  const orders = model.orders.filter((order) => order.productId === product.id);

  return (
    <>
      <PageHeader
        eyebrow="Produtos"
        onBack={back}
        title={product.name}
        meta={product.active ? <Badge tone="success">Ativo</Badge> : <Badge tone="muted">Inativo</Badge>}
        description={`${product.id} · ${labels.line[product.line]}`}
      />

      {product.blockedStages.length > 0 && (
        <Callout tone="warning" icon="wrench" title="Roteiro com recurso parado">
          {product.blockedStages.map((stage) => stage.resourceName).join(', ')} está em manutenção. Novas ordens deste produto ficam sujeitas a atraso.
        </Callout>
      )}

      <Card>
        <Facts
          items={[
            ['Unidade de venda', product.unit],
            ['Lote mínimo', `${product.minimumLot} un`],
            ['Tempo por unidade', formatDuration(product.unitMinutes)],
            ['Etapas · materiais', `${product.route.length} etapas · ${product.bom.length} materiais`],
          ]}
        />
      </Card>

      <div className="grid-main-side">
        <Card title="Estrutura do produto" description="Consumo de cada material para fabricar uma unidade" flush>
          <Table
            rows={product.bom}
            rowKey={(item) => item.materialId}
            onRowClick={() => go('estoque')}
            columns={[
              {
                key: 'name',
                label: 'Material',
                render: (item) => (
                  <span className="cell-stack">
                    <span className="cell-strong">{item.name}</span>
                    <small>{item.materialId}</small>
                  </span>
                ),
              },
              { key: 'type', label: 'Tipo', render: (item) => labels.materialType[item.type] },
              { key: 'qty', label: 'Por unidade', align: 'right', render: (item) => <Qty value={item.perUnit} unit={item.unit} /> },
              { key: 'loss', label: 'Perda', align: 'right', render: (item) => (item.loss ? `${formatNumber(item.loss)}%` : '—') },
              {
                key: 'free',
                label: 'Saldo livre',
                align: 'right',
                render: (item) => {
                  const stock = model.inventoryById.get(item.materialId);
                  return <Qty value={stock?.free ?? 0} unit={item.unit} tone={stock?.belowMinimum ? 'warning' : undefined} />;
                },
              },
            ]}
          />
        </Card>
        <div className="stack">
          <Card title="Roteiro de fabricação" description="Etapas em sequência e tempo por unidade">
            <RouteSteps route={product.route} />
          </Card>
          <Card title="Ordens deste produto" flush>
            {orders.length ? (
              <Table
                rows={orders}
                rowKey={(order) => order.id}
                onRowClick={(order) => go('ordem', order.id)}
                columns={[
                  { key: 'id', label: 'Ordem', render: (order) => <Code>{order.id}</Code> },
                  { key: 'qty', label: 'Qtd', align: 'right', render: (order) => `${order.produced}/${order.planned}` },
                  { key: 'status', label: 'Situação', render: (order) => <OrderStatus status={order.status} /> },
                ]}
              />
            ) : (
              <EmptyState icon="orders" title="Nenhuma ordem emitida" />
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
