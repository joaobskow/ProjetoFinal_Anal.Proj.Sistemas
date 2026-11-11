import { displayDate, getProduct, inventory, numberPt } from '../data/pcpData.js';
import { Badge, Callout, DataTable, PageTitle, Panel, Row, SummaryStrip } from '../components/ui.jsx';

export default function Detalhe_Pedido({ item, onBack, onGenerate }) {
  const product = getProduct(item.productId);
  const planned = item.plannedQuantity;
  const shortage = item.shortages.length > 0;
  const materialRows = (product?.structure ?? []).map((part) => {
    const required = part.quantidade * planned * (1 + (part.perda_percentual ?? 0) / 100);
    const free = part.stock ? part.stock.quantidade_disponivel - part.stock.quantidade_reservada : 0;
    const status = required > free ? 'Falta' : 'Disponível';
    return { name: part.materialInfo?.descricao ?? part.material, unit: part.materialInfo?.unidade_medida ?? '—', quantity: numberPt(part.quantidade), loss: part.perda_percentual == null ? '—' : `${part.perda_percentual}%`, required: numberPt(required), free: numberPt(free), status };
  });
  const routeHours = (product?.route ?? []).map((stage) => ({ ...stage, total: `${numberPt(stage.minutes * planned / 60)} h` }));
  return <>
    <PageTitle title={`Pedido ${item.id}`} subtitle="Verificação de estoque e necessidade de materiais para atender o pedido" actions={<><button className="outline" onClick={onBack}>Voltar</button><button className="primary" onClick={onGenerate}>Gerar ordem de produção</button></>} />
    <SummaryStrip items={[["Cliente",item.client],["Produto",item.product],["Quantidade pedida",`${item.qty} un`],["Ordem a produzir",`${planned} un (lote mínimo ${product?.minimumLot ?? 1})`],["Entrega prometida",displayDate(item.deliveryDate,true)],["Prioridade",item.priority],["Situação",item.stock]]} />
    <div className="detail-grid"><Panel title="Estrutura do produto e necessidade de materiais" subtitle="Necessidade = quantidade × qtd por unidade × (1 + perda)"><DataTable headers={['Material','Un','Qtd/un','Perda','Necessário','Saldo livre','Situação']}>
      {materialRows.map((row) => <Row key={row.name}><td>{row.name}</td><td>{row.unit}</td><td>{row.quantity}</td><td>{row.loss}</td><td className={row.status === 'Falta' ? 'negative' : ''}>{row.required}</td><td className={row.status === 'Falta' ? 'negative' : ''}>{row.free}</td><td><Badge>{row.status}</Badge></td></Row>)}
    </DataTable></Panel><div className="stack">
      {shortage && <Callout tone="danger" title="Falta de material">{item.shortages.map((part) => part.materialInfo?.descricao ?? part.material).join(', ')} não têm saldo livre suficiente para produzir o lote calculado.</Callout>}
      <Panel title="Roteiro e horas necessárias" subtitle={`Para ${planned} unidades`}><DataTable headers={['Etapa','Tempo por un','Total']}>
        {routeHours.map((stage) => <Row key={stage.sequence}><td>{stage.sequence} · {stage.resource}</td><td>{stage.minutes} min/un</td><td>{stage.total}</td></Row>)}
      </DataTable></Panel>
      {inventory.length > 0 && <Callout tone="info" title="Cálculo baseado nos JSON">As necessidades são calculadas com a estrutura do produto, quantidade do pedido, lote mínimo e saldo livre do estoque.</Callout>}
    </div></div>
  </>;
}
