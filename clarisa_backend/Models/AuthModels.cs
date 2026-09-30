namespace ClarisaBackend.Models;

/// <summary>
/// Usuario administrador que tiene acceso al panel de gestión.
/// Su contraseña nunca se guarda en texto plano, solo el hash (PasswordHasher).
/// </summary>
public class AdminUser
{
    // Identificador único del usuario administrador.
    public int Id { get; set; }

    // Correo electrónico del administrador (identificador de acceso).
    public string Email { get; set; } = string.Empty;

    // Nombre completo del administrador.
    public string Name { get; set; } = string.Empty;

    // Rol asignado (ej.: "SuperAdmin", "Administrador"); por defecto "Administrador".
    public string Role { get; set; } = "Administrador";

    // Hash de la contraseña (PBKDF2), nunca la contraseña en claro.
    public string PasswordHash { get; set; } = string.Empty;

    // Fecha y hora (UTC) de creación de la cuenta.
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// Cuerpo de la petición de login: correo y contraseña del administrador.
/// </summary>
public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

/// <summary>
/// Información pública del usuario autenticado que se devuelve al frontend.
/// No incluye datos sensibles como el hash de contraseña.
/// </summary>
public class AuthUserInfo
{
    public string Email { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;

    // Iniciales del nombre para mostrar en el avatar (ej.: "MB").
    public string Initials { get; set; } = string.Empty;
}

/// <summary>
/// Respuesta exitosa del login: token JWT, fecha de expiración e info del usuario.
/// </summary>
public class AuthResponse
{
    // Token JWT que el frontend enviará en cada petición protegida.
    public string Token { get; set; } = string.Empty;

    // Fecha y hora (UTC) en la que el token deja de ser válido.
    public DateTime ExpiresAt { get; set; }

    // Datos del usuario autenticado.
    public AuthUserInfo User { get; set; } = new();
}