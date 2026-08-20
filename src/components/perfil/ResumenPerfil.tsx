/**
 * Resumen del perfil: todo lo capturado, junto y en sólo lectura.
 *
 * Existe porque las tarjetas de arriba están pensadas para EDITAR, y editar y leer no se hacen
 * igual de bien en el mismo sitio. Aquí no hay ni un input: es lo que otra persona vería del perfil.
 */
import { CircleHelp } from "lucide-react";
import type { Colaborador } from "../../types/domain";

interface Props {
  yo: Colaborador;
}

export function ResumenPerfil({ yo }: Props) {
  const bloques: { titulo: string; items: { titulo: string; detalle: string }[] }[] = [
    {
      titulo: "Formación académica",
      items: (yo.educacion ?? []).map((e) => ({
        titulo: e.institucion,
        detalle: [e.titulo, [e.inicio, e.fin].filter(Boolean).join(" – ")].filter(Boolean).join(" · "),
      })),
    },
    {
      titulo: "Experiencia en Grupo Salinas",
      items: (yo.historialPuestos ?? []).map((h) => ({
        titulo: h.puesto,
        detalle: [h.negocio, h.areaPrincipal, `${h.desde} – ${h.hasta || "Actual"}`]
          .filter(Boolean).join(" · "),
      })),
    },
    {
      titulo: "Experiencia externa",
      items: (yo.experiencia ?? []).map((e) => ({
        titulo: e.puesto,
        detalle: [e.empresa, [e.inicio, e.fin].filter(Boolean).join(" – ")].filter(Boolean).join(" · "),
      })),
    },
    {
      titulo: "Logros",
      items: (yo.logros ?? []).map((l) => ({
        titulo: l.nombre,
        detalle: [l.tipo, l.sector, l.kpi].filter(Boolean).join(" · "),
      })),
    },
    {
      titulo: "Intereses profesionales",
      items: (yo.intereses ?? []).map((i) => ({ titulo: i.interesProfesional, detalle: i.motivo })),
    },
    {
      titulo: "Certificaciones y diplomados",
      items: (yo.cursos ?? []).map((c) => ({
        titulo: c.nombre,
        detalle: [c.tipo, c.institucion, `Expedido ${c.fecha}`,
          c.caducidad ? `Caduca ${c.caducidad}` : ""].filter(Boolean).join(" · "),
      })),
    },
  ];

  return (
    <section className="gs-card" aria-labelledby="sec-resumen">
      <div className="gs-card-cab">
        <h3 id="sec-resumen">Resumen</h3>
        <button className="gs-ayuda" aria-label="Ayuda sobre el resumen">
          <CircleHelp size={15} strokeWidth={2} />
        </button>
      </div>
      {bloques.map((b) => (
        <div className="gs-registro" key={b.titulo}>
          <div className="gs-registro-meta" style={{ marginTop: 0, textTransform: "uppercase", letterSpacing: ".04em", fontWeight: 600 }}>
            {b.titulo}
          </div>
          {b.items.length === 0 ? (
            <div className="gs-registro-txt">Sin registros.</div>
          ) : (
            b.items.map((i, n) => (
              <div key={n} style={{ marginTop: 8 }}>
                <div className="gs-registro-tit">{i.titulo}</div>
                {i.detalle && <div className="gs-registro-txt" style={{ marginTop: 2 }}>{i.detalle}</div>}
              </div>
            ))
          )}
        </div>
      ))}
    </section>
  );
}
