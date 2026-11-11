import { displayDate, numberPt } from '../data/pcpData.js';
import { Badge, Callout, DataTable, PageTitle, Panel, Progress, Row, SummaryStrip } from '../components/ui.jsx';

export default function Detalhe_da_Ordem({ item, onBack, onReschedule, onRegister }) {
  const remaining = Math.max(0, item.planned - item.done);
  return <>
    <PageTitle title={`Ordem ${item.id}`} subtitle={`${item.product} · pedido ${item.request}${item.client !== 'Estoque' ? ` · ${item.client}` : ''}`} actions={<><button className="outline" onClick={onBack}>Voltar</button><button className="outline" onClick={onReschedule}>Reprogramar</button><button className="primary" onClick={onRegister}>Registrar produção</button></>} />
    <SummaryStrip items={[["Produto",item.product],["Planejado",`${item.planned} un`],["Produzido",`${item.done} un`],["Início previsto",displayDate(item.startDate,true)],["Fim previsto",displayDate(item.endDate,true)],["Prioridade",item.priority],["Situação",item.status]]} />
    <div className="detail-grid"><Panel title="Andamento da ordem" subtitle="Quantidade produzida sobre a planejada e etapas do roteiro">
      <div className="production-progress"><b>{item.done} de {item.planned} unidades</b><span>faltam {remaining} · {Math.round(item.done / item.planned * 100)}% concluído</span><Progress value={Math.round(item.done / item.planned * 100)} /></div>
      <DataTable headers={['Etapa','Recurso','Tempo por un','Situação']}>
        {item.route.map((stage) => <Row key={stage.sequence}><td>Etapa {stage.sequence}</td><td>{stage.resource}</td><td>{stage.minutes} min/un</td><td><Badge>{stage.resource.toLowerCase().includes('pintura') && item.late ? 'Manutenção' : 'No roteiro'}</Badge></td></Row>)}
      </DataTable>
    </Panel><div className="stack">
      {item.note && <Callout tone={item.late?'danger':'info'} title={item.late?'Atenção à programação':'Observação da ordem'}>{item.note}</Callout>}
      <Panel title="Materiais da ordem" subtitle={`Necessidade para ${item.planned} unidades (calculada pela estrutura do produto)`}><DataTable headers={['Material','Necessário','Saldo livre']}>
        {item.structure.map((part) => {
          const required = part.quantidade * item.planned * (1 + (part.perda_percentual ?? 0) / 100);
          const free = part.stock ? part.stock.quantidade_disponivel - part.stock.quantidade_reservada : 0;
          return <Row key={part.material}><td>{part.materialInfo?.descricao ?? part.material}</td><td>{numberPt(required)} {part.materialInfo?.unidade_medida ?? ''}</td><td className={free < required ? 'negative' : ''}>{numberPt(free)}</td></Row>;
        })}
      </DataTable></Panel>
    </div></div>
  </>;
}
