using System.Text.Json.Serialization;

namespace ClarisaBackend.Models;

/// <summary>
/// Miembro del equipo de Clarisa Mobiliario.
/// Almacena los datos del personal (showroom, taller, finanzas, etc.), su rol,
/// sede, permisos y estado de disponibilidad (en línea / activo).
/// </summary>
public class StaffMember
{
    // Identificador único del miembro del equipo (autogenerado).
    public int Id { get; set; }

    // Nombre completo del miembro.
    public string Name { get; set; } = string.Empty;

    // Correo corporativo del miembro (ej.: "mateo@clarisa.pe").
    public string Email { get; set; } = string.Empty;

    // Iniciales del miembro para el avatar (ej.: "MB").
    public string Initials { get; set; } = string.Empty;

    // Rol dentro de la organización (ej.: "SuperAdmin", "Jefe Ebanistería").
    public string Role { get; set; } = string.Empty;

    // Sede o ubicación de trabajo (ej.: "Taller VES", "Showroom Miraflores").
    public string Sede { get; set; } = string.Empty;

    // Lista de permisos/funciones asignados (ej.: "Stock Madera", "Guías SERFOR").
    public string[] Permissions { get; set; } = Array.Empty<string>();

    // Texto del último acceso registrado (ej.: "Hace 4 min").
    public string LastAccess { get; set; } = string.Empty;

    // Indica si el miembro está conectado en este momento.
    public bool Online { get; set; }

    // Indica si la cuenta está activa (true) o desactivada (false).
    public bool Active { get; set; } = true;
}