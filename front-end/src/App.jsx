import { useMemo, useState } from "react";

const orders = [
  {
    id: "OP-0001",
    product: "Arado 14 discos",
    request: "PED-0003",
    planned: 5,
    done: 4,
    start: "19/10",
    end: "24/10",
    priority: "Normal",
    status: "Concluída",
  },
  {
    id: "OP-0002",
    product: "Subsolador 5 hastes",
    request: "PED-0004",
    planned: 2,
    done: 1,
    start: "19/10",
    end: "02/11",
    priority: "Normal",
    status: "Atrasada",
  },
  {
    id: "OP-0003",
    product: "Reboque agrícola 6 t",
    request: "PED-0005",
    planned: 1,
    done: 0,
    start: "04/11",
    end: "18/11",
    priority: "Alta",
    status: "Liberada",
  },
  {
    id: "OP-0004",
    product: "Pulverizador de barras 400 L",
    request: "PED-0006",
    planned: 4,
    done: 4,
    start: "29/10",
    end: "02/11",
    priority: "Normal",
    status: "Concluída",
  },
  {
    id: "OP-0005",
    product: "Distribuidor de adubo 500 L",
    request: "PED-0007",
    planned: 2,
    done: 0,
    start: "03/11",
    end: "06/11",
    priority: "Baixa",
    status: "Cancelada",
  },
  {
    id: "OP-0006",
    product: "Distribuidor de adubo 500 L",
    request: "Estoque",
    planned: 4,
    done: 0,
    start: "10/11",
    end: "17/11",
    priority: "Baixa",
    status: "Planejada",
  },
  {
    id: "OP-0007",
    product: "Pulverizador de barras 400 L",
    request: "Estoque",
    planned: 2,
    done: 0,
    start: "05/11",
    end: "12/11",
    priority: "Baixa",
    status: "Liberada",
  },
];
const requests = [
  {
    id: "PED-0001",
    client: "Cooperativa Vale Verde",
    product: "Graneleiro agrícola 4 t",
    qty: 3,
    ordered: "28/10",
    delivery: "04/12",
    priority: "Normal",
    status: "Pendente",
    stock: "Atendível",
  },
  {
    id: "PED-0002",
    client: "Agrícola Rio Pardo",
    product: "Pulverizador de barras 600 L",
    qty: 5,
    ordered: "30/10",
    delivery: "10/12",
    priority: "Alta",
    status: "Pendente",
    stock: "Falta",
  },
  {
    id: "PED-0003",
    client: "Coopercampo",
    product: "Arado 14 discos",
    qty: 4,
    ordered: "12/10",
    delivery: "30/10",
    priority: "Normal",
    status: "Atendido",
    stock: "—",
  },
  {
    id: "PED-0004",
    client: "Revenda Agro Sul",
    product: "Subsolador 5 hastes",
    qty: 2,
    ordered: "15/10",
    delivery: "20/11",
    priority: "Normal",
    status: "Em produção",
    stock: "—",
  },
  {
    id: "PED-0005",
    client: "Cooperativa Planalto",
    product: "Reboque agrícola 6 t",
    qty: 1,
    ordered: "20/10",
    delivery: "25/11",
    priority: "Alta",
    status: "Em produção",
    stock: "—",
  },
  {
    id: "PED-0006",
    client: "Revenda Campo Forte",
    product: "Pulverizador de barras 400 L",
    qty: 4,
    ordered: "18/10",
    delivery: "10/11",
    priority: "Normal",
    status: "Atendido",
    stock: "—",
  },
  {
    id: "PED-0007",
    client: "Agropecuária Boa Safra",
    product: "Distribuidor de adubo 500 L",
    qty: 2,
    ordered: "22/10",
    delivery: "15/11",
    priority: "Baixa",
    status: "Cancelado",
    stock: "—",
  },
  {
    id: "PED-0008",
    client: "Cooperativa Serra Alta",
    product: "Carreta tanque 5.000 L",
    qty: 1,
    ordered: "29/10",
    delivery: "15/12",
    priority: "Normal",
    status: "Pendente",
    stock: "Atendível",
  },
  {
    id: "PED-0009",
    client: "Revenda Vale do Taquari",
    product: "Plaina niveladora",
    qty: 2,
    ordered: "02/11",
    delivery: "20/12",
    priority: "Normal",
    status: "Pendente",
    stock: "Atendível",
  },
  {
    id: "PED-0010",
    client: "Cooperativa Agro Norte",
    product: "Cultivador 7 hastes",
    qty: 4,
    ordered: "02/11",
    delivery: "18/12",
    priority: "Baixa",
    status: "Pendente",
    stock: "Atendível",
  },
  {
    id: "PED-0011",
    client: "Rural Máquinas",
    product: "Lâmina frontal para trator",
    qty: 4,
    ordered: "30/10",
    delivery: "08/01",
    priority: "Normal",
    status: "Pendente",
    stock: "Atendível",
  },
  {
    id: "PED-0012",
    client: "Cooperativa Missões",
    product: "Distribuidor de calcário 3.000 L",
    qty: 4,
    ordered: "03/11",
    delivery: "22/12",
    priority: "Alta",
    status: "Pendente",
    stock: "Atendível",
  },
];
const products = [
  ["P001", "Graneleiro agrícola 4 t", "Pesada", "1 un", "5", "8 h 45 min", "8"],
  [
    "P002",
    "Distribuidor de calcário 3.000 L",
    "Pesada",
    "1 un",
    "5",
    "7 h 30 min",
    "8",
  ],
  [
    "P003",
    "Pulverizador de barras 600 L",
    "Leve",
    "2 un",
    "3",
    "2 h 55 min",
    "8",
  ],
  ["P004", "Arado 14 discos", "Pesada", "1 un", "4", "5 h 30 min", "7"],
  ["P005", "Carreta tanque 5.000 L", "Pesada", "1 un", "5", "9 h 50 min", "8"],
  ["P006", "Subsolador 5 hastes", "Pesada", "1 un", "4", "4 h 55 min", "8"],
  ["P007", "Reboque agrícola 6 t", "Pesada", "1 un", "5", "8 h 30 min", "8"],
  ["P008", "Plaina niveladora", "Pesada", "1 un", "4", "4 h 35 min", "8"],
  [
    "P009",
    "Pulverizador de barras 400 L",
    "Leve",
    "2 un",
    "3",
    "2 h 30 min",
    "8",
  ],
  [
    "P010",
    "Distribuidor de adubo 500 L",
    "Leve",
    "2 un",
    "4",
    "2 h 45 min",
    "7",
  ],
  ["P011", "Cultivador 7 hastes", "Leve", "2 un", "4", "3 h 50 min", "7"],
  ["P012", "Lâmina frontal para trator", "Leve", "2 un", "5", "4 h", "8"],
].map(([code, name, line, lot, steps, time, materials]) => ({
  code,
  name,
  line,
  lot,
  steps,
  time,
  materials,
}));
const inventory = [
  [
    "M001",
    "Chapa de aço 3 mm",
    "Matéria-prima",
    "KG",
    "1.411,2",
    "151,2",
    "1.260",
    "378",
    "7 dias",
    "Disponível",
  ],
  [
    "M002",
    "Chapa de aço 6,35 mm",
    "Matéria-prima",
    "KG",
    "4.741",
    "638",
    "4.103",
    "1.231",
    "10 dias",
    "Disponível",
  ],
  [
    "M003",
    "Tubo quadrado 80×80",
    "Matéria-prima",
    "M",
    "434",
    "84",
    "350",
    "105",
    "7 dias",
    "Disponível",
  ],
  [
    "M004",
    "Tinta esmalte",
    "Matéria-prima",
    "L",
    "79,35",
    "28,35",
    "51",
    "100",
    "5 dias",
    "Abaixo do mínimo",
  ],
  [
    "M005",
    "Arame de solda",
    "Matéria-prima",
    "KG",
    "120,45",
    "15,45",
    "105",
    "32",
    "5 dias",
    "Disponível",
  ],
  [
    "M006",
    "Rolamento",
    "Componente",
    "UN",
    "34",
    "4",
    "30",
    "9",
    "8 dias",
    "Disponível",
  ],
  [
    "M007",
    "Cubo de roda com eixo",
    "Componente",
    "UN",
    "17",
    "2",
    "15",
    "5",
    "15 dias",
    "Disponível",
  ],
  [
    "M008",
    "Pneu aro 16",
    "Componente",
    "UN",
    "36",
    "4",
    "32",
    "40",
    "12 dias",
    "Abaixo do mínimo",
  ],
  [
    "M009",
    "Cilindro hidráulico",
    "Componente",
    "UN",
    "14",
    "0",
    "14",
    "5",
    "20 dias",
    "Disponível",
  ],
  [
    "M010",
    "Bomba de pulverização",
    "Componente",
    "UN",
    "6",
    "2",
    "4",
    "3",
    "20 dias",
    "Disponível",
  ],
  [
    "M011",
    "Bico de pulverização",
    "Componente",
    "UN",
    "106",
    "16",
    "90",
    "27",
    "10 dias",
    "Disponível",
  ],
  [
    "M012",
    'Disco de grade 24"',
    "Componente",
    "UN",
    "0",
    "0",
    "0",
    "—",
    "—",
    "Sem estoque",
  ],
  [
    "M013",
    "Kit de parafusaria",
    "Componente",
    "UN",
    "30",
    "5",
    "25",
    "8",
    "5 dias",
    "Disponível",
  ],
  [
    "M014",
    "Ponteira de haste",
    "Componente",
    "UN",
    "50",
    "10",
    "40",
    "12",
    "10 dias",
    "Disponível",
  ],
  [
    "M015",
    "Engate",
    "Componente",
    "UN",
    "11",
    "3",
    "8",
    "3",
    "8 dias",
    "Disponível",
  ],
  [
    "M016",
    "Mangueira hidráulica",
    "Componente",
    "M",
    "121",
    "16",
    "105",
    "32",
    "7 dias",
    "Disponível",
  ],
  [
    "M017",
    "Estrado de madeira",
    "Embalagem",
    "UN",
    "10",
    "2",
    "8",
    "3",
    "6 dias",
    "Disponível",
  ],
].map(
  ([
    code,
    name,
    type,
    unit,
    available,
    reserved,
    free,
    min,
    replenishment,
    status,
  ]) => ({
    code,
    name,
    type,
    unit,
    available,
    reserved,
    free,
    min,
    replenishment,
    status,
  }),
);
const resources = [
  {
    name: "Corte plasma CNC",
    type: "Máquina",
    status: "Disponível",
    capacity: "16 h/dia",
    occupancy: 62,
    products: "12 de 12",
  },
  {
    name: "Dobradeira/calandra",
    type: "Máquina",
    status: "Disponível",
    capacity: "16 h/dia",
    occupancy: 38,
    products: "6 de 12",
  },
  {
    name: "Bancada de solda",
    type: "Posto manual",
    status: "Disponível",
    capacity: "16 h/dia",
    occupancy: 91,
    products: "12 de 12",
  },
  {
    name: "Cabine de pintura",
    type: "Máquina",
    status: "Manutenção",
    capacity: "16 h/dia",
    occupancy: 0,
    products: "9 de 12",
  },
  {
    name: "Equipe de montagem",
    type: "Equipe",
    status: "Disponível",
    capacity: "8 h/dia",
    occupancy: 74,
    products: "12 de 12",
  },
];
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
  const [request, setRequest] = useState(requests[1]);
  const [product, setProduct] = useState(products[2]);
  const [order, setOrder] = useState(orders[1]);
  const [modal, setModal] = useState("");
  const [notice, setNotice] = useState("");
  const [filter, setFilter] = useState("Todos");
  const [priority, setPriority] = useState("Todas as prioridades");
  const [line, setLine] = useState("Todas as linhas");
  const [search, setSearch] = useState("");
  const [schedule, setSchedule] = useState([
    orders[1],
    orders[2],
    orders[6],
    orders[5],
  ]);
  const [referenceDate, setReferenceDate] = useState("03/11/2026");
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
            (line === "Pesada" &&
              r.product !== "Pulverizador de barras 600 L") ||
            (line === "Leve" && r.product === "Pulverizador de barras 600 L"))
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
              className={`nav-link ${page === label ? "selected" : ""}`}
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
        <header className="toolbar">
          <div className="breadcrumb">
            AgroPCP <span>/</span> {page}
          </div>
          <div className="toolbar-right">
            <span className="demo-mark">DADOS DE DEMONSTRAÇÃO</span>
            <span className="user-avatar">PC</span>
          </div>
        </header>
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
  const openOrders = orders.filter((o) =>
    ["Atrasada", "Liberada", "Planejada"].includes(o.status),
  );
  return (
    <>
      <PageTitle
        title="Visão geral do PCP"
        subtitle="Programação e andamento da produção · estoque de referência em 03/11/2026"
        actions={<FilterLine line={line} setLine={setLine} />}
      />
      <div className="metric-grid">
        <Metric
          label="Pedidos pendentes"
          value="7"
          detail="1 com falta de material"
        />
        <Metric
          label="Ordens abertas"
          value="4"
          detail="1 em produção · 2 liberadas · 1 planejada"
        />
        <Metric
          label="Ordens atrasadas"
          value="1"
          detail="OP-0002 · cabine de pintura em manutenção"
          tone="red"
        />
        <Metric
          label="Abaixo do estoque mínimo"
          value="2"
          detail="Tinta esmalte e pneu aro 16"
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
            {openOrders.map((o) => (
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
          </DataTable>
        </Panel>
        <Panel title="Alertas e pendências" subtitle="3 pontos exigem atenção">
          <div className="alert-list">
            <Alert
              title="Falta"
              text="PED-0002 · Pulverizador 600 L · faltam 2 bombas de pulverização"
              action="Gerar ordem"
              onClick={() => openRequest(requests[1])}
            />
            <Alert
              title="Atrasada"
              text="OP-0002 · Subsolador 5 hastes · cabine de pintura em manutenção"
              action="Reprogramar"
              onClick={() => openOrder(orders[1])}
            />
            <Alert
              title="Abaixo do mínimo"
              text="Tinta esmalte: 79,35 L (mín. 100). Pneu aro 16: 36 un (mín. 40)."
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
      <div className="panel-heading">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>
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
        actions={
          <>
            <FilterLine line={line} setLine={setLine} />
            <Segments
              items={["Todas as prioridades", "Alta", "Normal", "Baixa"]}
              value={priority}
              onChange={setPriority}
            />
          </>
        }
      />
      <div className="page-tools">
        <Segments
          items={[
            "Todos",
            "Pendentes",
            "Em produção",
            "Atendidos",
            "Cancelados",
          ]}
          value={filter}
          onChange={setFilter}
        />
        <input
          className="search"
          placeholder="Buscar pedido, cliente ou produto"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <Panel className="flush">
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
  const shortage = item.id === "PED-0002";
  return (
    <>
      <PageTitle
        title={`Pedido ${item.id}`}
        subtitle="Verificação de estoque e necessidade de materiais para atender o pedido"
        actions={
          <>
            <button className="outline" onClick={onBack}>
              Voltar
            </button>
            <button className="primary" onClick={onGenerate}>
              Gerar ordem de produção
            </button>
          </>
        }
      />
      <SummaryStrip
        items={[
          ["Cliente", item.client],
          ["Produto", item.product],
          ["Quantidade pedida", `${item.qty} un`],
          [
            "Ordem a produzir",
            shortage ? "6 un (lote mínimo 2)" : `${item.qty} un`,
          ],
          ["Entrega prometida", "10/12/2026"],
          ["Prioridade", item.priority],
          ["Situação", item.stock],
        ]}
      />
      <div className="detail-grid">
        <Panel
          title="Estrutura do produto e necessidade de materiais"
          subtitle="Necessidade = quantidade × qtd por unidade × (1 + perda)"
        >
          <DataTable
            headers={[
              "Material",
              "Un",
              "Qtd/un",
              "Perda",
              "Necessário",
              "Saldo livre",
              "Situação",
            ]}
          >
            {[
              "Chapa de aço 3 mm",
              "Tubo quadrado 80×80",
              "Tinta esmalte",
              "Bomba de pulverização",
              "Bico de pulverização",
              "Mangueira hidráulica",
              "Kit de parafusaria",
              "Estrado de madeira",
            ].map((m, i) => (
              <Row key={m}>
                <td>{m}</td>
                <td>{["KG", "M", "L", "UN", "UN", "M", "UN", "UN"][i]}</td>
                <td>{[90, 12, 4, 1, 12, 10, 1, 1][i]}</td>
                <td>{i === 0 ? "8%" : i === 2 ? "5%" : "—"}</td>
                <td className={shortage && i === 3 ? "negative" : ""}>
                  {shortage && i === 3
                    ? "6"
                    : ["583,2", "72", "25,2", "6", "72", "60", "6", "6"][i]}
                </td>
                <td className={shortage && i === 3 ? "negative" : ""}>
                  {shortage && i === 3
                    ? "4"
                    : ["1.260", "350", "51", "4", "90", "105", "25", "8"][i]}
                </td>
                <td>
                  {shortage && i === 3 ? badges("Falta") : badges("Disponível")}
                </td>
              </Row>
            ))}
          </DataTable>
        </Panel>
        <div className="stack">
          <Callout tone="danger" title="Falta de material">
            Faltam 2 bombas de pulverização: necessário 6, saldo livre 4 (2
            reservadas para a OP-0007). A reposição leva 20 dias e o pedido
            vence em 10/12/2026.
          </Callout>
          <Panel title="Roteiro e horas necessárias" subtitle="Para 6 unidades">
            <DataTable headers={["Etapa", "Tempo", "Total"]}>
              {[
                ["Corte plasma CNC", "40 min/un", "4,0 h"],
                ["Bancada de solda", "90 min/un", "9,0 h"],
                ["Equipe de montagem", "45 min/un", "4,5 h"],
              ].map((x) => (
                <Row key={x[0]}>
                  {x.map((y) => (
                    <td key={y}>{y}</td>
                  ))}
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
  const [category, setCategory] = useState("Todos (12)");
  const rows = products.filter(
    (p) =>
      category === "Todos (12)" ||
      (category === "Linha pesada (7)" && p.line === "Pesada") ||
      (category === "Linha leve (5)" && p.line === "Leve"),
  );
  return (
    <>
      <PageTitle
        title="Produtos"
        subtitle="12 produtos ativos · 2 linhas de produção · roteiro e lista de materiais de cada produto"
      />
      <Segments
        items={["Todos (12)", "Linha pesada (7)", "Linha leve (5)"]}
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
              <td>{badges("Ativo")}</td>
            </Row>
          ))}
        </DataTable>
      </Panel>
    </>
  );
}
function ProductDetail({ item, onBack }) {
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
          ["Situação", "Ativo"],
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
            {[
              [
                "Chapa de aço 3 mm",
                "Matéria-prima",
                "KG",
                "90",
                "8%",
                "7 dias",
              ],
              [
                "Tubo quadrado 80×80",
                "Matéria-prima",
                "M",
                "12",
                "—",
                "7 dias",
              ],
              ["Tinta esmalte", "Matéria-prima", "L", "4", "5%", "5 dias"],
              [
                "Bomba de pulverização",
                "Componente",
                "UN",
                "1",
                "—",
                "20 dias",
              ],
              [
                "Bico de pulverização",
                "Componente",
                "UN",
                "12",
                "—",
                "10 dias",
              ],
              ["Mangueira hidráulica", "Componente", "M", "10", "—", "7 dias"],
              ["Kit de parafusaria", "Componente", "UN", "1", "—", "5 dias"],
              ["Estrado de madeira", "Embalagem", "UN", "1", "—", "6 dias"],
            ].map((row) => (
              <Row key={row[0]}>
                {row.map((x) => (
                  <td key={x}>{x}</td>
                ))}
              </Row>
            ))}
          </DataTable>
        </Panel>
        <div className="stack">
          <Panel
            title="Roteiro de produção"
            subtitle="Tempo por unidade em cada etapa"
          >
            <DataTable headers={["Etapa", "Tempo"]}>
              {[
                ["1 · Corte plasma CNC", "40 min"],
                ["2 · Bancada de solda", "90 min"],
                ["3 · Equipe de montagem", "45 min"],
              ].map((row) => (
                <Row key={row[0]}>
                  {row.map((x) => (
                    <td key={x}>{x}</td>
                  ))}
                </Row>
              ))}
            </DataTable>
          </Panel>
          <Callout title="Sem pintura no roteiro" tone="info">
            Este produto não passa pela cabine de pintura; então a manutenção da
            cabine não atrasa suas ordens.
          </Callout>
        </div>
      </div>
    </>
  );
}
function InventoryPage({ filter, setFilter, search, setSearch }) {
  const [category, setCategory] = useState("Todos (17)");
  const filtered = inventory.filter(
    (m) =>
      (category.startsWith("Abaixo")
        ? m.status === "Abaixo do mínimo"
        : category === "Todos (17)" ||
          m.type === category.replace(/ \(.*\)/, "")) &&
      `${m.code} ${m.name}`.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <>
      <PageTitle
        title="Estoque"
        subtitle="Posição em 03/11/2026 · saldo livre = disponível − reservado"
      />
      <div className="page-tools">
        <Segments
          items={[
            "Todos (17)",
            "Abaixo do mínimo (2)",
            "Matéria-prima (5)",
            "Componente (11)",
            "Embalagem (1)",
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
  return (
    <>
      <PageTitle
        title="Recursos produtivos"
        subtitle="5 recursos · carga prevista sobre a capacidade diária em horas"
        actions={<FilterLine line={line} setLine={setLine} />}
      />
      <Callout tone="danger" title="Cabine de pintura em manutenção">
        9 dos 12 produtos passam pela pintura. Enquanto a cabine estiver parada,
        as ordens que dependem dela ficam sem previsão e podem atrasar, como a
        OP-0002.
      </Callout>
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
          <Row>
            <td>Linha pesada</td>
            <td>7</td>
            <td>2 (OP-0002, OP-0003)</td>
            <td>Cabine de pintura · em manutenção</td>
            <td>{badges("Em risco")}</td>
          </Row>
          <Row>
            <td>Linha leve</td>
            <td>5</td>
            <td>2 (OP-0006, OP-0007)</td>
            <td>Bancada de solda · 91% de ocupação</td>
            <td>{badges("Normal")}</td>
          </Row>
        </DataTable>
      </Panel>
    </>
  );
}
function OrdersPage({ filter, setFilter, line, setLine, onOpen, onCreate }) {
  const rows = orders.filter(
    (o) =>
      filter === "Todas" ||
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
        subtitle="7 ordens · acompanhe quantidade produzida, prazo e situação de cada uma"
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
      <Callout tone="warning" title="OP-0001 concluída com diferença">
        Foram produzidas 4 de 5 unidades planejadas: 1 peça foi refug ada na
        solda. A ordem fica concluída com a quantidade real produzida.
      </Callout>
    </>
  );
}
function OrderDetail({ item, onBack, onReschedule, onRegister }) {
  return (
    <>
      <PageTitle
        title={`Ordem ${item.id}`}
        subtitle={`${item.product} · pedido ${item.request} · Revenda Agro Sul`}
        actions={
          <>
            <button className="outline" onClick={onBack}>
              Voltar
            </button>
            <button className="outline" onClick={onReschedule}>
              Reprogramar
            </button>
            <button className="primary" onClick={onRegister}>
              Registrar produção
            </button>
          </>
        }
      />
      <SummaryStrip
        items={[
          ["Produto", item.product],
          ["Planejado", `${item.planned} un`],
          ["Produzido", `${item.done} un`],
          ["Início previsto", "19/10/2026"],
          ["Fim previsto", `${item.end}/2026`],
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
            <b>
              {item.done} de {item.planned} unidades
            </b>
            <span>
              falta {Math.max(0, item.planned - item.done)} unidade ·{" "}
              {Math.round((item.done / item.planned) * 100)}% concluído
            </span>
            <Progress value={Math.round((item.done / item.planned) * 100)} />
          </div>
          <DataTable
            headers={[
              "Etapa da unidade restante",
              "Recurso",
              "Tempo por un",
              "Situação",
            ]}
          >
            {[
              ["1 · Corte", "Corte plasma CNC", "50 min", "Concluída"],
              ["2 · Solda", "Bancada de solda", "110 min", "Concluída"],
              ["3 · Pintura", "Cabine de pintura", "55 min", "Manutenção"],
              ["4 · Montagem", "Equipe de montagem", "80 min", "Planejada"],
            ].map((row) => (
              <Row key={row[0]}>
                {row.map((x, i) => (
                  <td key={i}>{i === 3 ? badges(x) : x}</td>
                ))}
              </Row>
            ))}
          </DataTable>
        </Panel>
        <div className="stack">
          <Callout tone="danger" title="Atraso por manutenção">
            O fim previsto era {item.end}. A unidade seguinte aguarda a cabine
            de pintura, que está em manutenção. Reprograme a ordem quando houver
            nova previsão.
          </Callout>
          <Panel
            title="Materiais reservados"
            subtitle={`Reserva para as ${item.planned} unidades da ordem`}
          >
            <DataTable headers={["Material", "Reservado"]}>
              {[
                ["Chapa de aço 6,35 mm", "308 KG"],
                ["Tubo quadrado 80×80", "36 M"],
                ["Tinta esmalte", "10,5 L"],
                ["Arame de solda", "8,24 KG"],
                ["Ponteira de haste", "10 UN"],
                ["Rolamento", "4 UN"],
                ["Kit de parafusaria", "2 UN"],
                ["Engate", "2 UN"],
              ].map((x) => (
                <Row key={x[0]}>
                  <td>{x[0]}</td>
                  <td>{x[1]}</td>
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
                setRows([orders[1], orders[2], orders[6], orders[5]])
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
        subtitle="De 19/10 a 19/11 · a linha vermelha marca a data de referência, 03/11"
      >
        <div className="timeline">
          <div className="timeline-dates">
            {["19/10", "26/10", "02/11", "09/11", "16/11"].map((d) => (
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
                  ? `${item.product} · atrasada desde 02/11`
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
                <input defaultValue={`P003 · ${request.product}`} />
              </label>
              <label>
                Quantidade pedida
                <input defaultValue={`${request.qty} un`} />
              </label>
              <label>
                Quantidade a produzir
                <input defaultValue="6 un" />
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
                <input type="date" defaultValue="2026-11-24" />
              </label>
              <label>
                Fim previsto
                <input type="date" defaultValue="2026-12-07" />
              </label>
              <label className="full">
                Observação
                <input defaultValue="Iniciar a produção após a reposição das bombas (prazo de 20 dias)." />
              </label>
            </div>
            <Callout tone="danger" title="Falta de material">
              Faltam 2 bombas de pulverização. A ordem pode começar após a
              reposição.
            </Callout>
          </>
        ) : isRe ? (
          <div className="form-grid">
            <label>
              Início previsto
              <input type="date" defaultValue="2026-10-19" />
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
              <input defaultValue="Aguardando a cabine de pintura (em manutenção)." />
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
                <input type="date" defaultValue="2026-11-03" />
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
