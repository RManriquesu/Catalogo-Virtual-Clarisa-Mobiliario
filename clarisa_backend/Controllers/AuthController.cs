using ClarisaBackend.Data;
using ClarisaBackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClarisaBackend.Controllers;

/// <summary>
/// Controlador de autenticación.
/// Endpoint público de login que valida las credenciales de un administrador
/// y devuelve un token JWT para acceder a las rutas protegidas del panel.
/// </summary>
[ApiController]
[Route("api/auth")]
[AllowAnonymous]
public class AuthController(ClarisaContext db, IConfiguration config) : ControllerBase
{
    /// <summary>
    /// POST /api/auth/login — Inicia sesión de un administrador.
    /// </summary>
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        // Validación básica: correo y contraseña son obligatorios.
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new { message = "Correo y contraseña son obligatorios." });

        // Normaliza el correo (minúsculas sin espacios) y busca al usuario por email.
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await db.AdminUsers.SingleOrDefaultAsync(u => u.Email.ToLower() == email);

        // Si el usuario no existe o la contraseña no verifica el hash → 401.
        if (user is null || !PasswordHasher.Verify(request.Password, user.PasswordHash))
            return Unauthorized(new { message = "Credenciales inválidas." });

        // La clave para firmar el token debe estar configurada en el servidor.
        var key = config["Auth:JwtKey"];
        if (string.IsNullOrWhiteSpace(key))
            return Unauthorized(new { message = "Autenticación no configurada (falta JwtKey)." });

        // Genera el token JWT con los datos del usuario autenticado.
        var token = JwtService.CreateToken(
            user,
            key,
            config["Auth:Issuer"] ?? "ClarisaBackend",
            config["Auth:Audience"] ?? "clarisa-frontend");

        // Devuelve el token, su expiración (9 horas) y la info pública del usuario.
        return Ok(new AuthResponse
        {
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddHours(9),
            User = new AuthUserInfo
            {
                Email = user.Email,
                Name = user.Name,
                Role = user.Role,
                Initials = Initials(user.Name),
            },
        });
    }

    /// <summary>
    /// Obtiene las iniciales del nombre para el avatar (ej.: "Arq. Mateo Bianchi" → "AM").
    /// </summary>
    private static string Initials(string name)
    {
        // Toma las palabras del nombre y usa la primera letra de las dos primeras.
        var words = name.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        return words.Length >= 2 ? $"{words[0][0]}{words[1][0]}" : name[..1];
    }
}