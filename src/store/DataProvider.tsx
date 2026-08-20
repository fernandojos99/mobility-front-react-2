/**
 * Carga inicial y estado compartido: colaboradores, catálogos y puestos.
 *
 * Lo que NO vive aquí es tan importante como lo que sí: el gap, el camino y las oportunidades se
 * piden por pantalla, porque son datos DERIVADOS y cachearlos sería la forma más rápida de que el
 * mapa acabe contando algo distinto de la realidad.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { colaboradorService } from "../services/colaboradorService";
import { catalogoService } from "../services/catalogoService";
import type { Catalogos, Colaborador, Puesto } from "../types/domain";

interface DataCtx {
  colaboradores: Colaborador[];
  catalogos: Catalogos | null;
  puestos: Puesto[];
  cargando: boolean;
  error: string;
  /** Refresca todo desde el backend. */
  recargar: () => Promise<void>;
  /** Sustituye un colaborador ya cargado (tras una integración o un guardado). */
  actualizarColaborador: (c: Colaborador) => void;
  puestoDe: (id: string) => Puesto | undefined;
}

const Ctx = createContext<DataCtx | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [catalogos, setCatalogos] = useState<Catalogos | null>(null);
  const [puestos, setPuestos] = useState<Puesto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const recargar = useCallback(async () => {
    setCargando(true);
    setError("");
    try {
      const [cols, cats, pues] = await Promise.all([
        colaboradorService.listar(),
        catalogoService.obtener(),
        catalogoService.puestos(),
      ]);
      setColaboradores(cols);
      setCatalogos(cats);
      setPuestos(pues);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo conectar con el servidor");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { void recargar(); }, [recargar]);

  const actualizarColaborador = useCallback((c: Colaborador) => {
    setColaboradores((prev) => prev.map((x) => (x.id === c.id ? c : x)));
  }, []);

  const puestoDe = useCallback((id: string) => puestos.find((p) => p.id === id), [puestos]);

  const valor = useMemo(
    () => ({ colaboradores, catalogos, puestos, cargando, error, recargar, actualizarColaborador, puestoDe }),
    [colaboradores, catalogos, puestos, cargando, error, recargar, actualizarColaborador, puestoDe],
  );

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export function useData(): DataCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useData debe usarse dentro de <DataProvider>");
  return ctx;
}
