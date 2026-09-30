import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Icono from '../components/ui/Icono'
import Modal from '../components/ui/Modal'
import Insignia from '../components/ui/Insignia'
import { useStore } from '../store/StoreContext'
import { categories, waLink, WhatsAppNumber, WhatsAppDisplay } from '../data/products'

/**
 * Página pública de la tienda (landing page de Clarisa Mobiliario).
 * Muestra el catálogo de muebles con buscador, filtros por categoría y
 * disponibilidad, ordenamiento, sección de maderas nativas, taller a medida,
 * footer y el modal de "ver pieza" (quickview) con cotización por WhatsApp.
 */

// Etiquetas del selector de disponibilidad (stock / a pedido).
const availabilityLabels = {
  all: 'Todas (Stock + A Pedido)',
  stock: 'Solo Stock Inmediato',
  custom: 'Solo A Pedido / Dimensión',
}

// Opciones de ordenamiento del catálogo.
const sortOptions = [
  { key: 'featured', label: 'Destacados' },
  { key: 'price-asc', label: 'Precio: menor a mayor' },
  { key: 'price-desc', label: 'Precio: mayor a menor' },
  { key: 'a-z', label: 'Nombre: A – Z' },
]

// Mensaje pre-armado para el botón general de WhatsApp.
const waText = encodeURIComponent('Hola Clarisa Mobiliario, deseo recibir la lista completa de muebles de autor.')

export default function TiendaPublica() {
  // Productos del estado global (se sincronizan con el backend si está disponible).
  const { products } = useStore()

  // Estado de los filtros del catálogo:
  const [query, setQuery] = useState('') // texto de búsqueda libre
  const [cat, setCat] = useState('todos') // categoría seleccionada
  const [avail, setAvail] = useState('all') // disponibilidad (todas/stock/a pedido)
  const [sort, setSort] = useState('featured') // criterio de orden
  const [openId, setOpenId] = useState(null) // id del producto en modal quickview

  // Productos filtrados según los criterios activos (memorizado con useMemo).
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    // Asigna un peso de "destacado" a ciertos productos (id 6, 1, 4) para el orden por defecto.
    let list = products.map((p) => ({ ...p, _featured: p.id === 6 ? 0 : p.id === 1 ? 1 : p.id === 4 ? 2 : 3 }))

    // Filtro por categoría (compara la primera palabra de la etiqueta o un match parcial).
    if (cat !== 'todos') list = list.filter((p) => p.categoryLabel.split(' ')[0].toLowerCase() === cat.toLowerCase() || p.categoryLabel.includes(cat))

    // Filtro por disponibilidad: stock o a pedido.
    if (avail !== 'all') list = list.filter((p) => p.availability === avail)

    // Búsqueda libre por nombre, material, tagline o categoría.
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.material.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q) ||
          p.categoryLabel.toLowerCase().includes(q)
      )
    }

    // Ordena según el criterio elegido.
    switch (sort) {
      case 'price-asc':
        list.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        list.sort((a, b) => b.price - a.price)
        break
      case 'a-z':
        list.sort((a, b) => a.name.localeCompare(b.name))
        break
      default:
        list.sort((a, b) => a._featured - b._featured) // orden por destacados
    }
    return list
  }, [products, query, cat, avail, sort])

  // Producto actualmente abierto en el modal quickview (o null si no hay ninguno).
  const open = products.find((p) => p.id === openId)

  return (
    <div>
      {/* ===== Header fijo (sticky): logo, navegación, WhatsApp y acceso admin ===== */}
      <header className="sticky top-0 z-40 border-b border-outline-variant/70 bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          {/* Logo que enlaza a la raíz de la tienda */}
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded bg-primary text-on-primary">
              <Icono name="chair" size={20} />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="font-headline-md text-headline-sm">Clarisa Mobiliario</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">Muebles de Autor</span>
            </span>
          </Link>
          {/* Navegación de secciones de la página (anclas) */}
          <nav className="hidden items-center gap-6 font-body-md text-body-md text-on-surface-variant md:flex">
            <a href="#muebles" className="transition-colors hover:text-on-surface">Muebles de Autor</a>
            <a href="#taller" className="transition-colors hover:text-on-surface">Taller a Medida</a>
          </nav>
          {/* Botones de WhatsApp general y acceso al panel admin */}
          <div className="flex items-center gap-2">
            <a
              href={`https://wa.me/${WhatsAppNumber}?text=${waText}`}
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-2 rounded bg-[#25d366] px-3.5 py-2 font-label-md text-label-md text-white transition-opacity hover:opacity-90 sm:flex"
            >
              <Icono name="chat" size={16} /> WhatsApp
            </a>
            <Link
              to="/admin"
              className="flex items-center gap-1.5 rounded px-2.5 py-2 font-label-md text-label-md text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
            >
              <Icono name="admin_panel_settings" size={18} /> Acceso admin
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* ===== Hero: titular de marca con imagen del showroom ===== */}
        <section className="relative overflow-hidden bg-primary text-on-primary">
          <div className="mx-auto flex max-w-7xl flex-col gap-10 px-6 py-16 md:flex-row md:items-center md:py-24">
            {/* Texto principal del hero */}
            <div className="max-w-xl">
              <p className="font-label-md text-label-md tracking-[0.2em] text-secondary-fixed-dim">DISEÑO PERUANO EN MADERA NATIVA</p>
              <h1 className="mt-4 font-headline-xl text-headline-xl leading-[1.05]">
                Muebles de autor que cuentan la historia del Perú en cada fibra.
              </h1>
              <p className="mt-5 font-body-lg text-body-lg text-on-primary-container">
                Cedro amazónico, tornillo curado y nogal seleccionado. Piezas hechas a mano en nuestro taller de Lima con trazabilidad SERFOR certificada.
              </p>
              {/* Llamadas a la acción: explorar colección / taller a medida */}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href="#muebles"
                  className="rounded bg-on-primary px-5 py-3 font-label-md text-label-md text-primary transition-transform hover:-translate-y-0.5"
                >
                  Explorar colección
                </a>
                <a
                  href="#taller"
                  className="rounded border border-on-primary/30 px-5 py-3 font-label-md text-label-md text-on-primary transition-transform hover:-translate-y-0.5"
                >
                  Taller a medida
                </a>
              </div>
            </div>
            {/* Imagen del showroom */}
            <div className="md:w-1/2">
              <div className="rounded-lg bg-surface-container-lowest p-2 shadow-wood">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDiLJf6QDf3pVLlpsEDe0p3cc7gj8tAi0LQPgk2Gd7zvxCNL0ozb3qzbSlRShgxeixK7utYLXtrySeh96OrjxwL6t1TENYg3ET7XiQsGzIwtVkNNYA7FIVla6pslltrWjVKXiCXGz5mExyxEnRDU7cl6mPcaIoNb6e10aM3G3_p58DvJu1pVOjCGYfEWgipVF2hdRcbY6k-JJ8IAjOkUSUqtPmufCBoGdyTnLf8di1g-bKmQ9A1ftrfeA"
                  alt="Showroom Clarisa"
                  className="aspect-[4/3] w-full rounded object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ===== Catálogo (id="muebles") ===== */}
        <section id="muebles" className="mx-auto max-w-7xl px-6 pb-20 pt-12">
          {/* Encabezado de la sección */}
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface">Catálogo de autor</h2>
              <p className="mt-1 max-w-xl font-body-md text-body-md text-on-surface-variant">
                Cada pieza pasa por 14 controles de calidad y usa madera de origen verificada por SERFOR.
              </p>
            </div>
          </div>

          {/* Barra de herramientas: buscador + selectores de disponibilidad y orden */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {/* Input de búsqueda con icono y botón para limpiar */}
            <div className="flex min-w-56 flex-1 items-center gap-2 rounded border border-outline-variant bg-white px-3 py-2.5 transition-colors focus-within:border-secondary">
              <Icono name="search" size={18} className="text-on-surface-variant" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nombre, madera o estilo…"
                className="w-full bg-transparent font-body-md text-body-md outline-none placeholder:text-outline"
              />
              {query && (
                <button onClick={() => setQuery('')} className="text-on-surface-variant" aria-label="Limpiar búsqueda">
                  <Icono name="close" size={16} />
                </button>
              )}
            </div>
            {/* Selector de disponibilidad cosmética (flecha desplegable hecha con SVG inline) */}
            <select
              value={avail}
              onChange={(e) => setAvail(e.target.value)}
              className="h-11 appearance-none rounded border border-outline-variant bg-white px-3 pr-8 font-body-md text-body-md outline-none focus:border-secondary"
              style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2214%22 height=%2214%22 fill=%22%23665c5a%22 viewBox=%220 0 24 24%22><path d=%22M7 10l5 5 5-5z%22/></svg>')", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
            >
              {Object.entries(availabilityLabels).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            {/* Selector de ordenamiento */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-11 appearance-none rounded border border-outline-variant bg-white px-3 pr-8 font-body-md text-body-md outline-none focus:border-secondary"
              style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2214%22 height=%2214%22 fill=%22%23665c5a%22 viewBox=%220 0 24 24%22><path d=%22M7 10l5 5 5-5z%22/></svg>')", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
            >
              {sortOptions.map((o) => (
                <option key={o.key} value={o.key}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Chips/pills de filtro por categoría */}
          <div className="mt-3 flex flex-wrap gap-2">
            {categories.map((c) => {
              const active = cat === c.toLowerCase().replace(' de centro', '').replace('sillas y ', '')
              return (
                <button
                  key={c}
                  onClick={() => setCat(c.toLowerCase().replace(' de centro', ''))}
                  className={`rounded-full px-4 py-2 font-label-md text-label-md transition-colors ${
                    active ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  {c}
                </button>
              )
            })}
          </div>

          {/* Grid de tarjetas de producto */}
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.map((p) => (
              <article key={p.id} className="group cursor-pointer overflow-hidden rounded-lg bg-surface-container-lowest shadow-soft transition-shadow hover:shadow-wood">
                {/* Imagen con insignia de disponibilidad */}
                <div className="relative aspect-square overflow-hidden">
                  <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <span className={`absolute top-3 left-3 rounded px-2 py-1 ${p.availability === 'stock' ? 'bg-[#e7f3e8] text-[#2e6930]' : 'bg-[#fef3c7] text-[#92400e]'}`}>
                    <span className="font-label-sm text-label-sm">{p.availability === 'stock' ? '✓ ' : '◦ '}{p.badge}</span>
                  </span>
                </div>
                {/* Información del producto: categoría, nombre, material y precio */}
                <div className="p-4">
                  <div className="font-label-md text-label-md uppercase text-secondary">{p.categoryLabel}</div>
                  <h3 className="mt-1 font-headline-sm text-headline-sm text-on-surface">{p.name}</h3>
                  <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">{p.materialShort}</p>
                  <div className="mt-3 flex items-end justify-between gap-2">
                    <div>
                      <div className="font-body-sm text-body-sm text-on-surface-variant">Desde</div>
                      <div className="font-price-lg text-price-lg text-on-surface">
                        S/. {p.price.toLocaleString('es-PE')}
                        {p.availability === 'custom' && <span className="ml-1 align-middle font-label-sm text-label-sm text-on-surface-variant">IVA incluido</span>}
                      </div>
                    </div>
                  </div>
                  {/* Acciones de la tarjeta: ver pieza (modal) y cotizar por WhatsApp */}
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => setOpenId(p.id)}
                      className="flex-1 rounded bg-primary py-2.5 font-label-md text-label-md text-on-primary transition-opacity hover:opacity-90"
                    >
                      Ver pieza
                    </button>
                    <a
                      href={waLink(p.name, `S/. ${p.price.toLocaleString('es-PE')}`)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center rounded bg-[#25d366] px-3 text-white transition-opacity hover:opacity-90"
                      aria-label="Cotizar por WhatsApp"
                    >
                      <Icono name="chat" size={18} />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Estado vacío cuando ninguna pieza coincide con los filtros */}
          {filtered.length === 0 && (
            <div className="mt-8 flex flex-col items-center gap-3 rounded-lg bg-surface-container-lowest py-16 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-container">
                <Icono name="search_off" size={26} className="text-on-surface-variant" />
              </span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Sin resultados</h3>
              <p className="max-w-sm font-body-sm text-body-sm text-on-surface-variant">
                No hay piezas que coincidan con tu búsqueda. Prueba con otra madera o revisa nuestro catálogo completo.
              </p>
              <button
                onClick={() => { setQuery(''); setCat('todos'); setAvail('all') }}
                className="mt-2 rounded bg-secondary px-4 py-2 font-label-md text-label-md text-on-secondary"
              >
                Limpiar filtros
              </button>
            </div>
          )}

          {/* Contador de resultados */}
          <p className="mt-8 text-center font-body-sm text-body-sm text-on-surface-variant">
            {filtered.length} pieza{filtered.length !== 1 && 's'} en esta vista · {products.length} piezas en catálogo
          </p>
        </section>

        {/* ===== Taller a medida (id="taller") ===== */}
        <section id="taller" className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-8 rounded-lg bg-surface-container-lowest p-8 shadow-wood md:grid-cols-2 md:items-center md:p-12">
            <div>
              <p className="font-label-md text-label-md tracking-[0.2em] text-secondary">TALLER A MEDIDA</p>
              <h2 className="mt-3 font-headline-lg text-headline-lg text-on-surface">Piezas construidas para tu espacio</h2>
              <p className="mt-4 font-body-md text-body-md text-on-surface-variant">
                Dimensiones, acabados y maderas según tu proyecto. Desde S/. 15,000 en adelante para piezas únicas o ensembles completos.
              </p>
              {/* Beneficios del servicio a medida */}
              <ul className="mt-6 space-y-3">
                {[
                  ['straighten', 'Medidas exactas para tu espacio en 2 visitas'],
                  ['eco', 'Madera nativa seleccionada a mano en almacén'],
                  ['handyman', 'Construcción artesanal en 12 a 25 días hábiles'],
                  ['local_shipping', 'Entrega e instalación en Lima a nivel nacional'],
                ].map(([icon, txt]) => (
                  <li key={txt} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded bg-secondary-fixed text-secondary">
                      <Icono name={icon} size={18} />
                    </span>
                    <span className="pt-1.5 font-body-md text-body-md text-on-surface-variant">{txt}</span>
                  </li>
                ))}
              </ul>
              {/* Botón para coordinar visita → WhatsApp */}
              <a
                href={`https://wa.me/${WhatsAppNumber}?text=${encodeURIComponent('Hola, tengo un proyecto a medida y quiero coordinar una visita al taller.')}`}
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-flex items-center gap-2 rounded bg-secondary px-5 py-3 font-label-md text-label-md text-on-secondary transition-transform hover:-translate-y-0.5"
              >
                <Icono name="straighten" size={18} /> Coordinar visita al taller
              </a>
            </div>
            {/* Tabla de presupuestos orientativos */}
            <div className="h-full min-h-64 rounded-lg bg-surface-container-low p-4">
              <div className="flex h-full flex-col justify-between rounded p-4">
                <div>
                  <div className="font-label-md text-label-md uppercase text-on-surface-variant">Presupuesto orientativo</div>
                  <div className="mt-2 space-y-2 font-body-md text-body-md text-on-surface-variant">
                    {[
                      ['Repisa sobre medida', 'S/. 380 – 1,250'],
                      ['Mesa de centro a medida', 'S/. 1,000 – 1,300'],
                      ['Comedor para 8 (2.40m)', 'S/. 1,200 – 2,000'],
                      ['Ensemble completo de sala', 'S/. 3,500 – 4,200'],
                    ].map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between border-b border-outline-variant pb-2 last:border-0 last:pb-0">
                        <span>{k}</span>
                        <span className="font-semibold text-on-surface">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ===== Footer ===== */}
      <footer className="border-t border-outline-variant/70 bg-surface-dim/40">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            {/* Bloque de marca y descripción */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded bg-primary text-on-primary">
                  <Icono name="chair" size={18} />
                </span>
                <span className="font-headline-md text-headline-sm text-on-surface">Clarisa Mobiliario Artesanal</span>
              </div>
              <p className="mt-3 max-w-sm font-body-sm text-body-sm text-on-surface-variant">
                Taller familiar en Arequipa. Muebles de autor en madera nativa peruana con trazabilidad certificada y diseño contemporáneo.
              </p>
            </div>
            {/* Enlaces de categorías */}
            <div>
              <div className="font-label-md text-label-md uppercase text-on-surface-variant">Categorías</div>
              <ul className="mt-3 space-y-2 font-body-sm text-body-sm text-on-surface-variant">
                <li><a href="#muebles" className="hover:text-secondary">Muebles de Autor</a></li>
                <li><a href="#taller" className="hover:text-secondary">Taller a Medida</a></li>
                <li><a href="#muebles" className="hover:text-secondary">Colección Pachacámac</a></li>
              </ul>
            </div>
            {/* Datos de contacto */}
            <div>
              <div className="font-label-md text-label-md uppercase text-on-surface-variant">Contacto</div>
              <ul className="mt-3 space-y-2 font-body-sm text-body-sm text-on-surface-variant">
                <li className="flex items-center gap-2"><Icono name="location_on" size={16} /> Av. Camaná, Camaná-Arequipa</li>
                <li className="flex items-center gap-2"><Icono name="call" size={16} /> {WhatsAppDisplay}</li>
                <li className="flex items-center gap-2"><Icono name="schedule" size={16} /> Lun – Sáb · 10:00–19:00</li>
                <li>
                  <a href={`https://wa.me/${WhatsAppNumber}?text=${waText}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-secondary hover:underline">
                    <Icono name="chat" size={16} /> Escríbenos por WhatsApp
                  </a>
                </li>
              </ul>
            </div>
          </div>
          {/* Barra inferior del footer con copyright y acceso al panel */}
          <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant/60 pt-6 font-label-sm text-label-sm text-on-surface-variant">
            <span>© 2026 Clarisa Mobiliario Artesanal · Arequipa, Perú</span>
          </div>
        </div>
      </footer>

      {/* ===== Modal quickview: ficha detallada del producto seleccionado ===== */}
      <Modal
        open={!!open}
        onClose={() => setOpenId(null)}
        id="quickview"
        title={open?.name}
        subtitle={open?.materialShort}
        width="max-w-3xl"
        footer={
          open &&
          (() => (
            <div className="flex items-center justify-end gap-3">
              {/* Botón de cotización por WhatsApp del producto abierto */}
              <a
                href={waLink(open.name, `S/. ${open.price.toLocaleString('es-PE')}`)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded bg-[#25d366] px-5 py-2.5 font-label-md text-label-md text-white"
              >
                <Icono name="chat" size={16} /> Cotizar esta pieza
              </a>
            </div>
          ))()
        }
      >
        {open && (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Imagen del producto */}
            <div className="overflow-hidden rounded bg-surface-container-lowest">
              <img src={open.image} alt={open.name} className="aspect-square w-full object-cover" />
            </div>
            {/* Ficha técnica: badge, descripción, dimensiones, madera, precio */}
            <div>
              <Insignia tone={open.availability === 'stock' ? 'green' : 'amber'} label={open.badge} />
              <span className="ml-2 inline-block font-label-sm text-label-sm uppercase text-secondary">{open.categoryLabel}</span>
              <p className="mt-4 font-body-md text-body-md text-on-surface-variant">{open.description}</p>
              {/* Datos técnicos: dimensiones, tipo de madera y disponibilidad */}
              <div className="mt-6 space-y-3 rounded bg-surface-container px-4 py-4">
                {[
                  ['straighten', 'Dimensiones', open.waybill],
                  ['eco', 'Madera', open.materialShort],
                  ['local_shipping', 'Disponibilidad', open.stockNote],
                ].map(([icon, k, v]) => (
                  <div key={k} className="flex items-center gap-3">
                    <Icono name={icon} size={18} className="text-secondary" />
                    <span className="w-32 font-label-sm text-label-sm uppercase text-on-surface-variant">{k}</span>
                    <span className="font-body-sm text-body-sm text-on-surface">{v}</span>
                  </div>
                ))}
              </div>
              {/* Precio y aviso de producto no publicado */}
              <div className="mt-5 flex items-end justify-between">
                <div>
                  <div className="font-label-sm text-label-sm uppercase text-on-surface-variant">Precio</div>
                  <div className="font-headline-lg text-headline-lg text-on-surface">S/. {open.price.toLocaleString('es-PE')}</div>
                </div>
                {open.status === 'Pausado' && <Insignia tone="neutral" label="No disponible" />}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}