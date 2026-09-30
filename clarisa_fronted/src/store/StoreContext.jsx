import { createContext, useCallback, useContext, useEffect, useReducer, useRef } from 'react'
import {
  api,
  normalizeProduct,
  normalizeOrder,
  normalizeCategory,
  normalizeStaff,
  normalizeWoodLot,
  toBackendProduct,
  toBackendOrder,
} from '../api/client'
import { useAuth } from './AuthContext'
import { products as seedProducts } from '../data/products'
import { categories as seedCategories } from '../data/catalogCategories'
import { orders as seedOrders } from '../data/orders'
import { staff as seedStaff } from '../data/staff'
import { woodLots as seedWoodLots } from '../data/woods'

// Contexto global de datos de la tienda (productos, pedidos, categorías, etc.).
const StoreContext = createContext(null)

// Clave de localStorage donde se persiste la base de datos local del frontend.
// Se incrementa la versión para invalidar estados antiguos con pedidos demo.
const DB_KEY = 'clarisa_db_v2'

// Estado inicial: se alimenta con los datos de demostración (modo offline).
const initialState = {
  products: seedProducts,
  categories: seedCategories,
  orders: seedOrders,
  staff: seedStaff,
  woodLots: seedWoodLots,
  loading: false,
  syncing: false,
  connection: 'local',
  lastSync: null,
  settings: null,
}

/**
 * Carga la base de datos local desde localStorage.
 * Si no hay datos guardados, usa el estado inicial (datos demo).
 */
function loadDb() {
  try {
    const raw = localStorage.getItem(DB_KEY)
    if (!raw) return initialState
    const parsed = JSON.parse(raw)
    // Al reiniciar la app siempre arranca en modo local hasta sincronizar.
    return { ...initialState, ...parsed, connection: 'local', syncing: false }
  } catch {
    return initialState
  }
}

/**
 * Reducer de estado global.
 * Procesa las acciones que modifican productos, pedidos, categorías, maderas,
 * equipo y los flags de sincronización/conexión.
 */
function reducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.value }
    case 'SET_SYNCING':
      return { ...state, syncing: action.value }
    case 'SET_CONNECTION':
      return {
        ...state,
        connection: action.value,
        lastSync: action.value === 'api' ? Date.now() : state.lastSync,
      }
    case 'SET_SYNCED':
      return { ...state, lastSync: Date.now() }
    // Reemplaza la lista completa de productos por la del backend.
    case 'REPLACE_PRODUCTS':
      return { ...state, products: action.products }
    // Reemplaza las categorías por las del backend.
    case 'REPLACE_CATEGORIES':
      return { ...state, categories: action.categories }
    // Reemplaza pedidos, maderas y equipo (datos protegidos del admin).
    case 'REPLACE_ADMIN':
      return {
        ...state,
        orders: action.orders,
        woodLots: action.woodLots,
        staff: action.staff,
      }
    // Inserta un producto nuevo o actualiza uno existente (por id).
    case 'UPSERT_PRODUCT': {
      const exists = state.products.some((p) => p.id === action.product.id)
      return {
        ...state,
        products: exists
          ? state.products.map((p) => (p.id === action.product.id ? { ...p, ...action.product } : p))
          : [
              {
                ...action.product,
                id: Math.max(0, ...state.products.map((p) => p.id)) + 1,
              },
              ...state.products,
            ],
      }
    }
    // Elimina un producto por su id.
    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter((p) => p.id !== action.id),
      }
    // Cambia el estado de publicación de un producto (Publicado/Pausado).
    case 'SET_PRODUCT_STATUS': {
      const status = action.published ? 'Publicado' : 'Pausado'
      return {
        ...state,
        products: state.products.map((p) => (p.id === action.id ? { ...p, status } : p)),
      }
    }
    // Agrega un nuevo pedido con número correlativo (CLR-1049, CLR-1050, ...).
    case 'ADD_ORDER': {
      const numbers = state.orders.map((o) => {
        const m = String(o.id || '').match(/CLR-(\d+)/)
        return m ? Number(m[1]) : 1048
      })
      const oid = (numbers.length ? Math.max(...numbers) : 1048) + 1
      return {
        ...state,
        orders: [{ ...action.order, id: `CLR-${oid}` }, ...state.orders],
      }
    }
    case 'UPDATE_ORDER': {
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.id === action.order.id || (action.order.apiId && o.apiId === action.order.apiId)
            ? { ...o, ...action.order }
            : o
        ),
      }
    }
    case 'DELETE_ORDER':
      return {
        ...state,
        orders: state.orders.filter((o) => o.id !== action.id),
      }
    // Guarda la configuración del sistema.
    case 'SAVE_SETTINGS':
      return { ...state, settings: action.settings }
    default:
      return state
  }
}

/**
 * Proveedor del estado global de datos.
 * Persiste cada cambio en localStorage y sincroniza con el backend cuando
 * la API está disponible y hay un token válido.
 */
export function StoreProvider({ children }) {
  const { token } = useAuth()
  const [state, dispatch] = useReducer(reducer, undefined, loadDb)

  // Ref del token para usarlo dentro de callbacks sin causar re-ejecuciones.
  const tokenRef = useRef(token)
  useEffect(() => {
    tokenRef.current = token
  }, [token])

  // Persiste el estado completo en localStorage en cada cambio.
  useEffect(() => {
    localStorage.setItem(DB_KEY, JSON.stringify(state))
  }, [state])

  /**
   * Sincroniza los datos con el backend:
   * - productos y categorías son públicos; si responden → connection = 'api'.
   * - si hay token, también trae pedidos, maderas y equipo (protegidos).
   * Si la API no responde, los datos locales (demo) siguen activos.
   */
  const sync = useCallback(async () => {
    dispatch({ type: 'SET_SYNCING', value: true })
    let reachable = false

    // Productos públicos: si la API responde, se reemplazan los locales.
    try {
      const products = await api.products.list()
      dispatch({
        type: 'REPLACE_PRODUCTS',
        products: products.map(normalizeProduct),
      })
      reachable = true
    } catch {
      // sin respuesta de la API → seguimos con datos locales
    }

    // Categorías públicas (sincronización opcional, no bloquea la conexión).
    try {
      const categories = await api.categories.list()
      dispatch({
        type: 'REPLACE_CATEGORIES',
        categories: categories.map(normalizeCategory),
      })
      reachable = true
    } catch {
      // opcional, no bloquea el estado de conexión
    }

    // Si al menos productos respondieron, marcamos la conexión como 'api'.
    if (reachable) dispatch({ type: 'SET_CONNECTION', value: 'api' })

    // Con API disponible Y token válido, se trae el resto de datos del admin.
    const currentToken = tokenRef.current
    if (reachable && currentToken) {
      try {
        const [orders, woodLots, staff] = await Promise.all([
          api.orders.list(currentToken),
          api.woodLots.list(currentToken),
          api.staff.list(currentToken),
        ])
        dispatch({
          type: 'REPLACE_ADMIN',
          orders: orders.map(normalizeOrder),
          woodLots: woodLots.map(normalizeWoodLot),
          staff: staff.map(normalizeStaff),
        })
        dispatch({ type: 'SET_SYNCED' })
      } catch {
        // token inválido o endpoooints protegidos inaccesibles
      }
    }

    dispatch({ type: 'SET_SYNCING', value: false })
  }, [])

  // Ejecuta la sincronización automáticamente al montar y al cambiar el token.
  useEffect(() => {
    sync()
  }, [sync, token])

  /**
   * Guarda (crea o actualiza) un producto.
   * Aplica el cambio localmente y, si hay conexión API + token, lo empuja
   * al backend y re-sincroniza.
   */
  const saveProduct = useCallback(
    (product) => {
      dispatch({ type: 'UPSERT_PRODUCT', product })
      const currentToken = tokenRef.current
      if (state.connection !== 'api' || !currentToken) return
      const payload = toBackendProduct(product)
      const push = payload.id ? api.products.update(payload, currentToken) : api.products.create(payload, currentToken)
      push.then(() => sync()).catch(() => {})
    },
    [sync, state.connection]
  )

  /** Elimina un producto localmente y (si hay conexión) también en el backend. */
  const deleteProduct = useCallback(
    (id) => {
      dispatch({ type: 'DELETE_PRODUCT', id })
      const currentToken = tokenRef.current
      if (state.connection !== 'api' || !currentToken) return
      api.products
        .remove(id, currentToken)
        .then(() => sync())
        .catch(() => {})
    },
    [sync, state.connection]
  )

  /** Cambia el estado Publicado/Pausado de un producto (local y backend). */
  const setProductStatus = useCallback(
    (id, published) => {
      const status = published ? 'Publicado' : 'Pausado'
      dispatch({ type: 'SET_PRODUCT_STATUS', id, published })
      const currentToken = tokenRef.current
      if (state.connection !== 'api' || !currentToken) return
      api.products.setStatus(id, status, currentToken).catch(() => {})
    },
    [state.connection]
  )

  /** Agrega un pedido nuevo (local y, si hay conexión, al backend). */
  const addOrder = useCallback(
    (order) => {
      dispatch({ type: 'ADD_ORDER', order })
      const currentToken = tokenRef.current
      if (state.connection !== 'api' || !currentToken) return
      api.orders
        .create(toBackendOrder(order), currentToken)
        .then((saved) => {
          if (saved) {
            dispatch({
              type: 'UPDATE_ORDER',
              order: {
                id: order.id || saved.orderNumber || `CLR-${saved.id}`,
                apiId: saved.id,
                ...normalizeOrder(saved),
              },
            })
          }
          sync()
        })
        .catch(() => {})
    },
    [sync, state.connection]
  )

  /** Cambia el estado de un pedido (local + backend). */
  const setOrderStatus = useCallback(
    (order, status) => {
      const targetId = typeof order === 'object' ? order.id : order
      const targetApiId = typeof order === 'object' ? order.apiId : undefined
      dispatch({
        type: 'UPDATE_ORDER',
        order: { id: targetId, apiId: targetApiId, status },
      })
      const currentToken = tokenRef.current
      if (state.connection !== 'api' || !currentToken || !targetApiId) return
      api.orders
        .setStatus(targetApiId, status, currentToken)
        .then(() => sync())
        .catch(() => {})
    },
    [sync, state.connection]
  )

  /** Actualiza campos sueltos de un pedido (pago, notas) y re-sincroniza. */
  const updateOrder = useCallback(
    (patch) => {
      dispatch({ type: 'UPDATE_ORDER', order: patch })
      const currentToken = tokenRef.current
      if (state.connection !== 'api' || !currentToken || !patch.apiId) return
      api.orders
        .setPayment(patch.apiId, { paymentKind: patch.paymentKind, payment: patch.payment }, currentToken)
        .then(() => sync())
        .catch(() => {})
    },
    [sync, state.connection]
  )

  /** Elimina un pedido pendiente (local + backend). */
  const deleteOrder = useCallback(
    (order) => {
      const targetId = typeof order === 'object' ? order.id : order
      const targetApiId = typeof order === 'object' ? order.apiId : undefined
      dispatch({ type: 'DELETE_ORDER', id: targetId })
      const currentToken = tokenRef.current
      if (state.connection !== 'api' || !currentToken || !targetApiId) return
      api.orders
        .remove(targetApiId, currentToken)
        .then(() => sync())
        .catch(() => {})
    },
    [sync, state.connection]
  )

  // Valor expuesto por el contexto: estado completo + acciones.
  const value = {
    ...state,
    setLoading: (v) => dispatch({ type: 'SET_LOADING', value: v }),
    saveProduct,
    deleteProduct,
    setProductStatus,
    addOrder,
    updateOrder,
    setOrderStatus,
    deleteOrder,
    saveSettings: (settings) => dispatch({ type: 'SAVE_SETTINGS', settings }),
    sync,
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

/** Hook para acceder al estado y acciones de la tienda desde cualquier componente. */
export function useStore() {
  return useContext(StoreContext)
}
