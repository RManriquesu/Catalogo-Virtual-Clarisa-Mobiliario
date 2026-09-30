import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import TiendaPublica from './pages/TiendaPublica'
import LayoutAdmin from './components/layout/LayoutAdmin'
import LoginAdmin from './pages/LoginAdmin'
import Productos from './pages/admin/Productos'
import Categorias from './pages/admin/Categorias'
import Pedidos from './pages/admin/Pedidos'
import { StoreProvider } from './store/StoreContext'
import { AuthProvider, useAuth } from './store/AuthContext'

/**
 * Componente guardia para el panel de administración.
 * Si el usuario está autenticado renderiza el layout del admin;
 * si no, redirige a la pantalla de login (/admin/login).
 */
function ProtectedAdmin() {
  const { isAuthed } = useAuth()
  return isAuthed ? <LayoutAdmin /> : <Navigate to="/admin/login" replace />
}

/**
 * Componente raíz de la aplicación.
 * Configura el enrutador (BrowserRouter) y los proveedores de contexto:
 * AuthProvider (sesión del admin) y StoreProvider (datos globales de la tienda).
 */
export default function App() {
  return (
    <BrowserRouter>
      {/* Autenticación disponible para toda la app */}
      <AuthProvider>
        {/* Datos globales: productos, pedidos, categorías, maderas, equipo */}
        <StoreProvider>
          <Routes>
            {/* Ruta pública: tienda en línea */}
            <Route path="/" element={<TiendaPublica />} />

            {/* Ruta pública: login del panel de administración */}
            <Route path="/admin/login" element={<LoginAdmin />} />

            {/* Ruta protegida: panel admin (requiere sesión iniciada) */}
            <Route path="/admin" element={<ProtectedAdmin />}>
              {/* La raíz /admin redirige a la gestión de productos */}
              <Route index element={<Navigate to="/admin/productos" replace />} />
              <Route path="productos" element={<Productos />} />
              <Route path="categorias" element={<Categorias />} />
              <Route path="pedidos" element={<Pedidos />} />
            </Route>

            {/* Cualquier ruta desconocida vuelve a la tienda */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </StoreProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}