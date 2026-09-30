using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ClarisaBackend.Models;
using Microsoft.IdentityModel.Tokens;

namespace ClarisaBackend.Data;

/// <summary>
/// Emisor de tokens JWT para la API. Genera un token firmado (HMAC-SHA256)
/// con la identidad y rol del administrador autenticado.
/// </summary>
public static class JwtService
{
    // Vigencia del token en horas (9 horas = una jornada laboral).
    private const int ExpirationHours = 9;

    /// <summary>
    /// Crea un token JWT firmado con la información del usuario administrador.
    /// </summary>
    public static string CreateToken(AdminUser user, string key, string issuer, string audience)
    {
        // Clave simétrica de firma creada a partir del JwtKey.
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        // Claims (declaraciones) que viajarán dentro del token:
        // subject = email, más email, nombre, rol e id del usuario.
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Email),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.Name, user.Name),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim("user_id", user.Id.ToString(), ClaimValueTypes.Integer32),
        };

        // Construye el token con emisor, audiencia, claims, validez desde ahora
        // y expiración en 9 horas.
        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            notBefore: DateTime.UtcNow,
            expires: DateTime.UtcNow.AddHours(ExpirationHours),
            signingCredentials: credentials);

        // Serializa el token JWT a su representación en cadena (JWS Compact).
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}