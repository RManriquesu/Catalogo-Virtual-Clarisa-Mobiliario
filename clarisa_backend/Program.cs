using System.Text;
using ClarisaBackend.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

// ============================================================================
// Program.cs — PUNTO DE ENTRADA de la API Clarisa Mobiliario.
// Configura e inicia el servidor ASP.NET Core: servicios, autenticación JWT,
// base de datos PostgreSQL (EF Core), CORS, Swagger y la siembra inicial.
// ============================================================================

var builder = WebApplication.CreateBuilder(args);

// Registra los controladores REST y el explorador de endpoints (necesario para Swagger).
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Obtiene la configuración raíz de la aplicación (appsettings.json + user-secrets + env vars).
var root = builder.Configuration;

// La firma JWT se lee de "Auth:JwtKey" o de la variable de entorno JWT_KEY.
// Si no existe ninguna, se genera una clave aleatoria de 32 bytes (efímera:
// todos los tokens emitidos se invalidan al reiniciar el servidor).
var jwtKey = root["Auth:JwtKey"] ?? Environment.GetEnvironmentVariable("JWT_KEY");
if (string.IsNullOrWhiteSpace(jwtKey))
{
    jwtKey = Convert.ToHexString(Random.Shared.RandomBytes(32));
    builder.Logging.AddFilter("JwtEphemeral", LogLevel.Warning);
}

// Identificador del emisor (issuer) y audiencia (audience) del token JWT.
var issuer = root["Auth:Issuer"] ?? "ClarisaBackend";
var audience = root["Auth:Audience"] ?? "clarisa-frontend";

// Configura Swagger con un esquema de seguridad "Bearer" para que los endpoints
// protegidos puedan probarse enviando el token devuelto por el login.
builder.Services.AddSwaggerGen(c =>
{
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Usa el token devuelto por POST /api/auth/login.",
    });
    // Aplica el esquema Bearer como requisito de seguridad en todos los endpoints documentados.
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" },
            },
            Array.Empty<string>()
        },
    });
});

// Cadena de conexión a PostgreSQL: se toma de la configuración "ClarisaDB"
// o de la variable de entorno CLARISA_DB.
var connectionString = root.GetConnectionString("ClarisaDB")
    ?? Environment.GetEnvironmentVariable("CLARISA_DB");

// Registra el contexto de EF Core (ClarisaContext) conectado a PostgreSQL/Npgsql.
// Las migraciones se buscan en el ensamblado del propio contexto.
builder.Services.AddDbContext<ClarisaContext>(options =>
    options.UseNpgsql(connectionString ?? string.Empty, npgsql =>
        npgsql.MigrationsAssembly(typeof(ClarisaContext).Assembly.FullName)));

// Política CORS para el frontend de desarrollo (Vite), permitiendo llamadas
// desde los puertos 5173 y 4173 con cualquier cabecera y método HTTP.
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendLocal", policy =>
        policy.WithOrigins("http://localhost:5173", "http://localhost:4173", "http://127.0.0.1:5173")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

// Configura la autenticación JWT Bearer con validación estricta de emisor,
// audiencia, vigencia y firma (clave simétrica HMAC-SHA256).
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = issuer,
            ValidAudience = audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ClockSkew = TimeSpan.Zero,
        };
    });

// Política de autorización por defecto: TODOS los endpoints exigen un usuario
// autenticado, salvo los que usen explícitamente [AllowAnonymous].
builder.Services.AddAuthorization(options =>
{
    options.FallbackPolicy = new AuthorizationPolicyBuilder(JwtBearerDefaults.AuthenticationScheme)
        .RequireAuthenticatedUser()
        .Build();
});

// Construye la aplicación (WebApplication) con todos los servicios registrados.
var app = builder.Build();

// Al arrancar, crea la base de datos si no existe y la rellena con datos demo.
// Si la conexión a PostgreSQL falla, solo se registra una advertencia y la API
// continúa funcionando (p. ej. con Swagger activo).
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ClarisaContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    try
    {
        await DbSeeder.InitializeAsync(db, logger, root["Auth:InitialPassword"]);
    }
    catch (Exception ex)
    {
        logger.LogWarning(ex,
            "No se pudo conectar a PostgreSQL. La API arranca igualmente (Swagger activo). Revisa la cadena de conexión y que el servicio PostgreSQL esté iniciado.");
    }
}

// Swagger solo está disponible en el entorno de desarrollo.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Cadena de middleware HTTP: CORS → archivos estáticos → autenticación → autorización → controladores.
app.UseCors("FrontendLocal");
// Sirve las imágenes subidas desde wwwroot (p. ej. /uploads/xxxx.png) al frontend y la tienda.
app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();

// Mapea todos los controladores de la API a sus rutas.
app.MapControllers();

// Inicia el servidor web y queda a la espera de peticiones.
app.Run();

// ============================================================================
// Clase de utilidad: genera bytes aleatorios criptográficamente seguros.
// Se usa para crear la clave JWT efímera cuando no está configurada.
// ============================================================================
public static class RandomExtensions
{
    public static byte[] RandomBytes(this Random random, int count)
    {
        var bytes = new byte[count];
        System.Security.Cryptography.RandomNumberGenerator.Fill(bytes);
        return bytes;
    }
}