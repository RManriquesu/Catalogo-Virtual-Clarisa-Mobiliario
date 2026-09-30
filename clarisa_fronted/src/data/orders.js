// ============================================================
// Datos demo de la página "Pedidos vía WhatsApp".
// orders: pedidos/cotizaciones con cliente, contacto, pieza, monto,
//   método de pago y estado. Estructura del objeto:
//   id, client, phone, phoneRaw (para wa.me), district, time, item,
//   spec, price, payment, paymentKind (none|partial|full), status,
//   image.
// orderTabs / statusBadge / statusLabel: pestañas de filtro, colores
//   de estado y textos de estado.
// statusFlow / paymentOptions / buildOrderSteps: etapas del ciclo de producción,
//   opciones de pago y generador de la línea de tiempo según el estado real.
// ============================================================

export const orders = []

// Pestañas de filtro del listado de pedidos con su conteo base.
export const orderTabs = [
  { key: 'todos', label: 'Todos', count: 0, color: null },
  { key: 'pendiente', label: 'Pendientes', count: 0, color: 'bg-[#fef3c7] text-[#92400e]' },
  { key: 'taller', label: 'En Taller', count: 0, color: 'bg-secondary-fixed text-secondary' },
  { key: 'acabado', label: 'En Acabado', count: 0, color: 'bg-surface-container text-on-surface' },
  { key: 'ruta', label: 'En Ruta', count: 0, color: 'bg-[#ede9fe] text-[#5b21b6]' },
  { key: 'entregado', label: 'Entregados', count: 0, color: 'bg-[#e7f3e8] text-[#2e6930]' },
]

// Clases de color del badge según el estado del pedido.
export const statusBadge = {
  taller: 'bg-secondary-fixed text-secondary',
  ruta: 'bg-[#ede9fe] text-[#5b21b6]',
  pendiente: 'bg-[#fef3c7] text-[#92400e]',
  acabado: 'bg-[#e7f3e8] text-[#2e6930]',
  entregado: 'bg-surface-container text-on-surface',
}

// Texto legible de cada estado del pedido (se usa en el Drawer de detalle).
export const statusLabel = {
  taller: 'En Fabricación',
  ruta: 'En Despacho',
  pendiente: 'Pendiente Cotiz.',
  acabado: 'Calidad Superada',
  entregado: 'Conformidad OK',
}

// Etapas del ciclo de producción, en orden de avance. El índice marca el
// avance: todo lo anterior a `idx` está completado, `idx` es la etapa actual.
export const statusFlow = [
  { key: 'pendiente', label: 'Cotización pendiente', when: 'Esperando confirmación del cliente' },
  { key: 'taller', label: 'En taller', when: 'Fabricación en curso' },
  { key: 'acabado', label: 'En acabado', when: 'Ensamble y retoque de superficie' },
  { key: 'ruta', label: 'En ruta', when: 'Despacho programado' },
  { key: 'entregado', label: 'Entregado', when: 'Conformidad del cliente' },
]

// Opciones de estado de pago y su etiqueta visible.
export const paymentOptions = [
  { key: 'none', label: 'Sin pago', tone: 'amber' },
  { key: 'partial', label: 'Adelanto parcial', tone: 'brand' },
  { key: 'full', label: 'Pagado total', tone: 'green' },
]

/**
 * Construye la línea de tiempo del avance de un pedido a partir de su estado
 * actual y su estado de pago. Reemplaza al array fijo que mostraba siempre el
 * mismo avance para todos los pedidos.
 */
export function buildOrderSteps(order) {
  const idx = Math.max(
    0,
    statusFlow.findIndex((s) => s.key === order.status)
  )
  return statusFlow.map((step, i) => ({
    ...step,
    done: i < idx,
    current: i === idx,
    when: i < idx ? 'Completado' : i === idx ? step.when : 'Pendiente',
  }))
}
