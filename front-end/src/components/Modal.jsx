import { Callout } from './ui.jsx';

export default function Modal({ type, close, item, request, onSave, referenceDate, setReferenceDate }) {
  const isCreate = type === 'create-order';
  const isReprogram = type === 'reschedule';
  const isProduction = type === 'register';
  const title = isCreate ? 'Gerar ordem de produção' : isReprogram ? `Reprogramar ordem ${item.id}` : isProduction ? `Registrar produção da ${item.id}` : 'Editar data de referência';
  const submit = (event) => {
    event.preventDefault();
    const message = isCreate ? 'Prévia de ordem preenchida. A gravação ficará disponível ao conectar o backend.'
      : isReprogram ? 'Prévia de reprogramação preenchida. A gravação ficará disponível ao conectar o backend.'
        : isProduction ? 'Prévia de produção preenchida. O registro ficará disponível ao conectar o backend.'
          : 'Data de referência atualizada.';
    onSave(message);
  };
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}><form className="modal" onSubmit={submit}>
    <div className="modal-head"><div><h2>{title}</h2><p>{isCreate ? `A partir do pedido ${request.id} · ${request.client}` : isReprogram ? `${item.product} · situação ${item.status.toLowerCase()}` : isProduction ? `${item.product} · ${item.done} de ${item.planned} unidades produzidas` : 'A data de referência afeta o cálculo de atraso.'}</p></div><button type="button" className="close" onClick={close}>×</button></div>
    {isCreate && <><div className="form-grid"><label>Pedido<input defaultValue={`${request.id} · ${request.client}`} readOnly /></label><label>Produto<input defaultValue={`${request.productId} · ${request.product}`} readOnly /></label><label>Quantidade pedida<input defaultValue={`${request.qty} un`} readOnly /></label><label>Quantidade a produzir<input type="number" defaultValue={request.plannedQuantity} min={request.plannedQuantity} /></label><label>Prioridade<select defaultValue={request.priority}><option>Alta</option><option>Normal</option><option>Baixa</option></select></label><label>Destino da ordem<input defaultValue={`Atender o pedido ${request.id}`} /></label><label>Início previsto<input type="date" defaultValue="2026-11-24" /></label><label>Fim previsto<input type="date" defaultValue={request.deliveryDate} /></label><label className="full">Observação<input defaultValue="" placeholder="Observação opcional" /></label></div>{request.stock === 'Falta' && <Callout tone="danger" title="Falta de material">Confira os materiais necessários antes de liberar esta ordem.</Callout>}</>}
    {isReprogram && <div className="form-grid"><label>Início previsto<input type="date" defaultValue={item.startDate} /></label><label>Fim previsto<input type="date" defaultValue={item.endDate} /></label><label>Prioridade<select defaultValue={item.priority}><option>Normal</option><option>Alta</option><option>Baixa</option></select></label><label>Posição na sequência<input type="number" defaultValue={item.sequence} min="1" /></label><label className="full">Motivo da alteração<input defaultValue={item.note ?? ''} placeholder="Descreva o motivo" /></label></div>}
    {isProduction && <><div className="form-grid"><label>Quantidade produzida agora<input type="number" defaultValue="1" min="0" max={Math.max(0,item.planned-item.done)} /></label><label>Refugo<input type="number" defaultValue="0" min="0" /></label><label>Data do registro<input type="date" defaultValue="2026-11-03" /></label><label>Total após o registro<input value={`${item.done} de ${item.planned} un`} readOnly /></label></div><Callout title="Registro de demonstração">O apontamento será gravado quando o endpoint de produção estiver conectado.</Callout></>}
    {type === 'reference' && <div className="form-grid"><label>Data de referência<input type="date" value={referenceDate} onChange={(event) => setReferenceDate(event.target.value)} /></label></div>}
    <div className="modal-actions"><button type="button" className="outline" onClick={close}>Cancelar</button><button className="primary" type="submit">{isCreate?'Gerar ordem':isReprogram?'Salvar alterações':isProduction?'Registrar produção':'Salvar'}</button></div>
  </form></div>;
}
