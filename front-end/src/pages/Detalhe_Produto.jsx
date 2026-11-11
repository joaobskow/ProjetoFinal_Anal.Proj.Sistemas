import {
  Badge,
  Callout,
  DataTable,
  PageTitle,
  Panel,
  Row,
  SummaryStrip,
} from "../components/ui.jsx";
import { numberPt } from "../data/pcpData.js";

export default function Detalhe_Produto({ item, onBack }) {
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
            {item.structure.map((part) => (
              <Row key={part.material}>
                <td>{part.materialInfo?.descricao ?? part.material}</td>
                <td>
                  {part.materialInfo?.tipo === "materia_prima"
                    ? "Matéria-prima"
                    : part.materialInfo?.tipo === "embalagem"
                      ? "Embalagem"
                      : "Componente"}
                </td>
                <td>{part.materialInfo?.unidade_medida ?? "—"}</td>
                <td>{numberPt(part.quantidade)}</td>
                <td>
                  {part.perda_percentual == null
                    ? "—"
                    : `${part.perda_percentual}%`}
                </td>
                <td>
                  {part.materialInfo?.prazo_reposicao_dias == null
                    ? "—"
                    : `${part.materialInfo.prazo_reposicao_dias} dias`}
                </td>
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
              {item.route.map((stage) => (
                <Row key={stage.sequence}>
                  <td>
                    {stage.sequence} · {stage.resource}
                  </td>
                  <td>{stage.minutes} min</td>
                </Row>
              ))}
            </DataTable>
          </Panel>
          <Callout tone="info" title="Roteiro carregado do JSON">
            Os recursos, tempos e materiais desta tela vêm de `produtos.json`,
            `recursos.json` e `estrutura_produtos.json`.
          </Callout>
        </div>
      </div>
    </>
  );
}
