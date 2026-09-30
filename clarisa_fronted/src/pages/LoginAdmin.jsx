import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Icono from '../components/ui/Icono'
import { useAuth } from '../store/AuthContext'

/**
 * Pantalla de ingreso al panel de administración.
 * Formulario de login (correo + contraseña) que valida contra el backend
 * (JWT + PostgreSQL) a través del contexto de autenticación.
 */
export default function LoginAdmin() {
  const { login, authError } = useAuth()
  const navigate = useNavigate()

  // El correo se precarga desde localStorage si el usuario marcó "Recordar sesión".
  const [email, setEmail] = useState(localStorage.getItem('clarisa_login_email') || '')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false) // muestra/oculta la contraseña
  const [remember, setRemember] = useState(true) // recuerda el correo
  const [phase, setPhase] = useState('idle') // idle | connecting (spinner)

  /** Maneja el envío del formulario: intenta autenticar y redirige al panel. */
  const submit = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password) return
    setPhase('connecting')
    const result = await login(email, password)
    if (result?.ok) {
      // Si el usuario marcó recordar, guarda el correo para la próxima vez.
      if (remember) localStorage.setItem('clarisa_login_email', email)
      navigate('/admin/productos', { replace: true })
    } else {
      // Login fallido: vuelve al estado idle para reintentar.
      setPhase('idle')
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4">
      {/* Decoración de fondo: círculos decorativos muy tenues */}
      <div className="absolute inset-0 overflow-hidden text-primary opacity-[0.04]">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-outline-variant" />
        <div className="absolute -bottom-32 -left-20 h-[28rem] w-[28rem] rounded-full bg-outline-variant" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo de la marca que enlaza a la tienda pública */}
        <Link to="/" className="mb-6 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded bg-primary text-on-primary">
            <Icono name="chair" size={24} />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-headline-lg text-headline-md">Clarisa Mobiliario</span>
            <span className="font-label-md text-label-md text-on-surface-variant">Panel de Gestión</span>
          </span>
        </Link>

        {/* Tarjeta principal del login */}
        <div className="rounded-lg bg-surface-container-lowest p-8 shadow-wood">
          <h1 className="font-headline-lg text-headline-md text-on-surface">Ingreso de administradores</h1>
          <p className="mt-1 font-body-md text-body-md text-on-surface-variant">
            Accede al sistema de gestión de la tienda.
          </p>

          {/* Formulario de credenciales */}
          <form onSubmit={submit} className="mt-6 space-y-4">
            {/* Campo de correo con icono */}
            <label className="block">
              <span className="font-label-md text-label-md uppercase text-on-surface-variant">Correo</span>
              <div className="mt-1 flex items-center gap-2 rounded border border-outline-variant bg-white px-3 py-2.5 focus-within:border-secondary">
                <Icono name="mail" size={18} className="text-on-surface-variant" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@clarisa.pe"
                  className="w-full bg-transparent font-body-md text-body-md outline-none placeholder:text-outline"
                />
              </div>
            </label>

            {/* Campo de contraseña con toggle de visibilidad */}
            <label className="block">
              <span className="font-label-md text-label-md uppercase text-on-surface-variant">Contraseña</span>
              <div className="mt-1 flex items-center gap-2 rounded border border-outline-variant bg-white px-3 py-2.5 focus-within:border-secondary">
                <Icono name="lock" size={18} className="text-on-surface-variant" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent font-body-md text-body-md outline-none placeholder:text-outline"
                />
                {/* Botón que alterna entre mostrar y ocultar la contraseña */}
                <button type="button" onClick={() => setShowPw((v) => !v)} className="text-on-surface-variant" aria-label="Mostrar contraseña">
                  <Icono name={showPw ? 'visibility_off' : 'visibility'} size={18} />
                </button>
              </div>
            </label>

            {/* Recordar correo + enlace de contraseña olvidada (placeholder) */}
            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 font-body-sm text-body-sm text-on-surface-variant">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 accent-secondary"
                />
                Recordar sesión
              </label>
              <button type="button" className="font-body-sm text-body-sm text-secondary hover:underline">
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Botón de envío: muestra spinner mientras se conecta a la BD */}
            <button
              type="submit"
              disabled={phase === 'connecting'}
              className="flex w-full items-center justify-center gap-2 rounded bg-primary py-3 font-label-md text-label-md text-on-primary transition-opacity hover:opacity-90 disabled:opacity-70"
            >
              {phase === 'connecting' ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-on-primary border-t-transparent" />
                  Conectando con Base de Datos…
                </>
              ) : (
                <>
                  <Icono name="login" size={18} /> Ingresar al Panel
                </>
              )}
            </button>
          </form>

          {/* Mensaje de error de autenticación (si el contexto lo provee) */}
          {authError && (
            <div className="mt-4 flex items-start gap-2 rounded bg-[#ffdad6] px-3 py-2.5 font-body-sm text-body-sm text-[#93000a]">
              <Icono name="error" size={16} className="mt-0.5 shrink-0" />
              {authError}
            </div>
          )}

          {/* Nota aclaratoria sobre el modo demo local */}
          <p className="mt-5 flex items-start gap-1.5 font-body-sm text-body-sm text-on-surface-variant">
            <Icono name="info" size={16} className="mt-0.5 shrink-0 text-secondary" />
            El login valida contra el backend (JWT + PostgreSQL). Si el servidor no responde, se entra en modo respaldo con datos locales.
          </p>
        </div>

        {/* Enlace de regreso a la tienda pública */}
        <p className="mt-6 text-center font-body-sm text-body-sm text-on-surface-variant">
          <Link to="/" className="inline-flex items-center gap-1 text-secondary hover:underline">
            <Icono name="arrow_back" size={16} /> Volver a la tienda pública
          </Link>
        </p>
      </div>
    </div>
  )
}