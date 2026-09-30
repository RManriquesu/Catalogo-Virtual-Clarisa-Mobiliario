using System.ComponentModel.DataAnnotations;

namespace ClarisaBackend.Models;

/// <summary>
/// Producto del catálogo de Clarisa Mobiliario.
/// Representa una pieza de mueble con su precio, costo, stock por almacén,
/// disponibilidad (en stock o fabricación a pedido) y estado de publicación.
/// </summary>
public class Product
{
    // Identificador único del producto (autogenerado por la base de datos).
    public int Id { get; set; }

    // Código interno único del producto (ej.: "CLR-SOF-01"), de 3 a 32 caracteres.
    [StringLength(32, MinimumLength = 3)]
    public string Sku { get; set; } = string.Empty;

    // Nombre público del producto (ej.: "Sofá Modular Pachacámac"), obligatorio (3-120 caracteres).
    [Required, StringLength(120, MinimumLength = 3)]
    public string Name { get; set; } = string.Empty;

    // Categoría interna (slug) a la que pertenece el producto (ej.: "salas").
    public string Category { get; set; } = string.Empty;

    // Etiqueta de categoría mostrada al cliente (ej.: "Salas").
    public string CategoryLabel { get; set; } = string.Empty;

    // Material principal del mueble (ej.: "Roble & Lino Natural").
    public string Material { get; set; } = string.Empty;

    // Versión abreviada/descriptiva del material para fichas cortas.
    public string MaterialShort { get; set; } = string.Empty;

    // Precio de venta al público en soles, entre 0 y 10 millones.
    [Range(0, 10_000_000)]
    public decimal Price { get; set; }

    // Costo de producción/fabricación en soles, entre 0 y 10 millones.
    [Range(0, 10_000_000)]
    public decimal Cost { get; set; }

    // Disponibilidad: "stock" (hay unidades) o "custom" (se fabrica a pedido).
    public string Availability { get; set; } = "stock";

    // Nota textual de stock (ej.: "Stock: 3 unidades en Lima").
    public string StockNote { get; set; } = string.Empty;

    // Insignia comercial (ej.: "Entrega Inmediata", "A Pedido (15 días)").
    public string Badge { get; set; } = string.Empty;

    // Nota de guía/embarque (ej.: "Incluye IGV", "Medida 2.20m").
    public string Waybill { get; set; } = string.Empty;

    // Frase destacada corta para la ficha del producto.
    public string Tagline { get; set; } = string.Empty;

    // Descripción detallada del producto.
    public string Description { get; set; } = string.Empty;

    // Días estimados de fabricación cuando Availability == "custom" (0 si hay stock).
    public int DaysToBuild { get; set; }

    // Estado de publicación: "Publicado" (visible) o "Pausado" (oculto).
    public string Status { get; set; } = "Publicado";

    // URL de la imagen pública del producto.
    public string ImageUrl { get; set; } = string.Empty;

    // Unidades disponibles en el almacén/showroom de Miraflores.
    public int StockMiraflores { get; set; }

    // Unidades disponibles en el almacén de Villa El Salvador (taller VES).
    public int StockVes { get; set; }

    // Unidades disponibles en el almacén central de Lima.
    public int StockCentral { get; set; }

    /// <summary>
    /// Propiedad calculada: suma del stock disponible en los tres almacenes.
    /// </summary>
    public int TotalStock => StockMiraflores + StockVes + StockCentral;
}