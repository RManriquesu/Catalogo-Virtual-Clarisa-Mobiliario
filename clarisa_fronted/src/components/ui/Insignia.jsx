/**
 * Badge (etiqueta de estado) con variantes de color.
 * - label: texto mostrado.
 * - tone: clave de color (green, amber, red, purple, brand, neutral, dark).
 * - dot: muestra un punto de color delante del texto.
 * - className: clases extras (p. ej. clases de condición dinámicas).
 */
export default function Insignia({ label, tone = 'neutral', dot = false, className = '' }) {
  // Paleta de tonos del badge (fondo y texto).
  const tones = {
    green: 'bg-[#e7f3e8] text-[#2e6930]',
    amber: 'bg-[#fef3c7] text-[#92400e]',
    red: 'bg-[#ffdad6] text-[#93000a]',
    purple: 'bg-[#ede9fe] text-[#5b21b6]',
    brand: 'bg-secondary-fixed text-secondary',
    neutral: 'bg-surface-container text-on-surface',
    dark: 'bg-primary text-on-primary',
  }
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-[0.25rem] px-2 py-0.5 font-label-md text-label-md ${tones[tone]} ${className}`}
    >
      {/* Punto opcional que usa el color actual del texto */}
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {label}
    </span>
  )
}