/** Barra de avance sólida. La usa el mapa para el "% del camino" y el perfil para su completitud. */
interface Props {
  v: number;
  etiqueta?: string;
  ok?: boolean;
}

export function BarraAvance({ v, etiqueta, ok }: Props) {
  return (
    <div>
      {etiqueta && (
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12.5, fontWeight: 600 }}>
          <span>{etiqueta}</span>
          <span style={{ color: "var(--gold-dark)" }}>{v}%</span>
        </div>
      )}
      <div className={"barra" + (ok ? " ok" : "")} role="progressbar"
        aria-valuenow={v} aria-valuemin={0} aria-valuemax={100} aria-label={etiqueta}>
        <i style={{ width: `${Math.max(0, Math.min(100, v))}%` }} />
      </div>
    </div>
  );
}
