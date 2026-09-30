// Componente de ícono Material Symbols: renderiza el glifo con el nombre dado,
// con tamaño y clases Tailwind configurados según los props.
export default function Icon({ name, size = 20, className = '' }) {
  return (
    <span
      className={`material-symbols-outlined select-none ${className}`}
      style={{ fontSize: size, lineHeight: 1, fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20" }}
    >
      {name}
    </span>
  )
}