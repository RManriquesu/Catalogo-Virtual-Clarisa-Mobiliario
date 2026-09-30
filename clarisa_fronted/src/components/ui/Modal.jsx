import { useEffect } from 'react'
import Icono from './Icono'

/**
 * Modal (diálogo centrado) que se muestra sobre la pantalla.
 * - open / onClose: control de visibilidad y cierre.
 * - title / subtitle: cabecera del diálogo.
 * - children: contenido central (scrollable).
 * - footer: barra inferior de acciones (opcional).
 * - width: ancho adicional de Tailwind (p. ej. 'max-w-2xl', 'max-w-sm').
 * - id: prefijo para el aria-labelledby de accesibilidad.
 */
export default function Modal({ open, onClose, title, subtitle, children, footer, width = 'max-w-2xl', id }) {
  // Cierra el modal con la tecla Escape mientras está abierto.
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby={id && `${id}-title`}>
      {/* Fondo oscuro: clic en él cierra el modal */}
      <div className="absolute inset-0 bg-[#16110f]/50 backdrop-blur-[2px]" onClick={onClose} />
      {/* Tarjeta del diálogo */}
      <div className={`relative w-full ${width} max-h-[90vh] overflow-hidden rounded-lg bg-white shadow-2xl`}>
        {/* Cabecera: título, subtítulo y botón cerrar */}
        <div className="flex items-start justify-between gap-4 border-b border-surface-variant px-6 py-4">
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
        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">{children}</div>
        {/* Pie de acciones */}
        {footer && <div className="border-t border-surface-variant px-6 py-4">{footer}</div>}
      </div>
    </div>
  )
}