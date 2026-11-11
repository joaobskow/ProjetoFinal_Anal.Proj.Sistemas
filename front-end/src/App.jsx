import { useEffect, useMemo, useRef, useState } from "react";
import { orders, requests, products, inventory, resources, numberPt, referenceDateLabel, dashboardSummary, openOrders, lowInventoryItems, ordersForSchedule, scheduleWeekLabels } from "./data/pcpData.js";

const navItems = [
  ["Visão geral", "▦"],
  ["Pedidos", "▤"],
  ["Produtos", "⬡"],
  ["Estoque", "◇"],
  ["Recursos", "☼"],
  ["Ordens de produção", "☷"],
  ["Programação", "▦"],
];
const badges = (value) => (
  <span className={`badge ${String(value).toLowerCase().replaceAll(" ", "-")}`}>
    {value}
  </span>
);
const DataTable = ({ headers, children, onRowClick }) => (
  <div className="table-wrap">
    <table>
      <thead>
        <tr>
          {headers.map((h) => (
            <th key={h}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  </div>
);
const Row = ({ children, onClick }) => (
  <tr className={onClick ? "clickable" : ""} onClick={onClick}>
    {children}
  </tr>
);

export default function App() {
  const [page, setPage] = useState("Visão geral");
  const [request, setRequest] = useState(requests[0] ?? null);
  const [product, setProduct] = useState(products[0] ?? null);
  const [order, setOrder] = useState(orders[0] ?? null);
  const [modal, setModal] = useState("");
  const [notice, setNotice] = useState("");
  const [filter, setFilter] = useState("Todos");
  const [priority, setPriority] = useState("Todas as prioridades");
  const [line, setLine] = useState("Todas as linhas");
  const [search, setSearch] = useState("");
  const [schedule, setSchedule] = useState(ordersForSchedule);
  const [referenceDate, setReferenceDate] = useState(referenceDateLabel);
  const notify = (text) => {
    setNotice(text);
    window.setTimeout(() => setNotice(""), 3000);
  };
  const filteredRequests = useMemo(
    () =>
      requests.filter((r) => {
        const category =
          filter === "Todos" ||
          (filter === "Pendentes" && r.status === "Pendente") ||
          (filter === "Em produção" && r.status === "Em produção") ||
          (filter === "Atendidos" && r.status === "Atendido") ||
          (filter === "Cancelados" && r.status === "Cancelado");
        const query = `${r.id} ${r.client} ${r.product}`
          .toLowerCase()
          .includes(search.toLowerCase());
        return (
          category &&
          query &&
          (priority === "Todas as prioridades" || r.priority === priority) &&
          (line === "Todas as linhas" ||
            products.find((product) => product.name === r.product)?.line === line)
        );
      }),
    [filter, line, search, priority],
  );
  const openRequest = (r) => {
    setRequest(r);
    setPage("Detalhe do pedido");
  };
  const openProduct = (p) => {
    setProduct(p);
    setPage("Detalhe do produto");
  };
  const openOrder = (o) => {
    setOrder(o);
    setPage("Detalhe da ordem");
  };
  const primaryAction = (text) => {
    setModal("");
    notify(text);
  };
  const activeNavPage =
    page === "Detalhe do produto"
      ? "Produtos"
      : page === "Detalhe do pedido"
        ? "Pedidos"
        : page === "Detalhe da ordem"
          ? "Ordens de produção"
          : page;
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">A</span>
          <span>
            <b>AgroPCP</b>
            <small>AgroVale Implementos</small>
          </span>
        </div>
        <div className="menu-label">MENU</div>
        <nav>
          {navItems.map(([label, icon]) => (
            <button
              key={label}
              className={`nav-link ${activeNavPage === label ? "selected" : ""}`}
              onClick={() => {
                setPage(label);
                setFilter("Todos");
                setSearch("");
              }}
            >
              <span className="nav-glyph">{icon}</span>
              {label}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="reference">
            <small>DATA DE REFERÊNCIA</small>
            <strong>
              {referenceDate}{" "}
              <button onClick={() => setModal("reference")}>Editar</button>
            </strong>
            <small>Base para “atrasada”</small>
          </div>
          <div className="profile">
            <span>PC</span>
            <div>
              Planejador<small>Equipe PCP</small>
            </div>
          </div>
        </div>
      </aside>
      <main className="main-area">
        <section className="page-content">
          {page === "Visão geral" && (
            <Dashboard
              setPage={setPage}
              openOrder={openOrder}
              openRequest={openRequest}
              setLine={setLine}
              line={line}
              openInventory={() => {
                setPage("Estoque");
                setFilter("Abaixo do mínimo");
              }}
            />
          )}
          {page === "Pedidos" && (
            <RequestsPage
              rows={filteredRequests}
              filter={filter}
              setFilter={setFilter}
              priority={priority}
              setPriority={setPriority}
              line={line}
              setLine={setLine}
              search={search}
              setSearch={setSearch}
              onOpen={openRequest}
            />
          )}
          {page === "Detalhe do pedido" && (
            <RequestDetail
              item={request}
              onBack={() => setPage("Pedidos")}
              onGenerate={() => setModal("create-order")}
            />
          )}
          {page === "Produtos" && <ProductsPage onOpen={openProduct} />}
          {page === "Detalhe do produto" && (
            <ProductDetail item={product} onBack={() => setPage("Produtos")} />
          )}
          {page === "Estoque" && (
            <InventoryPage
              filter={filter}
              setFilter={setFilter}
              search={search}
              setSearch={setSearch}
            />
          )}
          {page === "Recursos" && (
            <ResourcesPage line={line} setLine={setLine} />
          )}
          {page === "Ordens de produção" && (
            <OrdersPage
              filter={filter}
              setFilter={setFilter}
              line={line}
              setLine={setLine}
              onOpen={openOrder}
              onCreate={() => setModal("create-order")}
            />
          )}
          {page === "Detalhe da ordem" && (
            <OrderDetail
              item={order}
              onBack={() => setPage("Ordens de produção")}
              onReschedule={() => setModal("reschedule")}
              onRegister={() => setModal("register")}
            />
          )}
          {page === "Programação" && (
            <SchedulePage
              rows={schedule}
              setRows={setSchedule}
              onReschedule={() => setModal("reschedule")}
              onOpen={openOrder}
              line={line}
              setLine={setLine}
              onSave={() =>
                notify("Programação salva no modo de demonstração.")
              }
            />
          )}
        </section>
      </main>
      {modal && (
        <Modal
          type={modal}
          close={() => setModal("")}
          item={order}
          request={request}
          onSave={primaryAction}
          referenceDate={referenceDate}
          setReferenceDate={setReferenceDate}
        />
      )}
      {notice && <div className="toast">✓ {notice}</div>}
    </div>
  );
}

function PageTitle({ title, subtitle, actions }) {
  return (
    <div className="page-title">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions && <div className="title-actions">{actions}</div>}
    </div>
  );
}
function Segments({ items, value, onChange }) {
  return (
    <div className="segments">
      {items.map((i) => (
        <button
          key={i}
          className={i === value ? "active" : ""}
          onClick={() => onChange(i)}
        >
          {i}
        </button>
      ))}
    </div>
  );
}
function FilterSelect({ label, value, onChange, items }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef(null);
  const visibleItems = items.filter((item) => item.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!wrapperRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  const choose = (item) => {
    onChange(item);
    setQuery("");
    setOpen(false);
  };

  return (
    <div className={`filter-select-wrap ${open ? "is-open" : ""}`} ref={wrapperRef}>
      <label className="filter-select-label">{label}</label>
      <div className="filter-combobox">
        <input
          className="filter-select"
          role="combobox"
          aria-label={label}
          aria-expanded={open}
          aria-autocomplete="list"
          value={open ? query : value}
          placeholder={value}
          onFocus={() => { setQuery(""); setOpen(true); }}
          onChange={(event) => { setQuery(event.target.value); setOpen(true); }}
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false);
            if (event.key === "Enter" && visibleItems[0]) { event.preventDefault(); choose(visibleItems[0]); }
          }}
        />
        <button type="button" className="filter-select-arrow" aria-label={`Abrir opções de ${label}`} onClick={() => { setOpen((current) => !current); setQuery(""); }}>
          <span />
        </button>
      </div>
      {open && <div className="filter-select-menu" role="listbox" aria-label={label}>
        {visibleItems.map((item) => <button type="button" role="option" aria-selected={item === value} key={item} className={item === value ? "selected" : ""} onMouseDown={(event) => event.preventDefault()} onClick={() => choose(item)}>{item}</button>)}
        {visibleItems.length === 0 && <div className="filter-select-empty">Nenhuma opção encontrada</div>}
      </div>}
    </div>
  );
}
function FilterLine({ line, setLine }) {
  return (
    <Segments
      items={["Todas as linhas", "Pesada", "Leve"]}
      value={line}
      onChange={setLine}
    />
  );
}

function Dashboard({
  setPage,
  openOrder,
  openRequest,
  setLine,
  line,
  openInventory,
}) {
  const visibleOpenOrders = openOrders.filter((order) =>
    line === "Todas as linhas" || products.find((product) => product.code === order.productId)?.line === line,
  );
  return (
    <>
      <PageTitle
        title="Visão geral do PCP"
        subtitle={`Programação e andamento da produção · estoque de referência em ${referenceDateLabel}`}
        actions={<FilterLine line={line} setLine={setLine} />}
      />
      <div className="metric-grid">
        <Metric
          label="Pedidos pendentes"
          value={dashboardSummary.pendingRequests}
          detail={`${requests.filter((request) => request.stock === "Falta").length} com falta de material`}
        />
        <Metric
          label="Ordens abertas"
          value={dashboardSummary.openOrders}
          detail={`${openOrders.filter((item) => item.status === "Em produção").length} em produção · ${openOrders.filter((item) => item.status === "Liberada").length} liberadas · ${openOrders.filter((item) => item.status === "Planejada").length} planejadas`}
        />
        <Metric
          label="Ordens atrasadas"
          value={dashboardSummary.lateOrders}
          detail={orders.find((item) => item.late)?.id ?? "Sem ordens atrasadas"}
          tone="red"
        />
        <Metric
          label="Abaixo do estoque mínimo"
          value={dashboardSummary.lowInventory}
          detail={lowInventoryItems.map((item) => item.name).join(" e ") || "Nenhum item abaixo do mínimo"}
          tone="amber"
        />
      </div>
      <div className="dashboard-grid">
        <Panel
          title="Ordens abertas"
          subtitle="Ordenadas pela sequência de programação"
        >
          <DataTable
            headers={[
              "Ordem",
              "Produto",
              "Produzido",
              "Progresso",
              "Fim previsto",
              "Situação",
            ]}
          >
            {visibleOpenOrders.map((o) => (
              <Row key={o.id} onClick={() => openOrder(o)}>
                <td className="code">{o.id}</td>
                <td>{o.product}</td>
                <td>
                  {o.done} de {o.planned}
                </td>
                <td>
                  <Progress value={Math.round((o.done / o.planned) * 100)} />
                </td>
                <td>{o.end}</td>
                <td>{badges(o.status)}</td>
              </Row>
            ))}
            {visibleOpenOrders.length === 0 && <tr><td colSpan={6} className="empty-state">Nenhuma ordem aberta para esta linha.</td></tr>}
          </DataTable>
        </Panel>
        <Panel title="Alertas e pendências" subtitle={`${requests.filter((item) => item.stock === "Falta").length + dashboardSummary.lateOrders + lowInventoryItems.length} pontos exigem atenção`}>
          <div className="alert-list">
            <Alert
              title="Falta"
              text={requests.find((item) => item.stock === "Falta") ? `${requests.find((item) => item.stock === "Falta").id} · ${requests.find((item) => item.stock === "Falta").product} · materiais insuficientes` : "Sem pedidos com falta de material"}
              action="Gerar ordem"
              onClick={() => { const item = requests.find((entry) => entry.stock === "Falta"); if (item) openRequest(item); }}
            />
            <Alert
              title="Atrasada"
              text={orders.find((item) => item.late) ? `${orders.find((item) => item.late).id} · ${orders.find((item) => item.late).product} · prazo excedido` : "Sem ordens atrasadas"}
              action="Reprogramar"
              onClick={() => { const item = orders.find((entry) => entry.late) ?? openOrders[0]; if (item) openOrder(item); }}
            />
            <Alert
              title="Abaixo do mínimo"
              text={lowInventoryItems.map((item) => `${item.name}: ${item.available} (mín. ${item.min})`).join(" · ") || "Nenhum material abaixo do mínimo"}
              action="Ver estoque"
              onClick={openInventory}
            />
          </div>
        </Panel>
      </div>
      <Panel
        title="Carga dos recursos produtivos"
        subtitle="Ocupação prevista da capacidade diária (horas/dia)"
      >
        <DataTable headers={["Recurso", "Capacidade", "Ocupação", "Situação"]}>
          {resources.map((r) => (
            <Row key={r.name}>
              <td>{r.name}</td>
              <td>{r.capacity}</td>
              <td>
                <Progress value={r.occupancy} />
              </td>
              <td>{badges(r.status)}</td>
            </Row>
          ))}
        </DataTable>
      </Panel>
    </>
  );
}
function Metric({ label, value, detail, tone = "" }) {
  return (
    <article className="metric-card">
      <span>{label}</span>
      <strong className={tone}>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}
function Panel({ title, subtitle, children, className = "" }) {
  return (
    <article className={`panel ${className}`}>
      {(title || subtitle) && (
        <div className="panel-heading">
          <div>
            {title && <h2>{title}</h2>}
            {subtitle && <p>{subtitle}</p>}
          </div>
        </div>
      )}
      {children}
    </article>
  );
}
function Alert({ title, text, action, onClick }) {
  return (
    <div className="alert-item">
      <div className="alert-top">
        {badges(title)}
        <button className="outline small" onClick={onClick}>
          {action} →
        </button>
      </div>
      <p>{text}</p>
    </div>
  );
}
function Progress({ value }) {
  return (
    <div className="progress-cell">
      <span className="progress-track">
        <i style={{ width: `${value}%` }} className={value < 60 ? "low" : ""} />
      </span>
      <small>{value}%</small>
    </div>
  );
}

function RequestsPage({
  rows,
  filter,
  setFilter,
  priority,
  setPriority,
  line,
  setLine,
  search,
  setSearch,
  onOpen,
}) {
  return (
    <>
      <PageTitle
        title="Pedidos"
      />
      <div className="request-filter-card">
        <div className="request-filter-group">
          <FilterSelect label="Status" value={filter} onChange={setFilter} items={["Todos", "Pendentes", "Em produção", "Atendidos", "Cancelados"]} />
          <FilterSelect label="Linha" value={line} onChange={setLine} items={["Todas as linhas", "Pesada", "Leve"]} />
          <FilterSelect label="Prioridade" value={priority} onChange={setPriority} items={["Todas as prioridades", "Alta", "Normal", "Baixa"]} />
        </div>
        <input
          className="search"
          placeholder="Buscar pedido, cliente ou produto"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <Panel className="flush requests-table">
        <DataTable
          headers={[
            "Pedido",
            "Cliente",
            "Produto",
            "Qtd",
            "Pedido em",
            "Entrega",
            "Prioridade",
            "Situação",
            "Estoque",
          ]}
        >
          {rows.map((r) => (
            <Row key={r.id} onClick={() => onOpen(r)}>
              <td className="code">{r.id}</td>
              <td>{r.client}</td>
              <td>{r.product}</td>
              <td>{r.qty}</td>
              <td className="muted">{r.ordered}</td>
              <td>{r.delivery}</td>
              <td>{badges(r.priority)}</td>
              <td>{badges(r.status)}</td>
              <td>{r.stock === "—" ? "—" : badges(r.stock)}</td>
            </Row>
          ))}
        </DataTable>
      </Panel>
    </>
  );
}
function SummaryStrip({ items }) {
  return (
    <div className="summary-strip">
      {items.map(([label, value]) => (
        <div key={label}>
          <small>{label}</small>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}
function RequestDetail({ item, onBack, onGenerate }) {
  const product = products.find((entry) => entry.name === item.product);
  const minimumLot = product?.minimumLot ?? 1;
  const plannedQuantity = Math.ceil(item.qty / minimumLot) * minimumLot;
  const materialRows = (product?.structure ?? []).map((part) => {
    const material = part.materialInfo ?? {};
    const free = part.stock
      ? part.stock.quantidade_disponivel - part.stock.quantidade_reservada
      : 0;
    const required = part.quantidade * plannedQuantity * (1 + (part.perda_percentual ?? 0) / 100);
    return {
      id: part.material,
      name: material.descricao ?? part.material,
      unit: material.unidade_medida ?? "—",
      quantity: numberPt(part.quantidade),
      loss: part.perda_percentual == null ? "—" : `${part.perda_percentual}%`,
      required: numberPt(required),
      free: numberPt(free),
      shortage: required > free,
    };
  });
  const shortages = materialRows.filter((part) => part.shortage);
  const route = product?.route ?? [];
  return (
    <>
      <PageTitle
        title={`Pedido ${item.id}`}
        subtitle="Verificação de estoque e necessidade de materiais para atender o pedido"
        actions={
          <>
            <button className="outline" onClick={onBack}>Voltar</button>
            <button className="primary" onClick={onGenerate}>Gerar ordem de produção</button>
          </>
        }
      />
      <SummaryStrip
        items={[
          ["Cliente", item.client],
          ["Produto", item.product],
          ["Quantidade pedida", `${item.qty} un`],
          ["Ordem a produzir", `${plannedQuantity} un (lote mínimo ${minimumLot})`],
          ["Entrega prometida", item.delivery],
          ["Prioridade", item.priority],
          ["Situação", shortages.length ? "Falta" : item.stock],
        ]}
      />
      <div className="detail-grid">
        <Panel
          title="Estrutura do produto e necessidade de materiais"
          subtitle="Necessidade = quantidade × qtd por unidade × (1 + perda)"
        >
          <DataTable headers={["Material", "Un", "Qtd/un", "Perda", "Necessário", "Saldo livre", "Situação"]}>
            {materialRows.map((part) => (
              <Row key={part.id}>
                <td>{part.name}</td>
                <td>{part.unit}</td>
                <td>{part.quantity}</td>
                <td>{part.loss}</td>
                <td className={part.shortage ? "negative" : ""}>{part.required}</td>
                <td className={part.shortage ? "negative" : ""}>{part.free}</td>
                <td>{badges(part.shortage ? "Falta" : "Disponível")}</td>
              </Row>
            ))}
          </DataTable>
        </Panel>
        <div className="stack">
          {shortages.length > 0 && (
            <Callout tone="danger" title="Falta de material">
              Saldo livre insuficiente para: {shortages.map((part) => part.name).join(", ")}.
            </Callout>
          )}
          <Panel title="Roteiro e horas necessárias" subtitle={`Para ${plannedQuantity} unidades`}>
            <DataTable headers={["Etapa", "Tempo", "Total"]}>
              {route.map((stage) => (
                <Row key={stage.sequence}>
                  <td>{stage.resource}</td>
                  <td>{stage.minutes} min/un</td>
                  <td>{numberPt(stage.minutes * plannedQuantity / 60)} h</td>
                </Row>
              ))}
            </DataTable>
          </Panel>
        </div>
      </div>
    </>
  );
}
function ProductsPage({ onOpen }) {
  const heavyCount = products.filter((p) => p.line === "Pesada" && p.active).length;
  const lightCount = products.filter((p) => p.line === "Leve" && p.active).length;
  const activeCount = products.filter((p) => p.active).length;
  const [category, setCategory] = useState(`Todos (${activeCount})`);
  const rows = products.filter(
    (p) =>
      category === `Todos (${activeCount})` && p.active ||
      (category === `Linha pesada (${heavyCount})` && p.line === "Pesada" && p.active) ||
      (category === `Linha leve (${lightCount})` && p.line === "Leve" && p.active),
  );
  return (
    <>
      <PageTitle
        title="Produtos"
        subtitle={`${activeCount} produtos ativos · 2 linhas de produção · roteiro e lista de materiais de cada produto`}
      />
      <Segments
        items={[`Todos (${activeCount})`, `Linha pesada (${heavyCount})`, `Linha leve (${lightCount})`]}
        value={category}
        onChange={setCategory}
      />
      <Panel className="flush">
        <DataTable
          headers={[
            "Código",
            "Produto",
            "Linha",
            "Lote mínimo",
            "Etapas",
            "Tempo por un",
            "Materiais",
            "Situação",
          ]}
        >
          {rows.map((p) => (
            <Row key={p.code} onClick={() => onOpen(p)}>
              <td className="code">{p.code}</td>
              <td>{p.name}</td>
              <td>{p.line}</td>
              <td>{p.lot}</td>
              <td>{p.steps}</td>
              <td>{p.time}</td>
              <td>{p.materials}</td>
              <td>{badges(p.active ? "Ativo" : "Inativo")}</td>
            </Row>
          ))}
        </DataTable>
      </Panel>
    </>
  );
}
function ProductDetail({ item, onBack }) {
  const includesPainting = item.route.some((stage) => stage.resource.toLowerCase().includes("pintura"));
  return (
    <>
      <PageTitle
        title={item.name}
        subtitle={`${item.code} · linha ${item.line.toLowerCase()} · lista de materiais e roteiro de produção`}
        actions={
          <button className="outline" onClick={onBack}>
            Voltar
          </button>
        }
      />
      <SummaryStrip
        items={[
          ["Código", item.code],
          ["Linha", item.line],
          ["Lote mínimo", item.lot],
          ["Tempo por unidade", item.time],
          ["Materiais", item.materials],
          ["Situação", item.active ? "Ativo" : "Inativo"],
        ]}
      />
      <div className="detail-grid">
        <Panel
          title="Lista de materiais"
          subtitle="Quantidade por unidade produzida, com a perda prevista de cada material"
        >
          <DataTable
            headers={["Material", "Tipo", "Un", "Qtd/un", "Perda", "Reposição"]}
          >
            {item.structure.map((part) => {
              const material = part.materialInfo ?? {};
              const type = material.tipo === "materia_prima"
                ? "Matéria-prima"
                : material.tipo === "embalagem"
                  ? "Embalagem"
                  : "Componente";
              return (
                <Row key={part.material}>
                  <td>{material.descricao ?? part.material}</td>
                  <td>{type}</td>
                  <td>{material.unidade_medida ?? "—"}</td>
                  <td>{numberPt(part.quantidade)}</td>
                  <td>{part.perda_percentual == null ? "—" : `${part.perda_percentual}%`}</td>
                  <td>{material.prazo_reposicao_dias == null ? "—" : `${material.prazo_reposicao_dias} dias`}</td>
                </Row>
              );
            })}
          </DataTable>
        </Panel>
        <div className="stack">
          <Panel
            title="Roteiro de produção"
            subtitle="Tempo por unidade em cada etapa"
          >
            <DataTable headers={["Etapa", "Tempo"]}>
              {item.route.map((stage) => (
                <Row key={stage.sequence}>
                  <td>{stage.sequence} · {stage.resource}</td>
                  <td>{stage.minutes} min</td>
                </Row>
              ))}
            </DataTable>
          </Panel>
          <Callout title={includesPainting ? "Pintura no roteiro" : "Sem pintura no roteiro"} tone="info">
            {includesPainting
              ? "Este produto passa pela cabine de pintura; considere a disponibilidade do recurso ao programar a produção."
              : "Este produto não passa pela cabine de pintura; então a manutenção da cabine não atrasa suas ordens."}
          </Callout>
        </div>
      </div>
    </>
  );
}
function InventoryPage({ filter, setFilter, search, setSearch }) {
  const countsByType = inventory.reduce((counts, item) => ({ ...counts, [item.type]: (counts[item.type] ?? 0) + 1 }), {});
  const lowCount = inventory.filter((item) => item.status === "Abaixo do mínimo").length;
  const categoryItems = [`Todos (${inventory.length})`, `Abaixo do mínimo (${lowCount})`, ...Object.entries(countsByType).map(([type, count]) => `${type} (${count})`)];
  const [category, setCategory] = useState(categoryItems[0]);
  const filtered = inventory.filter(
    (m) =>
      (category.startsWith("Abaixo")
        ? m.status === "Abaixo do mínimo"
        : category === categoryItems[0] ||
          m.type === category.replace(/ \(.*\)/, "")) &&
      `${m.code} ${m.name}`.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <>
      <PageTitle
        title="Estoque"
        subtitle={`Posição em ${referenceDateLabel} · saldo livre = disponível − reservado`}
      />
      <div className="page-tools">
        <Segments
          items={[
            ...categoryItems,
          ]}
          value={category}
          onChange={(v) => {
            setCategory(v);
            setFilter(v.startsWith("Abaixo") ? "Abaixo do mínimo" : "Todos");
          }}
        />
        <input
          className="search"
          placeholder="Buscar material"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <Panel className="flush">
        <DataTable
          headers={[
            "Código",
            "Material",
            "Tipo",
            "Un",
            "Disponível",
            "Reservado",
            "Saldo livre",
            "Mínimo",
            "Reposição",
            "Situação",
          ]}
        >
          {filtered.map((m) => (
            <Row key={m.code}>
              <td className="code">{m.code}</td>
              <td>{m.name}</td>
              <td>{m.type}</td>
              <td>{m.unit}</td>
              <td>{m.available}</td>
              <td>{m.reserved}</td>
              <td>{m.free}</td>
              <td>{m.min}</td>
              <td>{m.replenishment}</td>
              <td>{badges(m.status)}</td>
            </Row>
          ))}
        </DataTable>
      </Panel>
    </>
  );
}
function ResourcesPage({ line, setLine }) {
  const maintenanceResource = resources.find((resource) => resource.status === "Manutenção");
  const maintenanceProductCount = maintenanceResource ? products.filter((product) => product.route.some((stage) => stage.resourceId === maintenanceResource.code)).length : 0;
  const productCountByLine = (name) => products.filter((product) => product.active && product.line === name).length;
  const orderCountByLine = (name) => openOrders.filter((order) => products.find((product) => product.code === order.productId)?.line === name).length;
  return (
    <>
      <PageTitle
        title="Recursos produtivos"
        subtitle={`${resources.length} recursos · carga prevista sobre a capacidade diária em horas`}
        actions={<FilterLine line={line} setLine={setLine} />}
      />
      {maintenanceResource && <Callout tone="danger" title={`${maintenanceResource.name} em manutenção`}>
        {maintenanceProductCount} dos {products.length} produtos passam por este recurso. As ordens abertas que dependem dele precisam de atenção.
      </Callout>}
      <div className="resource-grid">
        {resources.map((r) => (
          <article className="resource-card" key={r.name}>
            <h3>{r.name}</h3>
            <small>{r.type}</small>
            <p>{badges(r.status)}</p>
            <small>Capacidade</small>
            <strong>{r.capacity}</strong>
            <small>Ocupação prevista</small>
            <Progress value={r.occupancy} />
            <small>Produtos no roteiro</small>
            <strong>{r.products}</strong>
          </article>
        ))}
      </div>
      <Panel
        title="Carga por linha de produção"
        subtitle="Visão separada da linha pesada e da linha leve"
      >
        <DataTable
          headers={[
            "Linha",
            "Produtos",
            "Ordens abertas",
            "Recurso mais crítico",
            "Situação",
          ]}
        >
          {["Pesada", "Leve"].map((name) => {
            const critical = resources.filter((resource) => resource.status !== "Manutenção").sort((a, b) => b.occupancy - a.occupancy)[0];
            return <Row key={name}><td>Linha {name.toLowerCase()}</td><td>{productCountByLine(name)}</td><td>{orderCountByLine(name)}</td><td>{critical ? `${critical.name} · ${critical.occupancy}%` : "—"}</td><td>{badges(maintenanceResource && orderCountByLine(name) ? "Em risco" : "Normal")}</td></Row>;
          })}
        </DataTable>
      </Panel>
    </>
  );
}
function OrdersPage({ filter, setFilter, line, setLine, onOpen, onCreate }) {
  const rows = orders.filter(
    (o) =>
      filter === "Todas" || filter === "Todos" ||
      (filter === "Abertas" &&
        !["Concluída", "Cancelada"].includes(o.status)) ||
      (filter === "Atrasadas" && o.status === "Atrasada") ||
      (filter === "Concluídas" && o.status === "Concluída") ||
      (filter === "Canceladas" && o.status === "Cancelada"),
  );
  return (
    <>
      <PageTitle
        title="Ordens de produção"
        subtitle={`${orders.length} ordens · acompanhe quantidade produzida, prazo e situação de cada uma`}
        actions={
          <>
            <FilterLine line={line} setLine={setLine} />
            <button className="primary" onClick={onCreate}>
              ＋ Nova ordem
            </button>
          </>
        }
      />
      <Segments
        items={["Todas", "Abertas", "Atrasadas", "Concluídas", "Canceladas"]}
        value={filter}
        onChange={setFilter}
      />
      <Panel className="flush">
        <DataTable
          headers={[
            "Ordem",
            "Produto",
            "Pedido",
            "Planejado",
            "Produzido",
            "Progresso",
            "Fim previsto",
            "Prioridade",
            "Situação",
          ]}
        >
          {rows.map((o) => (
            <Row key={o.id} onClick={() => onOpen(o)}>
              <td className="code">{o.id}</td>
              <td>{o.product}</td>
              <td className="code">{o.request}</td>
              <td>{o.planned}</td>
              <td>{o.done}</td>
              <td>
                <Progress value={Math.round((o.done / o.planned) * 100)} />
              </td>
              <td>{o.end}</td>
              <td>{badges(o.priority)}</td>
              <td>{badges(o.status)}</td>
            </Row>
          ))}
        </DataTable>
      </Panel>
      {orders.some((item) => item.status === "Concluída" && item.done < item.planned) && <Callout tone="warning" title="Ordens concluídas com diferença">
        {orders.filter((item) => item.status === "Concluída" && item.done < item.planned).map((item) => `${item.id}: ${item.done} de ${item.planned} unidades produzidas`).join(" · ")}. A ordem permanece concluída com a quantidade real registrada.
      </Callout>}
    </>
  );
}
function OrderDetail({ item, onBack, onReschedule, onRegister }) {
  const product = products.find((entry) => entry.name === item.product);
  const remaining = Math.max(0, item.planned - item.done);
  const maintenanceStages = (product?.route ?? []).filter((stage) => stage.resource.toLowerCase().includes("pintura"));
  const materials = (product?.structure ?? []).map((part) => {
    const material = part.materialInfo ?? {};
    const required = part.quantidade * item.planned * (1 + (part.perda_percentual ?? 0) / 100);
    const free = part.stock
      ? part.stock.quantidade_disponivel - part.stock.quantidade_reservada
      : 0;
    return {
      id: part.material,
      name: material.descricao ?? part.material,
      unit: material.unidade_medida ?? "",
      required: numberPt(required),
      free: numberPt(free),
      shortage: required > free,
    };
  });
  return (
    <>
      <PageTitle
        title={`Ordem ${item.id}`}
        subtitle={`${item.product} · pedido ${item.request} · ${item.client}`}
        actions={
          <>
            <button className="outline" onClick={onBack}>Voltar</button>
            <button className="outline" onClick={onReschedule}>Reprogramar</button>
            <button className="primary" onClick={onRegister}>Registrar produção</button>
          </>
        }
      />
      <SummaryStrip
        items={[
          ["Produto", item.product],
          ["Planejado", `${item.planned} un`],
          ["Produzido", `${item.done} un`],
          ["Início previsto", item.start],
          ["Fim previsto", item.end],
          ["Prioridade", item.priority],
          ["Situação", item.status],
        ]}
      />
      <div className="detail-grid">
        <Panel
          title="Andamento da ordem"
          subtitle="Quantidade produzida sobre a planejada e etapas do roteiro"
        >
          <div className="production-progress">
            <b>{item.done} de {item.planned} unidades</b>
            <span>faltam {remaining} · {Math.round((item.done / item.planned) * 100)}% concluído</span>
            <Progress value={Math.round((item.done / item.planned) * 100)} />
          </div>
          <DataTable headers={["Etapa", "Recurso", "Tempo por un", "Situação"]}>
            {(product?.route ?? []).map((stage) => {
              const underMaintenance = stage.resource.toLowerCase().includes("pintura") && item.status === "Atrasada";
              return (
                <Row key={stage.sequence}>
                  <td>Etapa {stage.sequence}</td>
                  <td>{stage.resource}</td>
                  <td>{stage.minutes} min</td>
                  <td>{badges(underMaintenance ? "Manutenção" : "No roteiro")}</td>
                </Row>
              );
            })}
          </DataTable>
        </Panel>
        <div className="stack">
          {item.status === "Atrasada" && maintenanceStages.length > 0 && (
            <Callout tone="danger" title="Atraso por manutenção">
              O roteiro desta ordem depende de {maintenanceStages.map((stage) => stage.resource).join(", ")}. Reprograme após a liberação do recurso.
            </Callout>
          )}
          <Panel
            title="Materiais da ordem"
            subtitle={`Necessidade calculada pela estrutura do produto para ${item.planned} unidades`}
          >
            <DataTable headers={["Material", "Necessário", "Saldo livre"]}>
              {materials.map((material) => (
                <Row key={material.id}>
                  <td>{material.name}</td>
                  <td>{material.required} {material.unit}</td>
                  <td className={material.shortage ? "negative" : ""}>{material.free}</td>
                </Row>
              ))}
            </DataTable>
          </Panel>
        </div>
      </div>
    </>
  );
}
function SchedulePage({
  rows,
  setRows,
  onReschedule,
  onOpen,
  line,
  setLine,
  onSave,
}) {
  const move = (index, direction) => {
    const next = [...rows];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setRows(next);
  };
  return (
    <>
      <PageTitle
        title="Programação e sequenciamento"
        subtitle="Ordene as ordens abertas e ajuste as datas previstas · as alterações ficam salvas"
        actions={
          <>
            <FilterLine line={line} setLine={setLine} />
            <button
              className="outline"
              onClick={() =>
                setRows(ordersForSchedule())
              }
            >
              Descartar
            </button>
            <button className="primary" onClick={onSave}>
              Salvar programação
            </button>
          </>
        }
      />
      <Panel
        title="Sequência de execução"
        subtitle={`${rows.length} ordens abertas · use as setas para mudar a posição`}
      >
        <DataTable
          headers={[
            "Pos.",
            "Ordem",
            "Produto",
            "Início previsto",
            "Fim previsto",
            "Prioridade",
            "Situação",
            "Ações",
          ]}
        >
          {rows.map((o, i) => (
            <Row key={o.id}>
              <td>⠿　{i + 1}</td>
              <td className="code" onClick={() => onOpen(o)}>
                {o.id}
              </td>
              <td>{o.product}</td>
              <td>{o.start}</td>
              <td>{o.end}</td>
              <td>{badges(o.priority)}</td>
              <td>{badges(o.status)}</td>
              <td className="action-cell">
                <button onClick={() => move(i, -1)}>↑</button>
                <button onClick={() => move(i, 1)}>↓</button>
                <button onClick={onReschedule}>Reprogramar</button>
              </td>
            </Row>
          ))}
        </DataTable>
      </Panel>
      <Panel
        title="Linha do tempo"
        subtitle={`Programação em torno da data de referência, ${referenceDateLabel}`}
      >
        <div className="timeline">
          <div className="timeline-dates">
            {scheduleWeekLabels.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          {rows.map((o, i) => (
            <div className="timeline-row" key={o.id}>
              <span>
                {o.id} · {o.product}
              </span>
              <div className="timeline-track">
                <i
                  className={`timeline-bar color-${i}`}
                  style={{
                    left: `${Math.max(0, i * 14)}%`,
                    width: `${Math.min(55, 28 + i * 7)}%`,
                  }}
                >
                  {o.id}
                </i>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}
function Callout({ title, children, tone = "" }) {
  return (
    <div className={`callout ${tone}`}>
      <strong>{title}</strong>
      <p>{children}</p>
    </div>
  );
}

function Modal({
  type,
  close,
  item,
  request,
  onSave,
  referenceDate,
  setReferenceDate,
}) {
  const isCreate = type === "create-order";
  const isRe = type === "reschedule";
  const isRegister = type === "register";
  const requestProduct = isCreate
    ? products.find((product) => product.name === request.product)
    : null;
  const plannedQuantity = requestProduct
    ? Math.ceil(request.qty / requestProduct.minimumLot) * requestProduct.minimumLot
    : request?.qty ?? 0;
  const shortages = (requestProduct?.structure ?? []).filter((part) => {
    const free = part.stock
      ? part.stock.quantidade_disponivel - part.stock.quantidade_reservada
      : 0;
    const required = part.quantidade * plannedQuantity * (1 + (part.perda_percentual ?? 0) / 100);
    return required > free;
  });
  const title = isCreate
    ? "Gerar ordem de produção"
    : isRe
      ? `Reprogramar ordem ${item.id}`
      : isRegister
        ? `Registrar produção da ${item.id}`
        : "Editar data de referência";
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <form
        className="modal"
        onSubmit={(e) => {
          e.preventDefault();
          onSave(
            type === "reference"
              ? "Data de referência atualizada."
              : isRegister
                ? "Produção registrada no modo de demonstração."
                : isRe
                  ? "Reprogramação salva no modo de demonstração."
                  : "Ordem criada no modo de demonstração.",
          );
        }}
      >
        <div className="modal-head">
          <div>
            <h2>{title}</h2>
            <p>
              {isCreate
                ? `A partir do pedido ${request.id} · ${request.client}`
                : isRe
                  ? `${item.product} · prazo previsto em ${item.end}`
                  : isRegister
                    ? `${item.product} · ${item.done} de ${item.planned} unidades produzidas`
                    : "A data de referência afeta a indicação de atraso."}
            </p>
          </div>
          <button type="button" className="close" onClick={close}>
            ×
          </button>
        </div>
        {isCreate ? (
          <>
            <div className="form-grid">
              <label>
                Pedido
                <input defaultValue={`${request.id} · ${request.client}`} />
              </label>
              <label>
                Produto
                <input defaultValue={`${requestProduct?.code ?? ""} · ${request.product}`} />
              </label>
              <label>
                Quantidade pedida
                <input defaultValue={`${request.qty} un`} />
              </label>
              <label>
                Quantidade a produzir
                <input defaultValue={`${plannedQuantity} un`} />
              </label>
              <label>
                Prioridade
                <select defaultValue={request.priority}>
                  <option>Alta</option>
                  <option>Normal</option>
                  <option>Baixa</option>
                </select>
              </label>
              <label>
                Destino da ordem
                <input defaultValue={`Atender o pedido ${request.id}`} />
              </label>
              <label>
                Início previsto
                <input type="date" defaultValue={request.deliveryDate} />
              </label>
              <label>
                Fim previsto
                <input type="date" defaultValue={request.deliveryDate} />
              </label>
              <label className="full">
                Observação
                <input defaultValue="" placeholder="Observação opcional" />
              </label>
            </div>
            {shortages.length > 0 && (
              <Callout tone="danger" title="Falta de material">
                Saldo livre insuficiente para {shortages.map((part) => part.materialInfo?.descricao ?? part.material).join(", ")}.
              </Callout>
            )}
          </>
        ) : isRe ? (
          <div className="form-grid">
            <label>
              Início previsto
              <input type="date" defaultValue={item.startDate} />
            </label>
            <label>
              Fim previsto
              <input type="date" />
            </label>
            <label>
              Prioridade
              <select defaultValue={item.priority}>
                <option>Normal</option>
                <option>Alta</option>
                <option>Baixa</option>
              </select>
            </label>
            <label>
              Posição na sequência
              <input type="number" defaultValue="1" min="1" />
            </label>
            <label className="full">
              Motivo da alteração
              <input defaultValue={`Reprogramação da ordem ${item.id}`} />
            </label>
          </div>
        ) : isRegister ? (
          <>
            <div className="form-grid">
              <label>
                Quantidade produzida agora
                <input type="number" defaultValue="1" min="0" />
              </label>
              <label>
                Refugo
                <input type="number" defaultValue="0" min="0" />
              </label>
              <label>
                Data do registro
                <input type="date" defaultValue={referenceDate.split("/").reverse().join("-")} />
              </label>
              <label>
                Total após o registro
                <input
                  value={`${item.done + 1} de ${item.planned} un`}
                  readOnly
                />
              </label>
            </div>
            <Callout title="Conferência">
              A ordem será concluída com 100% da quantidade planejada.
            </Callout>
          </>
        ) : (
          <div className="form-grid">
            <label>
              Data de referência
              <input
                type="date"
                value={referenceDate.split("/").reverse().join("-")}
                onChange={(e) =>
                  setReferenceDate(
                    e.target.value.split("-").reverse().join("/"),
                  )
                }
              />
            </label>
          </div>
        )}
        <div className="modal-actions">
          <button type="button" className="outline" onClick={close}>
            Cancelar
          </button>
          <button className="primary" type="submit">
            {isCreate
              ? "Gerar ordem"
              : isRe
                ? "Salvar alterações"
                : isRegister
                  ? "Registrar produção"
                  : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  );
}
