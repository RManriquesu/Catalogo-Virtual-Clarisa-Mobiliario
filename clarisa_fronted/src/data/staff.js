// ============================================================
// Datos demo de la página "Configuración y roles".
// staff: miembros del equipo del panel admin. Estructura del objeto:
//   id, name, email, initials, color, role, sede, permissions,
//   access (último acceso), online (activo ahora), active.
// roleOptions: lista de roles disponibles para asignar.
// permissionGroups: agrupación de permisos por área del negocio.
// ============================================================

export const staff = [
  {
    id: 1,
    name: 'Arq. Mateo Bianchi',
    email: 'mateo@clarisa.pe',
    initials: 'MB',
    color: 'bg-primary text-on-primary',
    role: 'SuperAdmin',
    sede: 'VES & Dirección',
    permissions: ['Control Total', 'RLS / Precios S/.', 'Postgres Root'],
    access: 'Hace 4 min',
    online: true,
    active: true,
  },
  {
    id: 2,
    name: 'Maestro Evaristo Quispe',
    email: 'taller.ves@clarisa.pe',
    initials: 'EQ',
    color: 'bg-secondary-container text-on-secondary-container',
    role: 'Jefe Ebanistería',
    sede: 'Taller VES',
    permissions: ['Stock Madera', 'Guías SERFOR', 'Fases Taller'],
    access: 'Hoy 08:35',
    online: true,
    active: true,
  },
  {
    id: 3,
    name: 'Luciana Valdivia',
    email: 'luciana@clarisa.pe',
    initials: 'LV',
    color: 'bg-tertiary-container text-on-tertiary',
    role: 'Asesora Showroom',
    sede: 'Showroom Miraflores',
    permissions: ['Cotizar WA', 'Citas Galería', 'Stock Exhibido'],
    access: 'Hace 18 min',
    online: true,
    active: true,
  },
  {
    id: 4,
    name: 'Diego Mendoza',
    email: 'atencion@clarisa.pe',
    initials: 'DM',
    color: 'bg-[#ede9fe] text-[#4c1d95]',
    role: 'Operador WhatsApp',
    sede: 'Sede Central (Remota)',
    permissions: ['Respuestas WA', 'Derivar Taller'],
    access: 'Ayer 18:40',
    online: false,
    active: true,
  },
  {
    id: 5,
    name: 'Carmen Rosa Ugarte',
    email: 'finanzas@clarisa.pe',
    initials: 'CU',
    color: 'bg-[#e7f3e8] text-[#1f5132]',
    role: 'Finanzas & Facturas',
    sede: 'Oficina Miraflores',
    permissions: ['Facturas SUNAT', 'Adelantos 50%', 'Reportes Cierre'],
    access: 'Hoy 10:12',
    online: true,
    active: true,
  },
]

// Roles disponibles para asignar a un nuevo miembro.
export const roleOptions = ['SuperAdmin', 'Ebanista', 'Asistente Showroom', 'Taller / Producción', 'Solo lectura']

// Grupos de permisos por área (catálogo, madera, ventas y sistema).
export const permissionGroups = {
  catalog: ['Publicar / editar productos', 'Publicar / editar categorías', 'Gestionar colecciones'],
  wood: ['Ver trazabilidad SERFOR', 'Cargar guías de madera', 'Editar inventario de madera'],
  sales: ['Cotizar vía WhatsApp', 'Emitir facturas SUNAT', 'Ver reportes de cierre'],
  system: ['Gestionar roles & permisos', 'Configurar RLS obligatorio', 'Acceso al esquema PostgreSQL'],
}