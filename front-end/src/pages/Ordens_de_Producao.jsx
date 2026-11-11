import { useMemo, useState } from "react";
import { getProduct, orders } from "../data/pcpData.js";
import {
  Badge,
  DataTable,
  LineFilter,
  Panel,
  Progress,
  Row,
  Segments,
} from "../components/ui.jsx";

const filters = ["Todas", "Abertas", "Atrasadas", "Concluídas", "Canceladas"];

export default function Ordens_de_Producao({ onOpen, onCreate }) {
  const [filter, setFilter] = useState("Todas");
  const [line, setLine] = useState("Todas as linhas");
  const rows = useMemo(
    () =>
      orders.filter((order) => {
        const statusMatch =
          filter === "Todas" ||
          (filter === "Abertas" &&
            !["Concluída", "Cancelada"].includes(order.status)) ||
          (filter === "Atrasadas" && order.status === "Atrasada") ||
          (filter === "Concluídas" && order.status === "Concluída") ||
          (filter === "Canceladas" && order.status === "Cancelada");
        const product = getProduct(order.productId);
        return (
          statusMatch && (line === "Todas as linhas" || product?.line === line)
        );
      }),
    [filter, line],
  );
  return (
    <>
      <div className="page-title">
        <div>
          <h1>Ordens de produção</h1>
          <p>
            {orders.length} ordens · acompanhe quantidade produzida, prazo e
            situação
          </p>
        </div>
        <div className="title-actions">
          <LineFilter value={line} onChange={setLine} />
          <button className="primary" onClick={onCreate}>
            ＋ Nova ordem
          </button>
        </div>
      </div>
      <Segments items={filters} value={filter} onChange={setFilter} />
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
          {rows.map((order) => (
            <Row key={order.id} onClick={() => onOpen(order)}>
              <td className="code">{order.id}</td>
              <td>{order.product}</td>
              <td className="code">{order.request}</td>
              <td>{order.planned}</td>
              <td>{order.done}</td>
              <td>
                <Progress
                  value={Math.round((order.done / order.planned) * 100)}
                />
              </td>
              <td className={order.late ? "negative" : ""}>{order.end}</td>
              <td>
                <Badge>{order.priority}</Badge>
              </td>
              <td>
                <Badge>{order.status}</Badge>
              </td>
            </Row>
          ))}
        </DataTable>
      </Panel>
      {orders.find((order) => order.note?.includes("refugada")) && (
        <div className="callout warning">
          <strong>Ordem concluída com diferença</strong>
          <p>{orders.find((order) => order.note?.includes("refugada")).note}</p>
        </div>
      )}
    </>
  );
}
