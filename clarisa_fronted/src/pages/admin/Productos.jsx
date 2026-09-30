import { useMemo, useRef, useState } from 'react'
import Icono from '../../components/ui/Icono'
import CabeceraPagina from '../../components/ui/CabeceraPagina'
import Insignia from '../../components/ui/Insignia'
import Modal from '../../components/ui/Modal'
import { api } from '../../api/client'
import { useStore } from '../../store/StoreContext'
import { useAuth } from '../../store/AuthContext'

/**
 * Página admin de "Productos y stock".
 * Lista el catálogo con filtros (búsqueda, categoría, estado), KPIs de stock,
 * y permite crear, editar, cambiar estado y eliminar productos.
 * Los datos se comparten via StoreContext (localStorage / API según el contexto).
 */

// Formatea un número como moneda peruana (S/.).
const money = (n) => `S/. ${Number(n || 0).toLocaleString('es-PE')}`

// Formulario vacío usado al crear un producto nuevo.
const emptyForm = {
  sku: '', name: '', category: 'salas', categoryLabel: 'Salas', material: '', materialShort: '',
  price: '', cost: '', availability: 'stock', badge: 'En Stock', stockNote: '', days: 0,
  waybill: '', status: 'Publicado', image: '', description: '',
  warehouses: { miraflores: 0, ves: 0, central: 0 },
}

export default function Productos() {
  // Acciones y datos expuestos por el StoreContext.
  const { products, saveProduct, deleteProduct, setProductStatus, connection } = useStore()
  // Token de sesión para subir la imagen contra la API.
  const { token } = useAuth()
  // Input de archivo oculto que abre el gestor de archivos del sistema.
  const fileInputRef = useRef(null)
  // Flag que indica si se está subiendo la imagen seleccionada.
  const [uploading, setUploading] = useState(false)

  // Estado del buscador y de los filtros (categoría y estado).
  const [query, setQuery] = useState('')
  const [catFilter, setCatFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  // Qué producto se está editando ('new' = creando), o null si ninguno.
  const [editing, setEditing] = useState(null)
  // Producto marcado para eliminar (abre el modal de confirmación).
  const [deleting, setDeleting] = useState(null)
  // Estado actual del formulario del modal.
  const [form, setForm] = useState(emptyForm)
  // Flag de guardado (spinner en el botón).
  const [saving, setSaving] = useState(false)

  // Lista de categorías disponibles ("all" + las únicas de los productos).
  const categories = ['all', ...Array.from(new Set(products.map((p) => p.categoryLabel)))]

  // Productos filtrados según buscador, categoría y estado (memorizado).
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products.filter((p) => {
      const matchQ = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.material.toLowerCase().includes(q)
      const matchC = catFilter === 'all' || p.categoryLabel === catFilter
      const matchS = statusFilter === 'all' || p.status === statusFilter
      return matchQ && matchC && matchS
    })
  }, [products, query, catFilter, statusFilter])

  // Métricas para los KPIs superiores.
  const totalStock = products.reduce((acc, p) => acc + p.warehouses.miraflores + p.warehouses.ves + p.warehouses.central, 0)
  const inStock = products.filter((p) => p.availability === 'stock').length
  const custom = products.filter((p) => p.availability === 'custom').length

  // Abre el modal en modo "crear" con el formulario vacío.
  const openNew = () => { setForm(emptyForm); setEditing('new') }
  // Abre el modal en modo "editar" prellenando el formulario (precio/costo a texto).
  const openEdit = (p) => { setForm({ ...p, price: String(p.price), cost: String(p.cost) }); setEditing(p.id) }

  /** Guarda el producto (simula una espera de 600 ms) y cierra el modal. */
  const submit = () => {
    setSaving(true)
    setTimeout(() => {
      const price = parseInt(form.price || '0', 10)
      const cost = parseInt(form.cost || '0', 10)
      const data = { ...form, price, cost, days: Number(form.days || 0) }
      if (editing === 'new') data.id = null // id null → el store genera uno nuevo.
      saveProduct(data)
      setSaving(false)
      setEditing(null)
    }, 600)
  }

  // Clases reutilizables de los campos del formulario.
  const input = 'mt-1 w-full rounded border border-outline-variant bg-white px-3 py-2 font-body-md text-body-md outline-none focus:border-secondary'
  const labelCls = 'font-label-sm text-label-sm uppercase text-on-surface-variant'

  /**
   * Maneja la imagen elegida desde el gestor de archivos:
   * 1. Muestra el preview al instante (base64 local).
   * 2. Si la API responde, la sube al servidor y usa su URL pública.
   * Si la subida falla o no hay conexión, se conserva el base64 (modo offline).
   */
  const onPickImage = async (e) => {
    const file = e.target.files?.[0]
    // Permite volver a elegir el mismo archivo en el siguiente clic.
    e.target.value = ''
    if (!file || !file.type.startsWith('image/')) return

    // Convierte a data URL base64 para preview y para que persista correctamente en localStorage.
    const dataUrl = await new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.readAsDataURL(file)
    })

    if (connection === 'api' && token) {
      // Muestra el preview local de inmediato mientras la API responde.
      setForm({ ...form, image: dataUrl })
      setUploading(true)
      try {
        const res = await api.products.uploadImage(file, token)
        // La API devolvió la URL del servidor → se usa en lugar del base64.
        setForm((f) => ({ ...f, image: res.url }))
      } catch {
        // La API rechazó o no respondió → se conserva el data URL local.
      } finally {
        setUploading(false)
      }
    } else {
      // Modo offline/local: se usa directamente el data URL base64.
      setForm({ ...form, image: dataUrl })
    }
  }

  return (
    <div>
      {/* Encabezado con botón "Nuevo producto" */}
      <CabeceraPagina
        title="Productos y stock"
        subtitle={`${products.length} piezas de autor · ${totalStock} unidades en almacenes`}
        actions={
          <button onClick={openNew} className="flex items-center gap-1.5 rounded bg-primary px-3.5 py-2 font-label-md text-label-md text-on-primary transition-opacity hover:opacity-90">
            <Icono name="add" size={18} /> Nuevo producto
          </button>
        }
      />

      {/* ===== KPIs de inventario ===== */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Productos en catálogo', products.length, 'chart', 'bg-secondary-fixed'],
          ['Unidades en stock', totalStock, 'inventory_2', 'bg-[#e7f3e8]'],
          ['Entrega inmediata', inStock, 'bolt', 'bg-[#fef3c7]'],
          ['Fabricación a pedido', custom, 'handyman', 'bg-[#ede9fe]'],
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

      {/* ===== Tabla del catálogo ===== */}
      <div className="mt-6 overflow-hidden rounded bg-surface-container-lowest shadow-wood">
        {/* Barra de filtros */}
        <div className="flex flex-wrap items-center gap-3 border-b border-surface-variant p-4">
          {/* Buscador por nombre, código o madera */}
          <div className="flex min-w-56 flex-1 items-center gap-2 rounded border border-outline-variant bg-white px-3 py-2 focus-within:border-secondary">
            <Icono name="search" size={18} className="text-on-surface-variant" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre, código, madera…"
              className="w-full bg-transparent font-body-md text-body-md outline-none"
            />
          </div>
          {/* Selector de categoría */}
          <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="h-9 rounded border border-outline-variant bg-white px-2 font-body-sm text-body-sm outline-none">
            {categories.map((c) => (
              <option key={c} value={c}>{c === 'all' ? 'Todas las categorías' : c}</option>
            ))}
          </select>
          {/* Selector de estado (publicado/pausado) */}
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 rounded border border-outline-variant bg-white px-2 font-body-sm text-body-sm outline-none">
            <option value="all">Publicados y pausados</option>
            <option value="Publicado">Publicados</option>
            <option value="Pausado">Pausados</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead>
              <tr className="border-b border-surface-variant font-label-sm text-label-sm uppercase text-on-surface-variant">
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3 text-right">Costo</th>
                <th className="px-4 py-3 text-right">Precio venta</th>
                <th className="px-4 py-3 text-center">Stock</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/60">
              {filtered.map((p) => {
                // Stock total sumando los tres almacenes.
                const stock = p.warehouses.miraflores + p.warehouses.ves + p.warehouses.central
                return (
                  <tr key={p.id} className="transition-colors hover:bg-surface-container-low/50">
                    <td className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant">{p.sku}</td>
                    {/* Nombre con imagen de miniatura */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.image} alt="" className="h-11 w-11 rounded bg-surface-variant object-cover" />
                        <div>
                          <div className="font-body-md text-body-md font-medium text-on-surface">{p.name}</div>
                          <div className="font-label-sm text-label-sm text-on-surface-variant">{p.materialShort}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-body-sm text-body-sm text-on-surface-variant">{p.categoryLabel}</td>
                    <td className="px-4 py-3 text-right font-body-sm text-body-sm text-on-surface-variant">{money(p.cost)}</td>
                    <td className="px-4 py-3 text-right font-price-md text-price-md text-on-surface">{money(p.price)}</td>
                    {/* Stock total / indicador "A pedido" */}
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex flex-col items-center leading-tight">
                        <span className="font-body-md text-body-md font-semibold text-on-surface">{stock}</span>
                        {p.availability === 'custom' && <span className="font-label-sm text-label-sm text-[#92400e]">A pedido</span>}
                      </span>
                    </td>
                    {/* Botón que alterna estado Publicado/Pausado */}
                    <td className="px-4 py-3">
                      <button onClick={() => setProductStatus(p.id, p.status !== 'Publicado')} title="Cambiar estado">
                        <Insignia tone={p.status === 'Publicado' ? 'green' : 'neutral'} dot label={p.status === 'Publicado' ? 'Activo' : 'Pausado'} />
                      </button>
                    </td>
                    {/* Acciones: editar y eliminar */}
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openEdit(p)} className="rounded p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface" aria-label="Editar">
                          <Icono name="edit" size={18} />
                        </button>
                        <button onClick={() => setDeleting(p)} className="rounded p-1.5 text-on-surface-variant transition-colors hover:bg-[#ffdad6] hover:text-[#93000a]" aria-label="Eliminar">
                          <Icono name="delete" size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {/* Mensaje cuando no hay resultados */}
          {filtered.length === 0 && (
            <div className="py-14 text-center">
              <Icono name="search_off" size={28} className="mx-auto text-on-surface-variant" />
              <p className="mt-2 font-body-md text-body-md text-on-surface-variant">Sin productos para estos filtros.</p>
            </div>
          )}
        </div>
        {/* Contador de resultados */}
        <div className="border-t border-surface-variant px-4 py-3 font-label-sm text-label-sm text-on-surface-variant">
          {filtered.length} de {products.length} productos
        </div>
      </div>

      {/* ===== Modal de crear/editar producto ===== */}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        id="product-form"
        title={editing === 'new' ? 'Nuevo producto' : 'Editar producto'}
        subtitle={editing === 'new' ? `${products.length + 1}º pieza del catálogo` : form.sku}
        footer={
          <div className="flex items-center justify-end gap-3">
            <button onClick={() => setEditing(null)} className="rounded px-4 py-2.5 font-label-md text-label-md text-on-surface-variant hover:bg-surface-container">
              Cancelar
            </button>
            <button
              onClick={submit}
              disabled={saving || !form.name.trim() || !form.price}
              className="flex items-center gap-2 rounded bg-primary px-5 py-2.5 font-label-md text-label-md text-on-primary disabled:opacity-50"
            >
              {saving ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-on-primary border-t-transparent" /> : <Icono name="save" size={18} />}
              {saving ? 'Guardando…' : 'Guardar producto'}
            </button>
          </div>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Nombre y SKU */}
          <label className="block">
            <span className={labelCls}>Nombre</span>
            <input className={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej. Sofá Modular Pachacámac" />
          </label>
          <label className="block">
            <span className={labelCls}>Código SKU</span>
            <input className={input} value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="CLR-SOF-01" />
          </label>
          {/* Categoría (deriva el slug `category` al guardar) */}
          <label className="block">
            <span className={labelCls}>Categoría</span>
            <select className={input} value={form.categoryLabel} onChange={(e) => setForm({ ...form, categoryLabel: e.target.value, category: e.target.value.toLowerCase().split(' ')[0] })}>
              {['Salas', 'Comedores', 'Dormitorios', 'Mesas de Centro', 'Sillones', 'Salas & Estudio'].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          {/* Madera (rellena ambos campos, corto y completo) */}
          <label className="block">
            <span className={labelCls}>Madera</span>
            <input className={input} value={form.materialShort} onChange={(e) => setForm({ ...form, materialShort: e.target.value, material: e.target.value })} placeholder="Ej. Roble & Lino Natural" />
          </label>
          {/* Precio de venta y costo */}
          <label className="block">
            <span className={labelCls}>Precio venta (S/.)</span>
            <input type="number" className={input} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="4250" />
          </label>
          <label className="block">
            <span className={labelCls}>Costo (S/.)</span>
            <input type="number" className={input} value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} placeholder="2380" />
          </label>
          {/* Selector de disponibilidad: stock inmediato vs a pedido */}
          <label className="block sm:col-span-2">
            <span className={labelCls}>Disponibilidad</span>
            <div className="mt-1 grid gap-2 sm:grid-cols-2">
              {[
                ['stock', 'Stock inmediato', 'Entrega rápida desde almacén'],
                ['custom', 'A pedido', 'Fabricación en taller (12–25 días)'],
              ].map(([k, t, d]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setForm({ ...form, availability: k, badge: k === 'stock' ? 'En Stock' : 'A Pedido (15 días)' })}
                  className={`flex flex-col items-start gap-0.5 rounded border p-3 text-left transition-colors ${form.availability === k ? 'border-secondary bg-secondary-fixed/60' : 'border-outline-variant hover:border-outline'}`}
                >
                  <span className="font-body-sm text-body-sm font-semibold text-on-surface">{t}</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">{d}</span>
                </button>
              ))}
            </div>
          </label>
          {/* Campos extra si es stock: unidades por almacén */}
          {form.availability === 'stock' && (
            <label className="block sm:col-span-2">
              <span className={labelCls}>Stock por almacén</span>
              <div className="mt-1 grid grid-cols-3 gap-2">
                {[
                  ['miraflores', 'Showroom'],
                  ['ves', 'Taller VES'],
                  ['central', 'Central'],
                ].map(([key, l]) => (
                  <div key={key} className="rounded border border-outline-variant p-3">
                    <div className="font-label-sm text-label-sm uppercase text-on-surface-variant">{l}</div>
                    <input
                      type="number" min="0"
                      className="mt-1 w-full bg-transparent font-price-md text-price-md outline-none"
                      value={form.warehouses[key]}
                      onChange={(e) => setForm({ ...form, warehouses: { ...form.warehouses, [key]: Number(e.target.value || 0) } })}
                    />
                  </div>
                ))}
              </div>
            </label>
          )}
          {/* Campos extra si es a pedido: días de fabricación */}
          {form.availability === 'custom' && (
            <label className="block">
              <span className={labelCls}>Días de fabricación</span>
              <input type="number" className={input} value={form.days} onChange={(e) => setForm({ ...form, days: e.target.value })} />
            </label>
          )}
          {/* Imagen del producto: preview + selección desde el gestor de archivos */}
          <label className="block sm:col-span-2">
            <span className={labelCls}>Imagen del producto</span>
            <div className="mt-1 flex items-center gap-4">
              {/* Miniatura con la imagen actual (o placeholder si no hay) */}
              {form.image ? (
                <img src={form.image} alt="" className="h-24 w-32 rounded border border-outline-variant bg-surface-variant object-cover" />
              ) : (
                <div className="flex h-24 w-32 items-center justify-center rounded border border-dashed border-outline-variant bg-surface-container-low text-on-surface-variant">
                  <Icono name="image" size={28} />
                </div>
              )}
              {/* Acciones para subir o quitar la imagen */}
              <div className="flex flex-col items-start gap-1.5">
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={onPickImage} />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-1.5 rounded border border-outline-variant bg-white px-3 py-2 font-label-md text-label-md text-on-surface transition-colors hover:border-secondary disabled:opacity-50"
                >
                  {uploading
                    ? <span className="flex items-center gap-1.5"><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-on-surface border-t-transparent" /> Subiendo…</span>
                    : <><Icono name="upload" size={16} /> {form.image ? 'Cambiar imagen' : 'Subir imagen'}</>}
                </button>
                {form.image && (
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, image: '' })}
                    className="flex items-center gap-1.5 rounded px-2 py-1 font-label-sm text-label-sm text-[#93000a] transition-colors hover:bg-[#ffdad6]"
                  >
                    <Icono name="close" size={14} /> Quitar imagen
                  </button>
                )}
              </div>
            </div>
          </label>
          <label className="block sm:col-span-2">
            <span className={labelCls}>Descripción breve</span>
            <textarea rows="2" className={input} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </label>
        </div>
      </Modal>

      {/* ===== Modal de confirmación de eliminación ===== */}
      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        id="delete-product"
        title="Eliminar producto"
        width="max-w-sm"
        footer={
          <div className="flex justify-end gap-3">
            <button onClick={() => setDeleting(null)} className="rounded px-4 py-2 font-label-md text-label-md text-on-surface-variant hover:bg-surface-container">
              Cancelar
            </button>
            <button
              onClick={() => { deleteProduct(deleting.id); setDeleting(null) }}
              className="rounded bg-error px-4 py-2 font-label-md text-label-md text-on-error"
            >
              Eliminar definitivamente
            </button>
          </div>
        }
      >
        <p className="font-body-md text-body-md text-on-surface-variant">
          ¿Eliminar <span className="font-semibold text-on-surface">{deleting?.name}</span>? Esta acción quita la pieza del catálogo público y de los tableados internos.
        </p>
      </Modal>
    </div>
  )
}