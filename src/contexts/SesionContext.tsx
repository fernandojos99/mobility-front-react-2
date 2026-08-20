/**
 * Sesión sin autenticación, como en Radar: el "quién soy" es un `<select>` en el sidebar.
 *
 * Cada setter escribe en localStorage de forma SÍNCRONA antes de tocar el estado, porque el cambio
 * de perfil va seguido de una recarga inmediata de la página: si se esperara al render, el valor
 * nuevo se perdería. Los try/catch son por el modo privado del navegador, donde `localStorage`
 * lanza en vez de fallar en silencio.
 */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export type Rol = "colaborador" | "generalista";

const K = { rol: "mc_rol", colaboradorId: "mc_colaboradorId" } as const;

const leer = (clave: string, fallback: string): string => {
  try { return localStorage.getItem(clave) ?? fallback; } catch { return fallback; }
};
const guardar = (clave: string, valor: string): void => {
  try { localStorage.setItem(clave, valor); } catch { /* modo privado */ }
};

interface SesionCtx {
  rol: Rol;
  colaboradorId: number;
  setRol: (r: Rol) => void;
  setColaboradorId: (id: number) => void;
  toastMsg: string;
  toast: (m: string) => void;
}

const Ctx = createContext<SesionCtx | null>(null);

export function SesionProvider({ children }: { children: ReactNode }) {
  const [rol, setRolState] = useState<Rol>(() => leer(K.rol, "colaborador") as Rol);
  const [colaboradorId, setColabState] = useState<number>(() => Number(leer(K.colaboradorId, "1")));
  const [toastMsg, setToastMsg] = useState("");

  const setRol = useCallback((r: Rol) => { guardar(K.rol, r); setRolState(r); }, []);
  const setColaboradorId = useCallback((id: number) => {
    guardar(K.colaboradorId, String(id));
    setColabState(id);
  }, []);

  // 2600 ms, el mismo tiempo que en Radar: suficiente para leerlo sin estorbar.
  const toast = useCallback((m: string) => {
    setToastMsg(m);
    setTimeout(() => setToastMsg(""), 2600);
  }, []);

  const valor = useMemo(
    () => ({ rol, colaboradorId, setRol, setColaboradorId, toastMsg, toast }),
    [rol, colaboradorId, setRol, setColaboradorId, toastMsg, toast],
  );

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export function useSesion(): SesionCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSesion debe usarse dentro de <SesionProvider>");
  return ctx;
}
