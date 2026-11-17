import { useMemo, useState } from 'react';
import { useNav, useStore } from '../state/context.js';
import { Button, Callout, Field, Modal } from '../components/ui.jsx';
import { nextOrderNumber } from '../state/reducer.js';
import { addDays, formatDateLong, formatNumber, labels, plural, remainingText } from '../domain/format.js';

const estimateDays = (product, quantity, resources) =>
  product.route.reduce((sum, stage) => {
    const capacity = resources.find((resource) => resource.id === stage.resourceId)?.capacityHours ?? 8;
    return sum + Math.ceil((stage.minutes * quantity) / (capacity * 60));
  }, 0);

function CreateOrderModal({ requestId, onClose }) {
  const { model, state, act } = useStore();
  const { go, notify } = useNav();
  const pendingRequests = model.requests.filter((request) => request.pending);
  const [source, setSource] = useState(requestId ?? pendingRequests[0]?.id ?? 'estoque');
  const request = source === 'estoque' ? null : model.requestById.get(source);
  const [productId, setProductId] = useState(request?.productId ?? model.products.find((product) => product.active)?.id);
  const product = model.productById.get(request ? request.productId : productId);
  const suggested = request ? request.plannedQuantity : product.minimumLot;
  const [quantity, setQuantity] = useState(suggested);
  const [priority, setPriority] = useState(request?.priority ?? 'normal');
  const [start, setStart] = useState(state.referenceDate);
  const [end, setEnd] = useState(addDays(state.referenceDate, estimateDays(product, suggested, model.resources)));
  const [note, setNote] = useState('');

  const applySource = (value) => {
    setSource(value);
    const nextRequest = value === 'estoque' ? null : model.requestById.get(value);
    const nextProduct = model.productById.get(nextRequest ? nextRequest.productId : productId);
    const nextQuantity = nextRequest ? nextRequest.plannedQuantity : nextProduct.minimumLot;
    setQuantity(nextQuantity);
    setPriority(nextRequest?.priority ?? 'normal');
    setEnd(addDays(start, estimateDays(nextProduct, nextQuantity, model.resources)));
  };

  const qty = Number(quantity) || 0;
  const needs = useMemo(() => model.needsFor(product.id, qty), [model, product.id, qty]);
  const shortages = needs.filter((need) => need.shortage);
  const errors = {
    quantity: !Number.isInteger(qty) ? 'Use um número inteiro de unidades' : qty < product.minimumLot ? `Mínimo de ${product.minimumLot} un (lote mínimo)` : null,
    start: start < state.referenceDate ? 'O início não pode ser antes da emissão' : null,
    end: end < start ? 'O fim deve ser igual ou posterior ao início' : null,
  };
  const valid = !Object.values(errors).some(Boolean);
  const estimate = estimateDays(product, qty, model.resources);

  return (
    <Modal
      title="Nova ordem de produção"
      description={`A ordem nasce como planejada, com emissão em ${formatDateLong(state.referenceDate)}.`}
      onClose={onClose}
      size="lg"
      onSubmit={() => {
        if (!valid) return;
        const numero = nextOrderNumber(state.db.ordens);
        act('createOrder', { value: { pedido: request?.id ?? null, produto: product.id, quantidade: qty, prioridade: priority, inicio: start, fim: end, observacao: note } });
        onClose();
        notify(`Ordem ${numero} criada como planejada. Libere quando estiver pronta para produzir.`);
        go('ordem', numero);
      }}
      footer={
        <>
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="primary" type="submit" icon="plus" disabled={!valid}>
            Criar ordem
          </Button>
        </>
      }
    >
      <div className="form-grid">
        <Field label="Origem" full>
          <select className="select" value={source} onChange={(event) => applySource(event.target.value)}>
            {pendingRequests.map((item) => (
              <option key={item.id} value={item.id}>
                {item.id} · {item.client} · {item.quantity} un de {item.productName}
              </option>
            ))}
            <option value="estoque">Ordem para estoque (sem pedido)</option>
          </select>
        </Field>
        {!request && (
          <Field label="Produto" full>
            <select
              className="select"
              value={productId}
              onChange={(event) => {
                const next = model.productById.get(event.target.value);
                setProductId(next.id);
                setQuantity(next.minimumLot);
                setEnd(addDays(start, estimateDays(next, next.minimumLot, model.resources)));
              }}
            >
              {model.products
                .filter((item) => item.active)
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.id} · {item.name} ({labels.line[item.line].toLowerCase()})
                  </option>
                ))}
            </select>
          </Field>
        )}
        <Field
          label="Quantidade a produzir"
          error={errors.quantity}
          hint={request ? `Pedido de ${request.quantity} un · lote mínimo ${product.minimumLot}` : `Lote mínimo ${product.minimumLot} un`}
        >
          <input className="input" type="number" min={product.minimumLot} value={quantity} onChange={(event) => setQuantity(event.target.value)} />
        </Field>
        <Field label="Prioridade">
          <select className="select" value={priority} onChange={(event) => setPriority(event.target.value)}>
            <option value="alta">Alta</option>
            <option value="normal">Normal</option>
            <option value="baixa">Baixa</option>
          </select>
        </Field>
        <Field label="Início previsto" error={errors.start}>
          <input className="input" type="date" value={start} onChange={(event) => setStart(event.target.value)} />
        </Field>
        <Field label="Fim previsto" error={errors.end} hint={`Estimativa pela capacidade dos recursos: ${plural(estimate, 'dia')}`}>
          <input className="input" type="date" value={end} onChange={(event) => setEnd(event.target.value)} />
        </Field>
        <Field label="Observação" full>
          <input className="input" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Opcional" />
        </Field>
      </div>
      {request && end > request.deliveryDate && (
        <Callout tone="warning" title="Fim depois da entrega">
          O pedido {request.id} deve ser entregue em {formatDateLong(request.deliveryDate)}.
        </Callout>
      )}
      {shortages.length > 0 && (
        <Callout tone="danger" title="Saldo livre insuficiente">
          {shortages.map((need) => `${need.name}: faltam ${formatNumber(need.missing)} ${need.unit}`).join(' · ')}. A ordem pode ser planejada, mas só deve ser liberada após a reposição.
        </Callout>
      )}
      {product.blockedStages.length > 0 && (
        <Callout tone="warning" icon="wrench" title="Recurso em manutenção no roteiro">
          {product.blockedStages.map((stage) => stage.resourceName).join(', ')} está parado.
        </Callout>
      )}
    </Modal>
  );
}

function RescheduleModal({ orderId, onClose }) {
  const { model, act } = useStore();
  const { notify } = useNav();
  const order = model.orderById.get(orderId);
  const position = model.openOrders.findIndex((item) => item.id === orderId) + 1;
  const [start, setStart] = useState(order.startDate);
  const [end, setEnd] = useState(order.endDate);
  const [priority, setPriority] = useState(order.priority);
  const [pos, setPos] = useState(position);
  const [reason, setReason] = useState('');
  const errors = {
    start: start < order.issuedAt ? `Não pode ser antes da emissão (${formatDateLong(order.issuedAt)})` : null,
    end: end < start ? 'O fim deve ser igual ou posterior ao início' : null,
    pos: !Number.isInteger(Number(pos)) || pos === '' || pos < 1 || pos > model.openOrders.length ? `Use uma posição inteira entre 1 e ${model.openOrders.length}` : null,
  };
  const valid = !Object.values(errors).some(Boolean);

  return (
    <Modal
      title={`Reprogramar ${order.id}`}
      description={`${order.productName} · ${order.requestId ? `entrega do pedido em ${formatDateLong(order.deliveryDate)}` : 'ordem para estoque'}`}
      onClose={onClose}
      onSubmit={() => {
        if (!valid) return;
        act('reschedule', { value: { numero: order.id, inicio: start, fim: end, prioridade: priority, posicao: Number(pos), motivo: reason.trim() } });
        onClose();
        notify(`Programação da ${order.id} atualizada.`);
      }}
      footer={
        <>
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="primary" type="submit" disabled={!valid}>
            Salvar alterações
          </Button>
        </>
      }
    >
      <div className="form-grid">
        <Field label="Início previsto" error={errors.start}>
          <input className="input" type="date" value={start} onChange={(event) => setStart(event.target.value)} />
        </Field>
        <Field label="Fim previsto" error={errors.end}>
          <input className="input" type="date" value={end} onChange={(event) => setEnd(event.target.value)} />
        </Field>
        <Field label="Prioridade">
          <select className="select" value={priority} onChange={(event) => setPriority(event.target.value)}>
            <option value="alta">Alta</option>
            <option value="normal">Normal</option>
            <option value="baixa">Baixa</option>
          </select>
        </Field>
        <Field label="Posição na sequência" error={errors.pos} hint={`Hoje é a ${position}ª de ${model.openOrders.length}`}>
          <input className="input" type="number" min="1" max={model.openOrders.length} value={pos} onChange={(event) => setPos(event.target.value)} />
        </Field>
        <Field label="Motivo da alteração" full hint="Fica registrado na observação da ordem">
          <input className="input" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Ex.: aguardando a volta da cabine de pintura" />
        </Field>
      </div>
      {order.deliveryDate && end > order.deliveryDate && (
        <Callout tone="warning" title="Fim depois da entrega">
          A nova data passa da entrega prometida ao cliente ({formatDateLong(order.deliveryDate)}).
        </Callout>
      )}
    </Modal>
  );
}

function RegisterModal({ orderId, onClose }) {
  const { model, state, act } = useStore();
  const { notify } = useNav();
  const order = model.orderById.get(orderId);
  const [quantity, setQuantity] = useState(Math.min(1, order.remaining));
  const [scrap, setScrap] = useState(0);
  const [date, setDate] = useState(state.referenceDate);
  const qty = Number(quantity) || 0;
  const lost = Number(scrap) || 0;
  const total = order.produced + qty;
  const closes = total + lost >= order.planned;
  const errors = {
    quantity: !Number.isInteger(qty) ? 'Use um número inteiro' : qty < 0 ? 'Não pode ser negativa' : qty + lost > order.remaining ? `Restam ${order.remaining} un nesta ordem` : null,
    scrap: !Number.isInteger(lost) ? 'Use um número inteiro' : lost < 0 ? 'Não pode ser negativo' : null,
    date: date < order.issuedAt ? 'Data antes da emissão da ordem' : null,
  };
  const valid = qty + lost > 0 && !Object.values(errors).some(Boolean);

  return (
    <Modal
      title={`Registrar produção · ${order.id}`}
      description={`${order.productName} · ${order.produced} de ${order.planned} un produzidas até agora`}
      onClose={onClose}
      onSubmit={() => {
        if (!valid) return;
        act('registerProduction', { value: { numero: order.id, quantidade: qty, refugo: lost, data: date } });
        onClose();
        notify(closes ? `Ordem ${order.id} concluída.` : `Produção registrada: ${total} de ${order.planned} un.`);
      }}
      footer={
        <>
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="primary" type="submit" icon="check" disabled={!valid}>
            Registrar
          </Button>
        </>
      }
    >
      <div className="form-grid">
        <Field label="Unidades boas produzidas" error={errors.quantity}>
          <input className="input" type="number" min="0" max={order.remaining} value={quantity} onChange={(event) => setQuantity(event.target.value)} />
        </Field>
        <Field label="Unidades refugadas" error={errors.scrap} hint="Peças perdidas no processo">
          <input className="input" type="number" min="0" value={scrap} onChange={(event) => setScrap(event.target.value)} />
        </Field>
        <Field label="Data do registro" error={errors.date}>
          <input className="input" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </Field>
        <Field label="Após o registro">
          <output className="input input-readonly">
            {total} de {order.planned} un · {Math.round((total / order.planned) * 100)}%
          </output>
        </Field>
      </div>
      {valid &&
        (closes ? (
          <Callout tone="success" title="A ordem será concluída">
            {total < order.planned ? `Conclusão com ${total} de ${order.planned} un (${lost} refugada${lost === 1 ? '' : 's'}).` : 'Toda a quantidade planejada foi produzida.'}
            {order.requestId && ` O pedido ${order.requestId} passa para atendido.`}
          </Callout>
        ) : (
          <Callout tone="info" title="A ordem continua em produção">
            Depois deste registro, {remainingText(order.planned - total - lost)} para concluir.
          </Callout>
        ))}
    </Modal>
  );
}

function CancelModal({ orderId, onClose }) {
  const { model, act } = useStore();
  const { notify } = useNav();
  const order = model.orderById.get(orderId);
  const [reason, setReason] = useState('');
  const requestBack = order.requestId && !model.orders.some((item) => item.requestId === order.requestId && item.id !== order.id && item.open);
  return (
    <Modal
      title={`Cancelar ${order.id}?`}
      description={`${order.productName} · ${order.produced} de ${order.planned} un produzidas`}
      onClose={onClose}
      onSubmit={() => {
        act('cancel', { id: order.id, reason: reason.trim() ? `Cancelada: ${reason.trim()}` : 'Ordem cancelada' });
        onClose();
        notify(`Ordem ${order.id} cancelada.`);
      }}
      footer={
        <>
          <Button onClick={onClose}>Manter ordem</Button>
          <Button variant="danger" type="submit" icon="ban">
            Cancelar ordem
          </Button>
        </>
      }
    >
      <Callout tone="warning" title="A ordem sai da programação">
        Ela continua no histórico com a situação cancelada.
        {requestBack && ` O pedido ${order.requestId} volta para pendente.`}
      </Callout>
      <Field label="Motivo" full hint="Fica registrado na observação da ordem">
        <input className="input" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Ex.: pedido cancelado pelo cliente" autoFocus />
      </Field>
    </Modal>
  );
}

function ResetModal({ onClose }) {
  const { act } = useStore();
  const { go, notify } = useNav();
  return (
    <Modal
      title="Restaurar os dados originais?"
      description="Recarrega os sete arquivos JSON e descarta tudo o que foi feito nesta sessão."
      onClose={onClose}
      onSubmit={() => {
        act('reset');
        onClose();
        go('dashboard');
        notify('Dados recarregados dos arquivos JSON.');
      }}
      footer={
        <>
          <Button onClick={onClose}>Continuar com as alterações</Button>
          <Button variant="danger" type="submit" icon="reset">
            Restaurar
          </Button>
        </>
      }
    >
      <Callout tone="warning" title="Ordens criadas, registros de produção e reprogramações desta sessão serão perdidos." />
    </Modal>
  );
}

function ReferenceModal({ onClose }) {
  const { state, act } = useStore();
  const { notify } = useNav();
  const [value, setValue] = useState(state.referenceDate);
  return (
    <Modal
      title="Data de referência"
      description="É o “hoje” do sistema: define quais ordens estão atrasadas e quantos dias faltam para cada entrega."
      onClose={onClose}
      onSubmit={() => {
        if (!value) return;
        act('setReferenceDate', { value });
        onClose();
        notify(`Data de referência alterada para ${formatDateLong(value)}.`);
      }}
      footer={
        <>
          <Button onClick={() => setValue(state.db.configuracao.data_referencia)}>Usar a data do estoque</Button>
          <Button variant="primary" type="submit" disabled={!value}>
            Aplicar
          </Button>
        </>
      }
    >
      <Field label="Data" hint={`Data da posição de estoque: ${formatDateLong(state.db.configuracao.data_referencia)}`} full>
        <input className="input" type="date" value={value} onChange={(event) => setValue(event.target.value)} required />
      </Field>
    </Modal>
  );
}

export default function Modals() {
  const { modal, closeModal } = useNav();
  if (!modal) return null;
  if (modal.type === 'createOrder') return <CreateOrderModal requestId={modal.requestId} onClose={closeModal} />;
  if (modal.type === 'reschedule') return <RescheduleModal orderId={modal.orderId} onClose={closeModal} />;
  if (modal.type === 'register') return <RegisterModal orderId={modal.orderId} onClose={closeModal} />;
  if (modal.type === 'reference') return <ReferenceModal onClose={closeModal} />;
  if (modal.type === 'reset') return <ResetModal onClose={closeModal} />;
  if (modal.type === 'cancel') return <CancelModal orderId={modal.orderId} onClose={closeModal} />;
  return null;
}
