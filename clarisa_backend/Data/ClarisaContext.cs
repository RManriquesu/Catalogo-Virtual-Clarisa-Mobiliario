using ClarisaBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace ClarisaBackend.Data;

/// <summary>
/// Contexto de EF Core (Entity Framework Core) que representa la base de datos
/// PostgreSQL "clarisa_mobiliario". Expone todas las tablas como DbSets y
/// configura las restricciones (longitudes, precisión, índices únicos).
/// </summary>
public class ClarisaContext(DbContextOptions<ClarisaContext> options) : DbContext(options)
{
    // Tabla de productos del catálogo.
    public DbSet<Product> Products => Set<Product>();

    // Tabla de pedidos de clientes.
    public DbSet<Order> Orders => Set<Order>();

    // Tabla de lotes de madera (trazabilidad SERFOR).
    public DbSet<WoodLot> WoodLots => Set<WoodLot>();

    // Tabla de categorías del catálogo.
    public DbSet<Category> Categories => Set<Category>();

    // Tabla de miembros del equipo.
    public DbSet<StaffMember> Staff => Set<StaffMember>();

    // Tabla de usuarios administradores (acceso al panel).
    public DbSet<AdminUser> AdminUsers => Set<AdminUser>();

    /// <summary>
    /// Configura el esquema de las tablas: longitudes máximas, campos
    /// obligatorios, precisión decimal y los índices únicos del negocio.
    /// </summary>
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Tabla Productos:
        // - Name: obligatorio, máximo 120 caracteres.
        // - Precio/Costo: decimales con precisión (12,2).
        // - Sku: índice único (no se pueden duplicar códigos de producto).
        modelBuilder.Entity<Product>(e =>
        {
            e.Property(p => p.Name).HasMaxLength(120).IsRequired();
            e.Property(p => p.Sku).HasMaxLength(32);
            e.Property(p => p.Price).HasPrecision(12, 2);
            e.Property(p => p.Cost).HasPrecision(12, 2);
            e.HasIndex(p => p.Sku).IsUnique();
        });

        // Tabla Pedidos:
        // - OrderNumber: obligatorio, máximo 16 caracteres.
        // - Price: precisión (12,2).
        // - OrderNumber: índice único (cada pedido tiene un correlativo distinto).
        modelBuilder.Entity<Order>(e =>
        {
            e.Property(o => o.OrderNumber).HasMaxLength(16).IsRequired();
            e.Property(o => o.Price).HasPrecision(12, 2);
            e.HasIndex(o => o.OrderNumber).IsUnique();
        });

        // Tabla Lotes de madera:
        // - LotNumber: obligatorio, máximo 24 caracteres, índice único.
        // - GtfCode: máximo 32 caracteres.
        modelBuilder.Entity<WoodLot>(e =>
        {
            e.Property(w => w.LotNumber).HasMaxLength(24).IsRequired();
            e.Property(w => w.GtfCode).HasMaxLength(32);
            e.HasIndex(w => w.LotNumber).IsUnique();
        });

        // Tabla Categorías:
        // - Slug: obligatorio, máximo 64 caracteres, índice único.
        modelBuilder.Entity<Category>(e =>
        {
            e.Property(c => c.Slug).HasMaxLength(64).IsRequired();
            e.HasIndex(c => c.Slug).IsUnique();
        });

        // Tabla Miembros del equipo:
        // - Email: obligatorio, máximo 120 caracteres, índice único.
        modelBuilder.Entity<StaffMember>(e =>
        {
            e.Property(s => s.Email).HasMaxLength(120).IsRequired();
            e.HasIndex(s => s.Email).IsUnique();
        });

        // Tabla Usuarios administradores:
        // - Email: obligatorio, máximo 120 caracteres, índice único.
        // - PasswordHash: obligatorio, máximo 200 caracteres.
        modelBuilder.Entity<AdminUser>(e =>
        {
            e.Property(a => a.Email).HasMaxLength(120).IsRequired();
            e.Property(a => a.PasswordHash).HasMaxLength(200).IsRequired();
            e.HasIndex(a => a.Email).IsUnique();
        });
    }
}