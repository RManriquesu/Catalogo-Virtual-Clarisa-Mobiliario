import { useEffect } from 'react'
import Icono from './Icono'

/**
 * Drawer (panel lateral deslizante desde la derecha).
 * - open / onClose: control de visibilidad y cierre.
 * - title / subtitle: cabecera del panel.
 * - children: contenido central (scrollable).
 * - footer: barra inferior de acciones (opcional).
 * - width: ancho adicional de Tailwind (p. ej. 'max-w-md').
 * - id: prefijo para el aria-labelledby de accesibilidad.
 */
export default function PanelLateral({ open, onClose, title, subtitle, width = 'max-w-md', children, footer, id }) {
  // Cierra el drawer con la tecla Escape mientras está abierto.
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby={id && `${id}-title`}>
      {/* Fondo oscuro: clic en él cierra el drawer */}
      <div className="absolute inset-0 bg-[#16110f]/40 backdrop-blur-[1px]" onClick={onClose} />
      {/* Panel lateral derecho */}
      <div
        className={`absolute inset-y-0 right-0 flex w-full ${width} flex-col bg-white shadow-2xl transition-transform duration-300`}
      >
        {/* Cabecera: título, subtítulo y botón cerrar */}
        <div className="flex items-start justify-between gap-4 border-b border-surface-variant px-5 py-4">
          <div>
            {title && (
              <h3 id={id && `${id}-title`} className="font-headline-md text-headline-md text-on-surface">
                {title}
              </h3>
            )}
            {subtitle && <p className="mt-0.5 font-body-sm text-body-sm text-on-surface-variant">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="-mr-1 -mt-1 rounded-full p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container"
            aria-label="Cerrar"
          >
            <Icono name="close" size={20} />
          </button>
        </div>
        {/* Contenido con scroll vertical */}
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {/* Pie de acciones */}
        {footer && <div className="border-t border-surface-variant px-5 py-4">{footer}</div>}
      </div>
    </div>
  )
}