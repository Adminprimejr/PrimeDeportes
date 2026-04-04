export default function Ticker() {
  const message =
    'BREAKING: PRIME DEPORTES — COBERTURA TOTAL EN LAS 16 SEDES DEL MUNDIAL 2026 • ⚡ CUPOS PUBLICITARIOS LIMITADOS — CIERRE DE VENTAS 1 JUNIO • ⚽ EL MUNDIAL SE JUEGA EN PRIME DEPORTES • JORGE RODRÍGUEZ EN VIVO DESDE LOS ESTADIOS • '

  return (
    <div className="ticker-wrap" aria-hidden="true">
      <div className="ticker-content font-display font-black uppercase text-sm tracking-widest">
        {message}
        {message}
      </div>
    </div>
  )
}
