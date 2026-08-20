/**
 * Pantalla 5 — Generalista (el administrador de Radar, con el nombre que usa el cliente).
 *
 * Es pequeña y hace una sola cosa bien. Lo que la convierte en una herramienta de decisión y no en
 * un formulario es el panel de IMPACTO EN VIVO: al mover cada control se recalcula cuánta gente
 * puede moverse hoy con esa regla. Sin eso, el generalista estaría eligiendo un número a ciegas.
 */
import { useCallback, useEffect, useState } from "react";
import { Users, Clock, Gauge, Save, TriangleAlert } from "lucide-react";
import { reglaService } from "../services/reglaService";
import { useData } from "../store/DataProvider";
import { Chip } from "../components/common/Chip";
import { BarraAvance } from "../components/common/BarraAvance";
import type { Impacto, ReglaMovilidad } from "../types/domain";

export function GeneralistaPage() {
  const { catalogos } = useData();
  const [reglas, setReglas] = useState<ReglaMovilidad | null>(null);
  const [impacto, setImpacto] = useState<Impacto | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    reglaService.obtener().then((r) => { setReglas(r.reglas); setImpacto(r.impacto); })
      .catch((e) => setError(e instanceof Error ? e.message : "No se pudieron cargar las reglas"));
  }, []);

  /** Guardado automático, como el resto del proyecto: se aplica y se ve el efecto al momento. */
  const aplicar = useCallback(async (cambio: Partial<ReglaMovilidad>) => {
    setGuardando(true);
    setError("");
    try {
      const r = await reglaService.actualizar(cambio);
      setReglas(r.reglas);
      setImpacto(r.impacto);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar");
    } finally {
      setGuardando(false);
    }
  }, []);

  if (error && !reglas) return <div className="card"><b style={{ color: "var(--bad)" }}>{error}</b></div>;
  if (!reglas || !impacto) return <div className="spin" />;

  const porcentaje = impacto.total ? Math.round((impacto.puedenMoverse / impacto.total) * 100) : 0;

  return (
    <>
      <div className="card">
        <h4 style={{ fontSize: 14, marginBottom: 4 }}>
          <Gauge size={15} style={{ verticalAlign: "-2px", marginRight: 7 }} />
          Impacto de estas reglas, ahora mismo
        </h4>
        <p className="help" style={{ marginTop: 0, marginBottom: 14 }}>
          Con la configuración actual, <b>{impacto.puedenMoverse} de {impacto.total}</b> colaboradores
          pueden postularse hoy al puesto al que aspiran.
        </p>
        <BarraAvance v={porcentaje} etiqueta="Colaboradores sin bloqueo" ok={porcentaje >= 70} />
        <div className="tagpick" style={{ marginTop: 14 }}>
          <Chip tone="ok" icon={Users}>{impacto.puedenMoverse} pueden moverse</Chip>
          <Chip tone="lock" icon={Clock}>{impacto.porAntiguedad} frenados por antigüedad</Chip>
          <Chip tone="bad">{impacto.porCompatibilidad} frenados por compatibilidad</Chip>
        </div>
      </div>

      <div className="grid2" style={{ marginTop: 16 }}>
        <div className="card" style={{ margin: 0 }}>
          <label htmlFor="r-antig">Antigüedad mínima en el puesto actual</label>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <input id="r-antig" type="range" min={0} max={36} step={1}
              value={reglas.antiguedadMinimaMeses}
              onChange={(e) => void aplicar({ antiguedadMinimaMeses: Number(e.target.value) })} />
            <b style={{ fontSize: 18, whiteSpace: "nowrap", color: "var(--gold-dark)" }}>
              {reglas.antiguedadMinimaMeses} m
            </b>
          </div>
          <p className="help">
            Por defecto son 12 meses. Es el tiempo en el puesto que ocupa hoy, no la antigüedad en la
            empresa.
          </p>
        </div>

        <div className="card" style={{ margin: 0 }}>
          <label htmlFor="r-comp">Compatibilidad mínima para postularse</label>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <input id="r-comp" type="range" min={0} max={98} step={1}
              value={reglas.compatibilidadMinima}
              onChange={(e) => void aplicar({ compatibilidadMinima: Number(e.target.value) })} />
            <b style={{ fontSize: 18, whiteSpace: "nowrap", color: "var(--gold-dark)" }}>
              {reglas.compatibilidadMinima} %
            </b>
          </div>
          <p className="help">
            El dolor original: demasiada gente postulándose con 60 % o menos. El tope real del motor
            de compatibilidad es 98, así que pedir más bloquearía a todo el mundo.
          </p>
          {reglas.compatibilidadMinima >= 90 && (
            <p className="help" style={{ color: "var(--warn)" }}>
              <TriangleAlert size={12} /> Con este umbral casi nadie podrá postularse.
            </p>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h4 style={{ fontSize: 14, marginBottom: 4 }}>Excepciones por tipo de vacante</h4>
        <p className="help" style={{ marginTop: 0, marginBottom: 8 }}>
          La antigüedad depende mucho del tipo de vacante. Lo que se ponga aquí gana sobre la regla
          general.
        </p>
        {(catalogos?.tiposVacante ?? []).map((tipo) => {
          const excepcion = reglas.excepciones.find((e) => e.tipoVacante === tipo);
          return (
            <div key={tipo} className="trow">
              <div className="trow-main">
                <b style={{ fontSize: 13.5 }}>{tipo}</b>
                <div className="help" style={{ marginTop: 2 }}>
                  {excepcion ? `Pide ${excepcion.meses} meses` : `Usa la regla general (${reglas.antiguedadMinimaMeses} meses)`}
                </div>
              </div>
              {excepcion && (
                <input type="number" min={0} max={120} value={excepcion.meses}
                  style={{ width: 84 }}
                  aria-label={`Meses exigidos para ${tipo}`}
                  onChange={(e) => void aplicar({
                    excepciones: reglas.excepciones.map((x) =>
                      x.tipoVacante === tipo ? { ...x, meses: Number(e.target.value) } : x),
                  })} />
              )}
              <button className={"switch" + (excepcion ? " on" : "")} role="switch"
                aria-checked={Boolean(excepcion)} aria-label={`Excepción para ${tipo}`}
                onClick={() => void aplicar({
                  excepciones: excepcion
                    ? reglas.excepciones.filter((x) => x.tipoVacante !== tipo)
                    : [...reglas.excepciones, { tipoVacante: tipo, meses: reglas.antiguedadMinimaMeses }],
                })} />
            </div>
          );
        })}
      </div>

      <p className="help" style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 7 }}>
        <Save size={13} />
        {guardando ? "Guardando…" : `Guardado automático. Última modificación: ${reglas.actualizado}.`}
        {error && <span style={{ color: "var(--bad)" }}>{error}</span>}
      </p>
    </>
  );
}
