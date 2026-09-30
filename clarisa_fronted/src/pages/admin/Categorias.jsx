import { useState } from 'react'
import Icono from '../../components/ui/Icono'
import CabeceraPagina from '../../components/ui/CabeceraPagina'
import Insignia from '../../components/ui/Insignia'
import PanelLateral from '../../components/ui/PanelLateral'
import { categories, catalogStatus } from '../../data/catalogCategories'

/**
 * Página admin de "Categorías y colecciones".
 * Muestra las agrupaciones del catálogo (categorías y colecciones de autor)
 * como tarjetas con imagen, permite activar/pausar cada una, buscar, y abre
 * un Drawer con detalle o un formulario para crear una nueva. Usa datos
 * estáticos de /data/catalogCategories.
 */

export default function Categorias() {
  // Término de búsqueda.
  const [query, setQuery] = useState('')
  // Estado activo/pausado por categoría (todas activas por defecto).
  const [active, setActive] = useState(() => Object.fromEntries(categories.map((c) => [c.id, true])))
  // Categoría seleccionada para abrir el Drawer (o el objeto "nueva").
  const [detail, setDetail] = useState(null)

  // Filtro por nombre o tipo (Categoría/Colección).
  const q = query.trim().toLowerCase()
  const list = categories.filter((c) => !q || c.name.toLowerCase().includes(q) || c.type.toLowerCase().includes(q))

  // Alterna el estado activo/pausado de una categoría.
  const toggle = (id) => setActive((s) => ({ ...s, [id]: !s[id] }))

  // Conteos para los encabezados y resumen inferior.
  const categoriesCount = categories.filter((c) => c.type.includes('Categoría')).length
  const collectionsCount = categories.filter((c) => c.type.includes('Colección')).length

  return (
    <div>
      {/* Encabezado con botón "Nueva categoría" */}
      <CabeceraPagina
        title="Categorías y colecciones"
        subtitle={`${categoriesCount} categorías activas · ${collectionsCount} colecciones de autor`}
        actions={
          <button
            onClick={() => setDetail({ id: 'new', name: 'Nueva categoría', isNew: true })}
            className="flex items-center gap-1.5 rounded bg-primary px-3.5 py-2 font-label-md text-label-md text-on-primary transition-opacity hover:opacity-90"
          >
            <Icono name="add" size={18} /> Nueva categoría
          </button>
        }
      />

      {/* Barra de búsqueda + chips de resumen */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex min-w-56 flex-1 items-center gap-2 rounded border border-outline-variant bg-white px-3 py-2 focus-within:border-secondary">
          <Icono name="search" size={18} className="text-on-surface-variant" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar categoría o colección…"
            className="w-full bg-transparent font-body-md text-body-md outline-none"
          />
        </div>
        {/* Chips informativos: activas, piezas y especies */}
        {[
          ['active', `${active && Object.values(active).filter(Boolean).length} activas`, 'check_circle', 'bg-[#e7f3e8]'],
          ['pieces', `${catalogStatus.pieces} piezas`, 'chair', 'bg-secondary-fixed'],
          ['woods', `${catalogStatus.woods} especies`, 'forest', 'bg-[#fef3c7]'],
        ].map(([k, label, icon, bg]) => (
          <div key={k} className="flex items-center gap-2 rounded bg-surface-container-lowest px-3 py-2 shadow-soft">
            <span className={`flex h-7 w-7 items-center justify-center rounded ${bg}`}>
              <Icono name={icon} size={16} className="!text-on-surface" />
            </span>
            <span className="font-body-sm text-body-sm font-medium text-on-surface">{label}</span>
          </div>
        ))}
      </div>

      {/* ===== Tarjetas de categorías/colecciones ===== */}
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        {list.map((c) => {
          const on = active[c.id] !== false
          return (
            <article
              key={c.id}
              className={`group overflow-hidden rounded bg-surface-container-lowest shadow-wood transition-opacity ${on ? '' : 'opacity-55'}`}
            >
              {/* Imagen de portada con badges de tipo y edición limitada */}
              <div className="relative aspect-[16/9] overflow-hidden">
                <img src={c.image} alt={c.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <span className="absolute top-3 right-3">
                  <Insignia tone={c.accent ? 'dark' : 'brand'} label={c.type} />
                </span>
                {c.limited && (
                  <span className="absolute top-3 left-3">
                    <Insignia tone="amber" label="Edición limitada" />
                  </span>
                )}
              </div>
              <div className="p-5">
                {/* Nombre + URL pública + botón activar/pausar */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface">{c.name}</h3>
                    <p className="mt-0.5 font-label-md text-label-md text-on-surface-variant">/catalogo/{c.slug}</p>
                  </div>
                  <button
                    onClick={() => toggle(c.id)}
                    className={`rounded-full px-3 py-1.5 font-label-sm text-label-sm transition-colors ${on ? 'bg-[#e7f3e8] text-[#2e6930]' : 'bg-surface-variant text-on-surface-variant'}`}
                  >
                    {on ? 'Activa' : 'Pausada'}
                  </button>
                </div>
                {/* Métricas: piezas, maderas y prioridad */}
                <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded bg-surface-container px-2 py-2.5">
                    <div className="font-headline-md text-headline-sm text-on-surface">{c.pieces}</div>
                    <div className="font-label-sm text-label-sm text-on-surface-variant">piezas</div>
                  </div>
                  <div className="rounded bg-surface-container px-2 py-2.5">
                    <div className="font-headline-md text-headline-sm text-on-surface">{c.materials.length}</div>
                    <div className="font-label-sm text-label-sm text-on-surface-variant">maderas</div>
                  </div>
                  <div className="rounded bg-surface-container px-2 py-2.5">
                    <div className="font-headline-md text-headline-sm text-on-surface">#{c.priority}</div>
                    <div className="font-label-sm text-label-sm text-on-surface-variant">prioridad</div>
                  </div>
                </div>
                {/* Chips de maderas permitidas */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {c.materials.map((m) => (
                    <span key={m} className="rounded bg-surface-container-low px-2 py-1 font-label-sm text-label-sm text-on-surface-variant">{m}</span>
                  ))}
                </div>
                {/* Pie inferior: estado + botón Editar */}
                <div className="mt-5 flex items-center justify-between border-t border-surface-variant pt-4">
                  <span className="font-body-sm text-body-sm text-on-surface-variant">{c.status}</span>
                  <button onClick={() => setDetail(c)} className="flex items-center gap-1 font-label-md text-label-md text-secondary hover:underline">
                    Editar <Icono name="chevron_right" size={16} />
                  </button>
                </div>
              </div>
            </article>
          )
        })}
      </div>

      {/* Mensaje cuando no hay resultados de búsqueda */}
      {list.length === 0 && (
        <div className="mt-10 rounded bg-surface-container-lowest py-14 text-center shadow-wood">
          <Icono name="grid_view" size={32} className="mx-auto text-on-surface-variant" />
          <p className="mt-3 font-body-md text-body-md text-on-surface-variant">No hay categorías para «{query}».</p>
        </div>
      )}

      {/* Resumen inferior con totales */}
      <div className="mt-8 grid gap-3 rounded bg-surface-container-lowest p-5 shadow-wood sm:grid-cols-4">
        {[
          [`${categoriesCount}`, 'Categorías activas'],
          [`${collectionsCount}`, 'Colecciones de autor'],
          [`${catalogStatus.pieces}`, 'Piezas publicadas'],
          [`${catalogStatus.woods}`, 'Especies nativas'],
        ].map(([v, l]) => (
          <div key={l} className="text-center">
            <div className="font-headline-md text-headline-md text-on-surface">{v}</div>
            <div className="mt-0.5 font-label-sm text-label-sm text-on-surface-variant">{l}</div>
          </div>
        ))}
      </div>

      {/* ===== Drawer: detalle de categoría o nueva categoría ===== */}
      <PanelLateral
        open={!!detail}
        onClose={() => setDetail(null)}
        id="category-detail"
        title={detail?.isNew ? 'Nueva categoría' : detail?.name}
        subtitle={detail?.isNew ? 'Registra una nueva agrupación' : `/${detail?.slug}`}
        footer={
          <button
            onClick={() => setDetail(null)}
            className="flex w-full justify-center rounded bg-primary py-2.5 font-label-md text-label-md text-on-primary"
          >
            {detail?.isNew ? 'Crear categoría' : 'Guardar cambios'}
          </button>
        }
      >
        {/* Vista de detalle de una categoría existente */}
        {detail && !detail.isNew && (
          <div className="space-y-4">
            {[
              ['straighten', 'Tipo de estructura', detail.type],
              ['grid_view', 'Prioridad en menú', `#${detail.priority}`],
              ['chair', 'Piezas asociadas', `${detail.pieces} piezas`],
              ['forest', 'Maderas permitidas', detail.materials.join(', ')],
              ['link', 'URL pública', `/catalogo/${detail.slug}`],
            ].map(([icon, k, v]) => (
              <div key={k} className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded bg-surface-container">
                  <Icono name={icon} size={18} className="text-secondary" />
                </span>
                <div>
                  <div className="font-label-sm text-label-sm uppercase text-on-surface-variant">{k}</div>
                  <div className="font-body-md text-body-md text-on-surface">{v}</div>
                </div>
              </div>
            ))}
            <div className="rounded bg-surface-container p-3">
              <div className="font-label-sm text-label-sm uppercase text-on-surface-variant">Visible en</div>
              <div className="mt-1 font-body-md text-body-md text-on-surface">{detail.status}</div>
            </div>
          </div>
        )}
        {/* Formulario simple para crear una categoría nueva */}
        {detail?.isNew && (
          <div className="space-y-4">
            {[
              ['Nombre de la categoría', 'text', 'Ej. Salas de Estar & Asientos'],
              ['Slug', 'text', 'ej: salas-de-estar'],
              ['Prioridad en menú', 'number', '1–9'],
            ].map(([lbl, type, ph]) => (
              <label key={lbl} className="block">
                <span className="font-label-md text-label-md uppercase text-on-surface-variant">{lbl}</span>
                <input type={type} placeholder={ph} className="mt-1 w-full rounded border border-outline-variant bg-white px-3 py-2 font-body-md text-body-md outline-none focus:border-secondary" />
              </label>
            ))}
          </div>
        )}
      </PanelLateral>
    </div>
  )
}