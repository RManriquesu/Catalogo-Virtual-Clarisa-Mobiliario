import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { api, isNetworkError } from '../api/client'

// Contexto de autenticación: expone la sesión del administrador del panel.
const AuthContext = createContext(null)

// Clave en localStorage donde se persiste la sesión del administrador.
const SESSION_KEY = 'clarisa_admin_session'

/**
 * Lee la sesión guardada en localStorage.
 * Devuelve null si no existe o si el token ya expiró.
 */
function readSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const session = JSON.parse(raw)
    // Si la sesión tiene fecha de expiración y ya pasó, se descarta.
    if (session.expiresAt && Date.now() > session.expiresAt) return null
    return session
  } catch {
    return null
  }
}

/**
 * Proveedor de autenticación.
 * Mantiene la sesión activa, permite iniciar y cerrar sesión, y gestiona
 * el "modo demo offline" cuando el backend no está disponible.
 */
export function AuthProvider({ children }) {
  // Estado inicial: lee la sesión persistida (si existe).
  const [session, setSession] = useState(readSession)
  // Mensaje de error de autenticación mostrado en la pantalla de login.
  const [authError, setAuthError] = useState('')

  /**
   * Inicia sesión llamando al backend (POST /api/auth/login).
   * Si el servidor no responde (fallo de red), activa el modo demo offline
   * para poder seguir navegando por el panel sin conexión.
   */
  const login = useCallback(async (email, password) => {
    setAuthError('')
    const cleanEmail = email.trim()

    // Validación básica de campos vacíos.
    if (!cleanEmail || !password) {
      setAuthError('Correo y contraseña son obligatorios.')
      return { ok: false }
    }

    let next
    try {
      // Intenta autenticarse contra el backend (JWT + PostgreSQL).
      const res = await api.login(cleanEmail, password)
      next = {
        token: res.token,
        // Expira en 9 horas (o usa la fecha que devuelva el servidor).
        expiresAt: Date.parse(res.expiresAt) || Date.now() + 9 * 60 * 60 * 1000,
        user: res.user,
        demo: false,
      }
    } catch (err) {
      // Credenciales inválidas devueltas por el servidor (401).
      if (err.status === 401) {
        setAuthError('Credenciales incorrectas. Verifica correo y contraseña.')
        return { ok: false }
      }
      // Error de red: el backend no está disponible → modo demo local.
      if (isNetworkError(err)) {
        next = {
          token: null,
          expiresAt: Date.now() + 9 * 60 * 60 * 1000,
          user: {
            email: cleanEmail,
            name: cleanEmail.split('@')[0].replace('.', ' '),
            role: 'Administrador (Demo local)',
            initials: cleanEmail[0].toUpperCase(),
          },
          demo: true,
        }
      } else {
        // Cualquier otro error del servidor.
        setAuthError('El servidor respondió con un error inesperado. Inténtalo de nuevo.')
        return { ok: false }
      }
    }

    // Guarda la sesión (JSON) en localStorage y la activa en el estado.
    localStorage.setItem(SESSION_KEY, JSON.stringify(next))
    setSession(next)
    return { ok: true, offline: !!next.demo }
  }, [])

  /** Cierra la sesión: borra la sesión de localStorage y del estado. */
  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY)
    setSession(null)
  }, [])

  // Datos derivados de la sesión actual.
  const manager = session?.user || null
  const token = session?.token || null

  // Valor expuesto por el contexto.
  const value = useMemo(
    () => ({
      manager,
      token,
      isAuthed: !!session && !!manager,
      demo: !!session?.demo,
      offline: !!session?.demo,
      authError,
      login,
      logout,
    }),
    [manager, token, session, authError, login, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/** Hook para acceder al contexto de autenticación desde cualquier componente. */
export function useAuth() {
  return useContext(AuthContext)
}