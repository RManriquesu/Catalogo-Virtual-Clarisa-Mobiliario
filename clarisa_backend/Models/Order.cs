using System.ComponentModel.DataAnnotations;

namespace ClarisaBackend.Models;

/// <summary>
/// Pedido de un cliente (normalmente gestionado a través de WhatsApp).
/// Contiene la información de la compra: cliente, producto solicitado,
/// monto, método de pago y el estado del proceso de fabricación/entrega.
/// </summary>
public class Order
{
    // Identificador único del pedido (autogenerado).
    public int Id { get; set; }

    // Número de orden correlativo de la tienda (ej.: "CLR-1049").
    public string OrderNumber { get; set; } = string.Empty;

    // Nombre del cliente que realiza el pedido (obligatorio, 3-80 caracteres).
    [Required, StringLength(80, MinimumLength = 3)]
    public string Client { get; set; } = string.Empty;

    // Teléfono del cliente con formato de display (ej.: "+51 984 321 890").
    public string? Phone { get; set; }

    // Teléfono en formato crudo para enlaces wa.me (ej.: "51984321890").
    public string? PhoneRaw { get; set; }

    // Distrito/ubicación de entrega o tienda (ej.: "Miraflores, Lima").
    public string District { get; set; } = string.Empty;

    // Fecha/hora en que se registró el pedido (ej.: "Hoy, 10:24 am").
    public string Time { get; set; } = string.Empty;

    // Producto/pieza solicitada (obligatorio, 3-120 caracteres).
    [Required, StringLength(120, MinimumLength = 3)]
    public string Item { get; set; } = string.Empty;

    // Especificaciones técnicas del pedido (ej.: "Roble & Lino • 3 Cuerpos").
    public string? Spec { get; set; }

    // Precio acordado del pedido en soles, entre 0 y 10 millones.
    [Range(0, 10_000_000)]
    public decimal Price { get; set; }

    // Texto descriptivo del pago recibido (ej.: "50% pagado (S/. 2,125)").
    public string Payment { get; set; } = string.Empty;

    // Tipo de pago: "full" (100% pagado), "partial" (adelanto) o "none" (sin pago).
    public string PaymentKind { get; set; } = "none";

    // Estado del pedido: pendiente, taller, acabado, ruta, o entregado.
    public string Status { get; set; } = "pendiente";

    // URL de la imagen del producto asociado al pedido.
    public string ImageUrl { get; set; } = string.Empty;

    // Vínculo opcional al producto del catálogo (para mantener nombres/imagen consistentes).
    public int? ProductId { get; set; }
    public Product? Product { get; set; }

    // Fecha y hora (UTC) en que se creó el pedido en el sistema.
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}