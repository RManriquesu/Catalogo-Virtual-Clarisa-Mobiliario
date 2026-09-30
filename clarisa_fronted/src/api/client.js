// ============================================================================
// client.js — Cliente HTTP de la API de Clarisa Mobiliario.
// Envuelve fetch con timeout y token JWT, expone todos los endpoints del
// backend y normaliza los datos entre el formato de la API y el usado en
// las páginas del frontend.
// ============================================================================

// URL base de la API. Se puede sobrescribir con la variable de entorno VITE_API_URL.
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5029/api'
// Tiempo máximo de espera de cada petición (10 segundos).
const REQUEST_TIMEOUT = 10000

/**
 * Petición HTTP genérica con timeout y parseo automático de JSON.
 * Si se pasa `formData: true`, el body se envía tal cual como FormData
 * (multipart, el navegador fija automáticamente el Content-Type).
 * @param {string} path Ruta relativa a API_BASE (ej.: "/products").
 * @param {Object} options { method, body, token, formData }.
 * @returns {Promise} Respuesta parseada o null si el servidor responde 204.
 */
async function request(path, { method = 'GET', body, token, formData = false } = {}) {
  // AbortController permite cancelar la petición si tarda demasiado.
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

  // Cabeceras: JSON para datos normales, sin Content-Type para FormData,
  // y token Bearer si hay sesión activa en ambos casos.
  const headers = formData ? {} : { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body != null ? (formData ? body : JSON.stringify(body)) : undefined,
      signal: controller.signal,
    })

    // Si el servidor responde con error HTTP, lanza una excepción con el código.
    if (!res.ok) {
      const error = new Error(`El servidor respondió ${res.status}`)
      error.status = res.status
      throw error
    }

    // 204 = sin contenido (p. ej. en DELETE o PATCH exitoso).
    if (res.status === 204) return null
    const text = await res.text()
    return text ? JSON.parse(text) : null
  } finally {
    // Limpia el temporizador para evitar timeouts en cascada.
    clearTimeout(timer)
  }
}

/**
 * Detecta si un error proviene de la red (sin respuesta del servidor)
 * o de un timeout, útil para activar el modo offline/demo del frontend.
 */
export function isNetworkError(error) {
  return error?.name === 'AbortError' || error instanceof TypeError || !error?.status
}

// ============================================================================
// API — Mapea todos los endpoints del backend a funciones invocables.
// ============================================================================
export const api = {
  // Autenticación de administradores.
  login(email, password) {
    return request('/auth/login', {
      method: 'POST',
      body: { email, password },
    })
  },

  // CRUD de productos. La lectura es pública; las escrituras requieren token.
  products: {
    list: () => request('/products'),
    create: (product, token) => request('/products', { method: 'POST', body: product, token }),
    update: (product, token) =>
      request(`/products/${product.id}`, {
        method: 'PUT',
        body: product,
        token,
      }),
    setStatus: (id, status, token) =>
      request(`/products/${id}/status`, {
        method: 'PATCH',
        body: status,
        token,
      }),
    remove: (id, token) => request(`/products/${id}`, { method: 'DELETE', token }),
    // Sube una imagen al servidor y devuelve { url } para asignarla al producto.
    uploadImage: (file, token) => {
      const formData = new FormData()
      formData.append('file', file)
      return request('/products/upload-image', {
        method: 'POST',
        body: formData,
        token,
        formData: true,
      })
    },
  },

  // Categorías del catálogo (públicas).
  categories: {
    list: () => request('/categories'),
  },

  // Pedidos de clientes (protegidos).
  orders: {
    list: (token) => request('/orders', { token }),
    create: (order, token) => request('/orders', { method: 'POST', body: order, token }),
    setStatus: (id, status, token) => request(`/orders/${id}/status`, { method: 'PATCH', body: status, token }),
    setPayment: (id, payment, token) => request(`/orders/${id}/payment`, { method: 'PATCH', body: payment, token }),
    remove: (id, token) => request(`/orders/${id}`, { method: 'DELETE', token }),
  },

  // Lotes de madera (trazabilidad SERFOR, protegidos).
  woodLots: {
    list: (token) => request('/woodlots', { token }),
  },

  // Miembros del equipo (protegidos).
  staff: {
    list: (token) => request('/staff', { token }),
  },

  // Métricas del dashboard (protegidas).
  dashboard: {
    summary: (token) => request('/dashboard/summary', { token }),
  },
}

// ============================================================================
// Normalizadores — Convierten los objetos del backend (camelCase)
// al formato interno del frontend (y viceversa).
// ============================================================================

/**
 * Producto del backend → formato de las páginas.
 * Convierte días/stock/URLs del backend al shape usado por la UI.
 */
export function normalizeProduct(b) {
  return {
    id: b.id,
    sku: b.sku,
    name: b.name,
    category: b.category,
    categoryLabel: b.categoryLabel,
    material: b.material,
    materialShort: b.materialShort,
    price: b.price,
    cost: b.cost,
    availability: b.availability,
    stockNote: b.stockNote,
    badge: b.badge,
    waybill: b.waybill,
    tagline: b.tagline,
    description: b.description,
    days: b.daysToBuild,
    // Agrupa el stock de los tres almacenes en un solo objeto.
    warehouses: {
      miraflores: b.stockMiraflores,
      ves: b.stockVes,
      central: b.stockCentral,
    },
    status: b.status,
    image: b.imageUrl,
  }
}

/**
 * Producto del frontend → formato del backend.
 * Al crear un producto sin id, se elimina el campo id para que el backend lo asigne.
 */
export function toBackendProduct(p) {
  const out = {
    id: p.id || 0,
    sku: p.sku ?? '',
    name: p.name,
    category: p.category ?? '',
    categoryLabel: p.categoryLabel ?? '',
    material: p.material ?? '',
    materialShort: p.materialShort ?? '',
    price: Number(p.price) || 0,
    cost: Number(p.cost) || 0,
    availability: p.availability,
    stockNote: p.stockNote ?? '',
    badge: p.badge ?? '',
    waybill: p.waybill ?? '',
    tagline: p.tagline ?? '',
    description: p.description ?? '',
    daysToBuild: Number(p.days) || 0,
    status: p.status ?? 'Publicado',
    imageUrl: p.image ?? '',
    // Desempaqueta el stock por almacén en campos separados.
    stockMiraflores: p.warehouses?.miraflores || 0,
    stockVes: p.warehouses?.ves || 0,
    stockCentral: p.warehouses?.central || 0,
  }
  if (!out.id) delete out.id
  return out
}

/**
 * Pedido del backend → formato de las páginas.
 * Usa el número de pedido (orderNumber) como identificador visible.
 */
export function normalizeOrder(b) {
  return {
    id: b.orderNumber || `CLR-${b.id}`,
    apiId: b.id,
    client: b.client,
    phone: b.phone,
    phoneRaw: b.phoneRaw,
    district: b.district,
    time: b.time,
    item: b.item,
    spec: b.spec,
    price: b.price,
    payment: b.payment,
    paymentKind: b.paymentKind,
    status: b.status,
    image: b.imageUrl,
    productId: b.productId ?? null,
  }
}

/** Pedido del frontend → formato del backend. */
export function toBackendOrder(o) {
  return {
    orderNumber: o.id,
    client: o.client,
    phone: o.phone,
    phoneRaw: o.phoneRaw,
    district: o.district,
    time: o.time,
    item: o.item,
    spec: o.spec,
    price: Number(o.price) || 0,
    payment: o.payment,
    paymentKind: o.paymentKind,
    status: o.status,
    imageUrl: o.image,
    productId: o.productId ?? null,
  }
}

/** Categoría del backend → formato de las páginas. */
export function normalizeCategory(b) {
  return {
    id: b.id,
    name: b.name,
    slug: b.slug,
    type: b.type,
    priority: b.priority,
    pieces: b.pieces,
    materials: b.materials || [],
    status: b.status,
    accent: b.accent,
    limited: false,
    image: b.imageUrl,
  }
}

/** Miembro del equipo (backend) → formato de las páginas. */
export function normalizeStaff(b) {
  return {
    id: b.id,
    name: b.name,
    email: b.email,
    initials: b.initials,
    role: b.role,
    sede: b.sede,
    permissions: b.permissions || [],
    access: b.lastAccess,
    online: b.online,
    active: b.active,
  }
}

/** Lote de madera (backend) → formato de las páginas. */
export function normalizeWoodLot(b) {
  return {
    id: b.lotNumber,
    species: b.species,
    scientific: b.scientific,
    region: b.region,
    gtf: b.gtfCode,
    supplier: b.supplier,
    supplierShort: b.supplierShort,
    volume: b.volume,
    humidity: b.humidity,
    condition: b.conditionText,
    stage: b.stage,
    stageShort: b.stageShort,
    stageIcon: b.stageIcon,
    usedIn: b.usedIn,
    loads: b.loads,
    received: b.received,
  }
}

export { API_BASE }
