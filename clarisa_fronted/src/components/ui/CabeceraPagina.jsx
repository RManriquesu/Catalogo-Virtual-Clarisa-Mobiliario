/**
 * Encabezado estándar de las páginas admin.
 * Muestra un título, un subtítulo opcional y un bloque de acciones (botones).
 */
export default function CabeceraPagina({ title, subtitle, actions }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      {/* Título y subtítulo de la página */}
      <div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">{title}</h1>
        {subtitle && <p className="mt-1 font-body-md text-body-md text-on-surface-variant">{subtitle}</p>}
      </div>
      {/* Acciones opcionales (p. ej. botón "Nuevo producto") */}
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}