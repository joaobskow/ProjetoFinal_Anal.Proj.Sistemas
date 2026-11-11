import { useState } from "react";
import { products } from "../data/pcpData.js";
import { Badge, DataTable, Panel, Row, Segments } from "../components/ui.jsx";

export default function Produtos({ onOpen }) {
  const activeProducts = products.filter((product) => product.active);
  const heavyCount = activeProducts.filter(
    (product) => product.line === "Pesada",
  ).length;
  const lightCount = activeProducts.filter(
    (product) => product.line === "Leve",
  ).length;
  const allLabel = `Todos (${activeProducts.length})`;
  const heavyLabel = `Linha pesada (${heavyCount})`;
  const lightLabel = `Linha leve (${lightCount})`;
  const [filter, setFilter] = useState(allLabel);
  const rows = activeProducts.filter(
    (product) =>
      filter === allLabel ||
      (filter === heavyLabel && product.line === "Pesada") ||
      (filter === lightLabel && product.line === "Leve"),
  );
  return (
    <>
      <div className="page-title">
        <div>
          <h1>Produtos</h1>
          <p>
            {activeProducts.length} produtos ativos · 2 linhas de produção ·
            roteiro e lista de materiais de cada produto
          </p>
        </div>
      </div>
      <Segments
        items={[allLabel, heavyLabel, lightLabel]}
        value={filter}
        onChange={setFilter}
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
          {rows.map((product) => (
            <Row key={product.code} onClick={() => onOpen(product)}>
              <td className="code">{product.code}</td>
              <td>{product.name}</td>
              <td>{product.line}</td>
              <td>{product.lot}</td>
              <td>{product.steps}</td>
              <td>{product.time}</td>
              <td>{product.materials}</td>
              <td>
                <Badge>{product.active ? "Ativo" : "Inativo"}</Badge>
              </td>
            </Row>
          ))}
        </DataTable>
      </Panel>
    </>
  );
}
