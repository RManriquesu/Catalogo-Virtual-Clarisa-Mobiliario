using System.Security.Cryptography;

namespace ClarisaBackend.Data;

/// <summary>
/// Utilidad de seguridad para contraseñas de administradores.
/// Genera y verifica hashes PBKDF2 (con salt aleatorio), de modo que las
/// contraseñas nunca se almacenan en texto plano en la base de datos.
/// </summary>
public static class PasswordHasher
{
    // Número de iteraciones del algoritmo PBKDF2 (costo computacional: a mayor, más seguro).
    private const int Iterations = 60_000;

    // Tamaño en bytes del salt (valor aleatorio único por contraseña).
    private const int SaltSize = 16;

    // Tamaño en bytes de la clave derivada (hash final).
    private const int KeySize = 32;

    /// <summary>
    /// Genera un hash seguro de la contraseña en formato "base64(salt).base64(hash)".
    /// </summary>
    public static string Hash(string password)
    {
        // Salt aleatorio criptográficamente seguro (único para cada contraseña).
        var salt = RandomNumberGenerator.GetBytes(SaltSize);

        // Deriva la clave con PBKDF2 usando SHA256 y el número de iteraciones configurado.
        var hash = Rfc2898DeriveBytes.Pbkdf2(password, salt, Iterations, HashAlgorithmName.SHA256, KeySize);

        // Devuelve salt y hash concatenados y separados por punto (el salt se vuelve a
        // necesitar en Verify para recalcular el hash).
        return $"{Convert.ToBase64String(salt)}.{Convert.ToBase64String(hash)}";
    }

    /// <summary>
    /// Verifica si una contraseña coincide con el hash almacenado.
    /// Recalcula el hash con el salt almacenado y compara en tiempo constante
    /// (resistente a ataques de temporización).
    /// </summary>
    public static bool Verify(string password, string stored)
    {
        // Separa el hash almacenado en sus dos partes: salt y hash esperado.
        var parts = stored.Split('.');
        if (parts.Length != 2)
            return false;

        var salt = Convert.FromBase64String(parts[0]);
        var expected = Convert.FromBase64String(parts[1]);

        // Recalcula el hash con la contraseña ingresada y el salt original.
        var actual = Rfc2898DeriveBytes.Pbkdf2(password, salt, Iterations, HashAlgorithmName.SHA256, KeySize);

        // Comparación en tiempo constante: no revela información sobre la contraseña.
        return CryptographicOperations.FixedTimeEquals(expected, actual);
    }
}