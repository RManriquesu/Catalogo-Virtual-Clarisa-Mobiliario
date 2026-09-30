import { NavLink, Outlet, useNavigate, Link, Navigate } from 'react-router-dom'
import Icono from '../ui/Icono'
import { useAuth } from '../../store/AuthContext'
import { useStore } from '../../store/StoreContext'

/**
 * Layout del panel de administración.
 * Incluye la barra lateral (sidebar) con la navegación del admin, un indicador
 * de conexión a la API/PostgreSQL, el usuario en sesión con botón de logout,
 * y el header superior con accesos a la tienda pública. Protege la sección
 * admin: si no hay gerente autenticado redirige a /admin/login.
 */

// Entradas del menú lateral: ruta, etiqueta, ícono y (opcional) un chip con notificación.
const nav = [
  { to: '/admin/productos', label: 'Productos y Stock', icon: 'chair' },
  { to: '/admin/categorias', label: 'Categorías y Colecciones', icon: 'grid_view' },
  { to: '/admin/pedidos', label: 'Pedidos WhatsApp', icon: 'orders', chip: 'pedidos' },
]

export default function LayoutAdmin() {
  // Sesión del gerente y acción de logout desde el AuthContext.
  const { manager, logout, demo } = useAuth()
  // Modo de conexión del StoreContext ('api' = conectado a backend real).
  const { connection, orders } = useStore()

  // Cantidad de pedidos abiertos para el chip de notificación del menú.
  const openOrders = orders.filter((o) => o.status !== 'entregado').length

  // Si no hay gerente autenticado, redirige a la pantalla de login.
  if (!manager) {
    return <Navigate to="/admin/login" replace />
  }

  // "En línea" cuando la conexión es vía API real y no en modo demo.
  const online = connection === 'api' && !demo

  return (
    <div className="flex min-h-screen bg-background text-on-surface">
      {/* ===== Barra lateral (sidebar) ===== */}
      <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col bg-primary text-on-primary">
        {/* Logo / marca */}
        <Link to="/admin/productos" className="flex items-center gap-3 px-5 py-5">
          <span className="flex h-9 w-9 items-center justify-center rounded bg-on-primary text-primary">
            <Icono name="chair" size={20} />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-headline-md text-headline-sm">Clarisa</span>
            <span className="font-label-sm text-label-sm text-on-primary-container">Panel de Gestión</span>
          </span>
        </Link>

        {/* Menú de navegación del panel */}
        <nav className="flex-1 space-y-1 px-3 py-2">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded px-3 py-2.5 font-body-md text-body-md transition-colors ${
                  isActive ? 'bg-on-primary/15 font-semibold' : 'text-on-primary-container hover:bg-on-primary/10'
                }`
              }
            >
              <Icono name={item.icon} size={20} />
              <span className="flex-1">{item.label}</span>
              {/* Chip con el conteo real de pedidos abiertos (oculto si es 0) */}
              {item.chip === 'pedidos' && openOrders > 0 && (
                <span className="rounded bg-secondary-container px-1.5 py-0.5 font-label-sm text-label-sm text-on-secondary-container">
                  {openOrders}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Indicador de conexión con la base de datos */}
        <div className="mx-3 mb-3 rounded bg-on-primary/10 p-3">
          <div className="flex items-start gap-2">
            <Icono name={online ? 'verified_user' : 'cloud_off'} size={18} className={online ? 'text-secondary-fixed-dim' : 'text-[#f3b840]'} />
            <div>
              <div className={`font-body-sm text-body-sm font-semibold ${online ? 'text-on-primary' : 'text-[#f3b840]'}`}>
                {online ? 'PostgreSQL conectado' : 'Modo offline · respaldo local'}
              </div>
              <div className={`font-label-sm text-label-sm ${online ? 'text-secondary-fixed-dim' : 'text-on-primary/60'}`}>
                {online ? 'API Clarisa · En línea' : 'Sin conexión con la API'}
              </div>
            </div>
          </div>
        </div>

        {/* Usuario en sesión + botón cerrar sesión */}
        <div className="border-t border-on-primary/15 p-3">
          <div className="flex items-center gap-3 px-2 py-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary-container font-label-md text-label-md text-on-secondary-container">
              {manager.initials || manager.name?.[0]}
            </span>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="truncate font-body-sm text-body-sm font-semibold">{manager.name}</div>
              <div className="truncate font-label-sm text-label-sm text-on-primary-container">{manager.role}</div>
            </div>
            {/* Cierre de sesión */}
            <button
              onClick={logout}
              className="rounded-full p-1.5 text-on-primary-container transition-colors hover:bg-on-primary/10"
              title="Cerrar sesión"
            >
              <Icono name="logout" size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* ===== Área principal: header + contenido ===== */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header superior con breadcrumb y accesos */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-surface-variant bg-surface-container-lowest px-6">
          <div className="flex items-center gap-2 font-label-md text-label-md text-on-surface-variant">
            {/* Breadcrumb: Tienda Pública → Gestión Clarisa */}
            <Link to="/" className="flex items-center gap-1 transition-colors hover:text-on-surface">
              <Icono name="home" size={16} /> Tienda Pública
            </Link>
            <Icono name="chevron_right" size={16} />
            <span className="text-on-surface">Gestión Clarisa</span>
          </div>
          <div className="flex items-center gap-3">
            {/* Badge de estado del sistema */}
            <span className="hidden items-center gap-1.5 rounded bg-[#e7f3e8] px-2.5 py-1 font-label-sm text-label-sm text-[#2e6930] sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2e6930]" />
              Sistema operativo
            </span>
            {/* Enlace para ver la tienda pública */}
            <Link
              to="/"
              className="flex items-center gap-1.5 rounded px-2.5 py-1.5 font-label-md text-label-md text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
            >
              <Icono name="remove_red_eye" size={18} /> Ver tienda
            </Link>
          </div>
        </header>
        {/* Contenido de la ruta anidada */}
        <main className="flex-1 px-6 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}