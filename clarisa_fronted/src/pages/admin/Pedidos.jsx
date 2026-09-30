import { useMemo, useState } from 'react'
import Icono from '../../components/ui/Icono'
import CabeceraPagina from '../../components/ui/CabeceraPagina'
import Insignia from '../../components/ui/Insignia'
import PanelLateral from '../../components/ui/PanelLateral'
import Modal from '../../components/ui/Modal'
import { useStore } from '../../store/StoreContext'
import { orderTabs, statusLabel, statusFlow, paymentOptions, buildOrderSteps } from '../../data/orders'

/**
 * Página admin de "Pedidos vía WhatsApp".
 * Gestiona los pedidos/cotizaciones recibidos por WhatsApp: muestra KPIs,
 * lista filtrada por estado, abré un Drawer con el detalle y avance de
 * producción, y permite registrar un nuevo pedido. Los datos vienen del
 * StoreContext (localStorage / API).
 */

// Formatea un número como moneda peruana (S/.).
const money = (n) => `S/. ${Number(n || 0).toLocaleString('es-PE')}`

/**
 * Normaliza un teléfono al formato que exige wa.me: solo dígitos y con el
 * prefijo de Perú (51). Acepta "984 321 890", "+51 984 321 890",
 * "051 984 321 890" o "51984321890" y devuelve "51984321890".
 * Devuelve cadena vacía si el número no parece un teléfono válido.
 */
const toWaNumber = (phone) => {
  let digits = String(phone || '').replace(/\D/g, '')
  if (!digits) return ''
  // "051984321890" → quitar el 0 de la troncal antes de anteponer el 51.
  if (digits.startsWith('0')) digits = digits.slice(1)
  if (!digits.startsWith('51')) digits = `51${digits}`
  // Móvil peruano: 51 + 9 dígitos. Fuera de ese rango no es un número válido.
  return digits.length === 11 ? digits : ''
}

export default function Pedidos() {
  // Pedidos, catálogo y acciones de gestión, desde el StoreContext.
  const { orders, products, addOrder, updateOrder, setOrderStatus, deleteOrder } = useStore()

  // Filtros: buscador y pestaña de estado actual.
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState('todos')
  // Pedido seleccionado para el Drawer de detalle.
  const [selected, setSelected] = useState(null)
  // Control del modal "Nuevo pedido".
  const [openNew, setOpenNew] = useState(false)
  // Pedido pendiente de confirmar antes de eliminar.
  const [toDelete, setToDelete] = useState(null)
  // Campos del formulario del nuevo pedido.
  const [form, setForm] = useState({
    client: '',
    phone: '',
    district: '',
    productId: '',
    item: '',
    spec: '',
    price: '',
    status: 'pendiente',
    paymentKind: 'none',
  })

  // Pestañas con el conteo de pedidos por estado ('todos' cuenta todo).
  const tabs = orderTabs.map((t) => ({
    ...t,
    count: t.key === 'todos' ? orders.length : orders.filter((o) => o.status === t.key).length,
  }))

  // Pedidos filtrados por búsqueda (cliente, id o pieza) y por pestaña.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return orders.filter((o) => {
      const matchQ =
        !q || o.client.toLowerCase().includes(q) || o.id.toLowerCase().includes(q) || o.item.toLowerCase().includes(q)
      const matchT = tab === 'todos' || o.status === tab
      return matchQ && matchT
    })
  }, [orders, query, tab])

  // Valor total en soles de todos los pedidos.
  const totalValue = orders.reduce((acc, o) => acc + o.price, 0)

  // Texto de la insignia de pago a partir de su tipo (none|partial|full).
  const paymentLabel = (kind) => paymentOptions.find((p) => p.key === kind)?.label || 'Sin pago'

  /**
   * Número de WhatsApp de un pedido: se deriva del teléfono capturado al
   * registrar el pedido. Si no hay un teléfono válido devuelve cadena vacía
   * (y el botón de WhatsApp se muestra deshabilitado en vez de escribirle
   * por error al número del negocio).
   */
  const waNumber = (order) => toWaNumber(order?.phoneRaw || order?.phone)

  // Texto descriptivo del pago, combinando tipo y monto.
  const paymentText = (kind, price) => {
    if (kind === 'full') return `Pagado 100% (${money(price)})`
    if (kind === 'partial') return `Adelanto registrado (${money(price)})`
    return 'Sin adelanto registrado'
  }

  /**
   * Al elegir un producto del catálogo se copian su nombre, especificación,
   * imagen y precio al formulario. Si el nombre se edita a mano deja de estar
   * vinculado al catálogo (productId = null).
   */
  const pickProduct = (productId) => {
    const p = products.find((x) => String(x.id) === String(productId))
    setForm((f) =>
      p
        ? {
            ...f,
            productId: p.id,
            item: p.name,
            spec: p.materialShort || p.material || '',
            price: String(p.price ?? ''),
          }
        : { ...f, productId: '' }
    )
  }

  // Al teclear el nombre a mano se corta el vínculo con el producto del catálogo.
  const editItem = (item) => setForm((f) => ({ ...f, item, productId: '' }))

  /** Registra el pedido con el estado de producción y pago elegidos. */
  const submitOrder = () => {
    if (!form.client.trim() || !form.item.trim() || !form.price) return
    const price = Number(form.price)
    // Normaliza el teléfono del cliente para poder escribirle por WhatsApp.
    const phoneRaw = toWaNumber(form.phone)
    addOrder({
      client: form.client,
      item: form.item,
      price,
      phone: form.phone || 'Sin registrar',
      phoneRaw,
      district: form.district || 'Por confirmar',
      spec: form.spec || 'Nueva cotización',
      status: form.status,
      payment: paymentText(form.paymentKind, price),
      paymentKind: form.paymentKind,
      time: 'Hoy, ahora',
      productId: form.productId ? Number(form.productId) : null,
      image: products.find((p) => String(p.id) === String(form.productId))?.image || '',
    })
    setOpenNew(false)
    setForm({
      client: '',
      phone: '',
      district: '',
      productId: '',
      item: '',
      spec: '',
      price: '',
      status: 'pendiente',
      paymentKind: 'none',
    })
  }

  /**
   * Avanza (o retrocede) un pedido a la etapa indicada. El eje de producción
   * (status) y el de pago (paymentKind) son independientes entre sí.
   */
  const moveToStatus = (order, status) => {
    setOrderStatus(order, status)
    setSelected((s) => (s && s.id === order.id ? { ...s, status } : s))
  }

  /** Cambia el estado de pago de un pedido sin tocar su etapa de producción. */
  const moveToPayment = (order, paymentKind) => {
    const updated = { ...order, paymentKind, payment: paymentText(paymentKind, order.price) }
    updateOrder(updated)
    setSelected((s) => (s && s.id === order.id ? updated : s))
  }

  /** Elimina un pedido pendiente (el backend solo permite borrar en ese estado). */
  const confirmDelete = () => {
    if (!toDelete) return
    deleteOrder(toDelete)
    if (selected?.id === toDelete.id) setSelected(null)
    setToDelete(null)
  }

  return (
    <div>
      {/* Encabezado con botón "Nuevo pedido" */}
      <CabeceraPagina
        title="Pedidos vía WhatsApp"
        subtitle={`${orders.filter((o) => o.status !== 'entregado').length} pedidos abiertos · ${money(totalValue)} en cotizaciones`}
        actions={
          <button
            onClick={() => setOpenNew(true)}
            className="flex items-center gap-1.5 rounded bg-primary px-3.5 py-2 font-label-md text-label-md text-on-primary transition-opacity hover:opacity-90"
          >
            <Icono name="add" size={18} /> Nuevo pedido
          </button>
        }
      />

      {/* ===== KPIs de pedidos por etapa ===== */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Pedidos abiertos', orders.filter((o) => o.status !== 'entregado').length, 'orders', 'bg-secondary-fixed'],
          ['Sin atender', orders.filter((o) => o.status === 'pendiente').length, 'schedule', 'bg-[#fef3c7]'],
          [
            'En producción',
            orders.filter((o) => ['taller', 'acabado'].includes(o.status)).length,
            'handyman',
            'bg-[#ede9fe]',
          ],
          ['Pagados', orders.filter((o) => o.paymentKind === 'full').length, 'paid', 'bg-[#e7f3e8]'],
        ].map(([label, value, icon, bg]) => (
          <div key={label} className="flex items-center gap-3 rounded bg-surface-container-lowest p-4 shadow-wood">
            <span className={`flex h-10 w-10 items-center justify-center rounded ${bg}`}>
              <Icono name={icon} size={20} className="!text-on-surface" />
            </span>
            <div>
              <div className="font-headline-md text-headline-md text-on-surface">{value}</div>
              <div className="font-body-sm text-body-sm text-on-surface-variant">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ===== Tabla de pedidos ===== */}
      <div className="mt-6 overflow-hidden rounded bg-surface-container-lowest shadow-wood">
        {/* Barra de filtros: buscador + pestañas de estado */}
        <div className="flex flex-wrap items-center gap-3 border-b border-surface-variant p-4">
          <div className="flex min-w-52 flex-1 items-center gap-2 rounded border border-outline-variant bg-white px-3 py-2 focus-within:border-secondary">
            <Icono name="search" size={18} className="text-on-surface-variant" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pedido, cliente o pieza…"
              className="w-full bg-transparent font-body-md text-body-md outline-none"
            />
          </div>
          {/* Pestañas "Todos / sin atender / taller / ruta / entregado" */}
          <div className="flex flex-wrap items-center gap-1.5">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 font-label-sm text-label-sm transition-colors ${
                  tab === t.key
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {t.label}
                <span
                  className={`rounded-full px-1.5 ${tab === t.key ? 'bg-on-primary/20' : 'bg-surface-container-high'}`}
                >
                  {t.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left">
            <thead>
              <tr className="border-b border-surface-variant font-label-sm text-label-sm uppercase text-on-surface-variant">
                <th className="px-4 py-3">Pedido</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Pieza</th>
                <th className="px-4 py-3 text-right">Monto</th>
                <th className="px-4 py-3">Método de pago</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/60">
              {/* Cada fila abre el Drawer de detalle al hacer clic */}
              {filtered.map((o) => (
                <tr
                  key={o.id}
                  className="cursor-pointer transition-colors hover:bg-surface-container-low/50"
                  onClick={() => setSelected(o)}
                >
                  <td className="px-4 py-3">
                    <div className="font-body-md text-body-md font-semibold text-on-surface">{o.id}</div>
                    <div className="font-label-sm text-label-sm text-on-surface-variant">{o.time}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-body-md text-body-md text-on-surface">{o.client}</div>
                    <div className="font-label-sm text-label-sm text-on-surface-variant">{o.district}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      {o.image ? (
                        <img src={o.image} alt="" className="h-10 w-10 rounded bg-surface-variant object-cover" />
                      ) : (
                        <span className="flex h-10 w-10 items-center justify-center rounded bg-surface-container text-on-surface-variant">
                          <Icono name="chair" size={18} />
                        </span>
                      )}
                      <div>
                        <div className="font-body-sm text-body-sm font-medium text-on-surface">{o.item}</div>
                        <div className="font-label-sm text-label-sm text-on-surface-variant">{o.spec}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-price-md text-price-md text-on-surface">{money(o.price)}</td>
                  {/* Estado del pago (verde=total, brand=adelanto, ámbar=sin pago) */}
                  <td className="px-4 py-3">
                    <Insignia
                      tone={o.paymentKind === 'full' ? 'green' : o.paymentKind === 'partial' ? 'brand' : 'amber'}
                      label={paymentLabel(o.paymentKind)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Insignia tone="neutral" label={statusLabel[o.status]} />
                  </td>
                  {/* Acciones por fila: borrado (solo pendientes) y enlace a WhatsApp.
                      El contenedor detiene la propagación para no abrir el Drawer. */}
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                      {o.status === 'pendiente' && (
                        <button
                          onClick={() => setToDelete(o)}
                          title="Eliminar pedido pendiente"
                          aria-label={`Eliminar pedido ${o.id}`}
                          className="flex items-center gap-1 rounded border border-outline-variant px-2.5 py-1.5 font-label-sm text-label-sm text-on-surface transition-colors hover:border-[#b3261e] hover:text-[#b3261e]"
                        >
                          <Icono name="delete" size={14} /> Borrar
                        </button>
                      )}
                      {/* Escribe al WhatsApp del cliente. Si el pedido no tiene un teléfono
                          válido se muestra deshabilitado, para no terminar
                          escribiéndole al número del negocio por error. */}
                      {waNumber(o) ? (
                        <a
                          href={`https://wa.me/${waNumber(o)}?text=${encodeURIComponent(`Hola ${o.client.split(' ')[0]}, te escribimos de Clarisa Mobiliario por tu pedido ${o.id}.`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 rounded border border-outline-variant px-2.5 py-1.5 font-label-sm text-label-sm text-on-surface transition-colors hover:border-secondary hover:text-secondary"
                        >
                          <Icono name="chat" size={14} /> WhatsApp
                        </a>
                      ) : (
                        <span
                          title="Este pedido no tiene un teléfono válido"
                          className="flex cursor-not-allowed items-center gap-1 rounded border border-outline-variant px-2.5 py-1.5 font-label-sm text-label-sm text-on-surface-variant opacity-50"
                        >
                          <Icono name="chat_off" size={14} /> Sin teléfono
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Mensaje cuando no hay resultados */}
          {filtered.length === 0 && (
            <div className="py-14 text-center">
              <Icono name="order_approve" size={28} className="mx-auto text-on-surface-variant" />
              <p className="mt-2 font-body-md text-body-md text-on-surface-variant">Sin pedidos para esta vista.</p>
            </div>
          )}
        </div>
        {/* Contador y total */}
        <div className="border-t border-surface-variant px-4 py-3 font-label-sm text-label-sm text-on-surface-variant">
          {filtered.length} de {orders.length} pedidos · total en mesa {money(totalValue)}
        </div>
      </div>

      {/* ===== Drawer de detalle del pedido ===== */}
      <PanelLateral
        open={!!selected}
        onClose={() => setSelected(null)}
        id="order-detail"
        title={selected?.id}
        subtitle="Pedido vía WhatsApp · detalle de avance"
        footer={
          // Botón para continuar la conversación en el WhatsApp del cliente.
          selected &&
          (waNumber(selected) ? (
            <a
              href={`https://wa.me/${waNumber(selected)}?text=${encodeURIComponent(`Hola ${selected.client.split(' ')[0]}, te escribimos de Clarisa por tu pedido ${selected.id} (${selected.item}).`)}`}
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded bg-[#25d366] py-2.5 font-label-md text-label-md text-white"
            >
              <Icono name="chat" size={18} /> Continuar conversación
            </a>
          ) : (
            <div className="flex w-full items-center justify-center gap-2 rounded bg-surface-container py-2.5 font-label-md text-label-md text-on-surface-variant">
              <Icono name="chat_off" size={18} /> Sin teléfono registrado
            </div>
          ))
        }
      >
        {selected && (
          <div className="space-y-5">
            {/* Cabecera con imagen y nombre de la pieza */}
            <div className="flex items-center gap-3">
              {selected.image ? (
                <img src={selected.image} alt="" className="h-16 w-16 rounded bg-surface-variant object-cover" />
              ) : (
                <span className="flex h-16 w-16 items-center justify-center rounded bg-surface-container text-on-surface-variant">
                  <Icono name="chair" size={28} />
                </span>
              )}
              <div>
                <div className="font-headline-sm text-headline-sm text-on-surface">{selected.item}</div>
                <div className="font-body-sm text-body-sm text-on-surface-variant">{selected.spec}</div>
              </div>
            </div>

            {/* ===== Estado de pago (eje independiente del de producción) ===== */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h4 className="font-headline-sm text-headline-sm text-on-surface">Pago</h4>
                <Insignia
                  tone={
                    selected.paymentKind === 'full' ? 'green' : selected.paymentKind === 'partial' ? 'brand' : 'amber'
                  }
                  label={paymentLabel(selected.paymentKind)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {paymentOptions.map((p) => (
                  <button
                    key={p.key}
                    onClick={() => moveToPayment(selected, p.key)}
                    aria-pressed={selected.paymentKind === p.key}
                    className={`rounded border px-3 py-1.5 font-label-sm text-label-sm transition-colors ${
                      selected.paymentKind === p.key
                        ? 'border-secondary bg-secondary-fixed text-secondary'
                        : 'border-outline-variant text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <div className="mt-2 font-body-sm text-body-sm text-on-surface-variant">{selected.payment}</div>
            </div>

            {/* Datos clave: cliente, ubicación y monto */}
            <div className="rounded bg-surface-container p-4">
              {[
                ['person', 'Cliente', `${selected.client} · ${selected.phone}`],
                ['location_on', 'Ubicación', selected.district],
                ['sell', 'Monto', money(selected.price)],
              ].map(([icon, k, v]) => (
                <div key={k} className="flex items-center gap-3 py-1.5">
                  <Icono name={icon} size={18} className="text-secondary" />
                  <span className="w-24 font-label-sm text-label-sm uppercase text-on-surface-variant">{k}</span>
                  <span className="font-body-sm text-body-sm text-on-surface">{v}</span>
                </div>
              ))}
            </div>

            {/* ===== Avance de producción (etapa actual + botones de cambio) ===== */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h4 className="font-headline-sm text-headline-sm text-on-surface">Avance de producción</h4>
                <Insignia tone="brand" label={statusLabel[selected.status]} />
              </div>
              <ol className="space-y-0">
                {buildOrderSteps(selected).map((s, i, arr) => (
                  <li key={s.key} className="relative flex gap-3 pb-5 last:pb-0">
                    {/* Línea conectora vertical entre pasos */}
                    {i < arr.length - 1 && (
                      <span className="absolute left-[15px] top-8 h-full w-px bg-outline-variant" />
                    )}
                    {/* Círculo del paso: completado (verde), actual (marca), o pendiente */}
                    <span
                      className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        s.done
                          ? 'bg-[#e7f3e8] text-[#2e6930]'
                          : s.current
                            ? 'bg-secondary-fixed text-secondary'
                            : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      <Icono name={s.done ? 'check' : s.current ? 'timelapse' : 'radio_button_unchecked'} size={16} />
                    </span>
                    <div className="pt-1">
                      <div
                        className={`font-body-sm text-body-sm font-medium ${s.current ? 'text-secondary' : 'text-on-surface'}`}
                      >
                        {s.label}
                      </div>
                      <div className="font-label-sm text-label-sm text-on-surface-variant">{s.when}</div>
                    </div>
                  </li>
                ))}
              </ol>

              {/* Cambio rápido de etapa: cualquier estado del ciclo es seleccionable */}
              <div className="mt-1 rounded border border-surface-variant p-3">
                <div className="mb-2 font-label-sm text-label-sm uppercase text-on-surface-variant">Mover a</div>
                <div className="flex flex-wrap gap-2">
                  {statusFlow.map((s) => (
                    <button
                      key={s.key}
                      onClick={() => moveToStatus(selected, s.key)}
                      aria-pressed={selected.status === s.key}
                      className={`rounded border px-3 py-1.5 font-label-sm text-label-sm transition-colors ${
                        selected.status === s.key
                          ? 'border-secondary bg-secondary-fixed text-secondary'
                          : 'border-outline-variant text-on-surface-variant hover:bg-surface-container'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Borrado disponible solo mientras el pedido sigue pendiente */}
            {selected.status === 'pendiente' && (
              <button
                onClick={() => setToDelete(selected)}
                className="flex w-full items-center justify-center gap-2 rounded border border-[#b3261e] px-3 py-2 font-label-md text-label-md text-[#b3261e] transition-colors hover:bg-[#ffdad6]"
              >
                <Icono name="delete" size={18} /> Eliminar pedido pendiente
              </button>
            )}
          </div>
        )}
      </PanelLateral>

      {/* ===== Modal de confirmación de borrado ===== */}
      <Modal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        id="delete-order"
        title="Eliminar pedido"
        subtitle="Solo se puede eliminar un pedido que siga pendiente"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setToDelete(null)}
              className="rounded px-4 py-2 font-label-md text-label-md text-on-surface-variant hover:bg-surface-container"
            >
              Cancelar
            </button>
            <button
              onClick={confirmDelete}
              className="flex items-center gap-2 rounded bg-[#b3261e] px-4 py-2 font-label-md text-label-md text-white"
            >
              <Icono name="delete" size={18} /> Eliminar
            </button>
          </div>
        }
      >
        {toDelete && (
          <div className="space-y-3">
            <p className="font-body-md text-body-md text-on-surface">
              Se eliminará el pedido <strong>{toDelete.id}</strong> de {toDelete.client}.
            </p>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Esta acción no se puede deshacer y solo aplica a pedidos con estado pendiente.
            </p>
          </div>
        )}
      </Modal>

      {/* ===== Modal de nuevo pedido ===== */}
      <Modal
        open={openNew}
        onClose={() => setOpenNew(false)}
        id="new-order"
        title="Nuevo pedido"
        subtitle="Registra una cotización entrante por WhatsApp"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setOpenNew(false)}
              className="rounded px-4 py-2 font-label-md text-label-md text-on-surface-variant hover:bg-surface-container"
            >
              Cancelar
            </button>
            {/* Deshabilitado hasta que se completen cliente, pieza y monto */}
            <button
              onClick={submitOrder}
              disabled={!form.client.trim() || !form.item.trim() || !form.price}
              className="flex items-center gap-2 rounded bg-primary px-4 py-2 font-label-md text-label-md text-on-primary disabled:opacity-50"
            >
              <Icono name="add" size={18} /> Registrar pedido
            </button>
          </div>
        }
      >
        {/* Datos del cliente */}
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ['client', 'Cliente', 'Nombre completo'],
            ['district', 'Distrito', 'Miraflores, Lima'],
          ].map(([key, label, ph]) => (
            <label key={key} className="block">
              <span className="font-label-md text-label-md uppercase text-on-surface-variant">{label}</span>
              <input
                className="mt-1 w-full rounded border border-outline-variant bg-white px-3 py-2 font-body-md text-body-md outline-none focus:border-secondary"
                placeholder={ph}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
            </label>
          ))}
          {/* Teléfono del cliente: se convierte al formato de wa.me (51 + 9 dígitos)
              para que el botón de WhatsApp escriba al cliente y no al negocio. */}
          <label className="block sm:col-span-2">
            <span className="font-label-md text-label-md uppercase text-on-surface-variant">Teléfono / WhatsApp</span>
            <input
              className={`mt-1 w-full rounded border bg-white px-3 py-2 font-body-md text-body-md outline-none focus:border-secondary ${
                form.phone && !waNumber({ phone: form.phone }) ? 'border-[#b3261e]' : 'border-outline-variant'
              }`}
              placeholder="984 321 890"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <span
              className={`mt-1 block font-label-sm text-label-sm ${
                form.phone && !waNumber({ phone: form.phone }) ? 'text-[#b3261e]' : 'text-on-surface-variant'
              }`}
            >
              {form.phone && !waNumber({ phone: form.phone })
                ? 'Número incompleto. Se esperan 9 dígitos, por ejemplo 984 321 890.'
                : waNumber({ phone: form.phone })
                  ? `Se guardará como +${waNumber({ phone: form.phone })} para escribirle por WhatsApp.`
                  : 'Opcional. Sin teléfono no se podrá contactar al cliente por WhatsApp desde el pedido.'}
            </span>
          </label>
        </div>

        {/* Selector de pieza desde el catálogo vigente: al elegir se copian
            nombre, especificación, imagen y precio. */}
        <div className="mt-4">
          <label className="block">
            <span className="font-label-md text-label-md uppercase text-on-surface-variant">Pieza del catálogo</span>
            <select
              className="mt-1 w-full rounded border border-outline-variant bg-white px-3 py-2 font-body-md text-body-md outline-none focus:border-secondary"
              value={form.productId}
              onChange={(e) => pickProduct(e.target.value)}
            >
              <option value="">— Elegir del catálogo —</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} · {money(p.price)}
                </option>
              ))}
            </select>
          </label>
          <div className="mt-1 font-label-sm text-label-sm text-on-surface-variant">
            Si la pieza no está en el catálogo, escríbela a mano en el campo siguiente.
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ['item', 'Pieza', 'Nombre del mueble'],
            ['price', 'Monto', 'S/. en soles'],
            ['spec', 'Especificación', 'Ej. Roble & Lino • 3 cuerpos'],
          ].map(([key, label, ph]) => (
            <label key={key} className={key === 'spec' ? 'block sm:col-span-2' : 'block'}>
              <span className="font-label-md text-label-md uppercase text-on-surface-variant">{label}</span>
              <input
                className="mt-1 w-full rounded border border-outline-variant bg-white px-3 py-2 font-body-md text-body-md outline-none focus:border-secondary"
                placeholder={ph}
                value={form[key]}
                onChange={(e) =>
                  key === 'item' ? editItem(e.target.value) : setForm({ ...form, [key]: e.target.value })
                }
              />
            </label>
          ))}
        </div>

        {/* Estado de producción: en proceso o ya en otra etapa */}
        <div className="mt-4">
          <span className="font-label-md text-label-md uppercase text-on-surface-variant">Estado del pedido</span>
          <div className="mt-1 flex flex-wrap gap-2">
            {statusFlow.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => setForm({ ...form, status: s.key })}
                aria-pressed={form.status === s.key}
                className={`rounded border px-3 py-1.5 font-label-sm text-label-sm transition-colors ${
                  form.status === s.key
                    ? 'border-secondary bg-secondary-fixed text-secondary'
                    : 'border-outline-variant text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Estado de pago: independiente del avance de producción */}
        <div className="mt-4">
          <span className="font-label-md text-label-md uppercase text-on-surface-variant">Pago</span>
          <div className="mt-1 flex flex-wrap gap-2">
            {paymentOptions.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setForm({ ...form, paymentKind: p.key })}
                aria-pressed={form.paymentKind === p.key}
                className={`rounded border px-3 py-1.5 font-label-sm text-label-sm transition-colors ${
                  form.paymentKind === p.key
                    ? 'border-secondary bg-secondary-fixed text-secondary'
                    : 'border-outline-variant text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  )
}
