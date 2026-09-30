using ClarisaBackend.Data;
using ClarisaBackend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClarisaBackend.Controllers;

/// <summary>
/// Controlador de pedidos de clientes.
/// Permite listar (con filtros), consultar, crear y cambiar el estado de los pedidos.
/// </summary>
[ApiController]
[Route("api/orders")]
public class OrdersController(ClarisaContext db) : ControllerBase
{
    /// <summary>
    /// GET /api/orders — Lista los pedidos con filtros opcionales de estado y búsqueda.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? status = null, [FromQuery] string? search = null)
    {
        var query = db.Orders.AsQueryable();

        // Filtra por estado del pedido (pendiente, taller, acabado, ruta, entregado).
        // "todos" o vacío = sin filtro.
        if (!string.IsNullOrWhiteSpace(status) && status != "todos")
            query = query.Where(o => o.Status == status);

        // Búsqueda libre por nombre de cliente, número de orden o producto solicitado.
        if (!string.IsNullOrWhiteSpace(search))
        {
            var q = search.Trim().ToLower();
            query = query.Where(o =>
                o.Client.ToLower().Contains(q) ||
                o.OrderNumber.ToLower().Contains(q) ||
                o.Item.ToLower().Contains(q));
        }

        // Devuelve los pedidos ordenados del más reciente al más antiguo.
        return Ok(await query.OrderByDescending(o => o.Id).ToListAsync());
    }

    /// <summary>
    /// GET /api/orders/{id} — Devuelve un pedido por su identificador.
    /// </summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<Order>> GetById(int id)
    {
        var order = await db.Orders.FindAsync(id);
        return order is null ? NotFound() : Ok(order);
    }

    /// <summary>
    /// POST /api/orders — Crea un nuevo pedido asignándole un número correlativo.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<Order>> Create(Order order)
    {
        // Calcula el siguiente número de orden: busca el último correlativo CLR-XXXX.
        var last = await db.Orders.OrderByDescending(o => o.Id).Select(o => o.OrderNumber).FirstOrDefaultAsync();
        var next = 1048; // Valor base inicial cuando aún no existe ningún pedido.
        if (last is not null && last.StartsWith("CLR-") && int.TryParse(last[4..], out var n))
            next = n + 1;

        // Configura los campos con valores por defecto antes de guardar.
        order.Id = 0; // El ID lo genera la base de datos.
        order.OrderNumber = $"CLR-{next}";
        order.Status = string.IsNullOrWhiteSpace(order.Status) ? "pendiente" : order.Status;
        order.CreatedAt = DateTime.UtcNow;

        // Persiste el pedido y lo devuelve con su ID/estado final.
        db.Orders.Add(order);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = order.Id }, order);
    }

    /// <summary>
    /// PATCH /api/orders/{id}/status — Actualiza el estado de un pedido
    /// (ej.: "pendiente" → "taller" → "acabado" → "ruta" → "entregado").
    /// </summary>
    [HttpPatch("{id:int}/status")]
    public async Task<IActionResult> SetStatus(int id, [FromBody] string status)
    {
        var order = await db.Orders.FindAsync(id);
        if (order is null)
            return NotFound();

        // Asigna el nuevo estado y guarda los cambios.
        order.Status = status;
        await db.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>
    /// PATCH /api/orders/{id}/payment — Actualiza el estado de pago del pedido
    /// (independiente de su etapa de producción). Body: { "paymentKind", "payment" }.
    /// </summary>
    [HttpPatch("{id:int}/payment")]
    public async Task<IActionResult> SetPayment(int id, [FromBody] OrderPaymentUpdate update)
    {
        var order = await db.Orders.FindAsync(id);
        if (order is null)
            return NotFound();

        // El tipo de pago controla la insignia de color; el texto es descriptivo.
        order.PaymentKind = string.IsNullOrWhiteSpace(update.PaymentKind) ? order.PaymentKind : update.PaymentKind;
        if (!string.IsNullOrWhiteSpace(update.Payment))
            order.Payment = update.Payment;

        await db.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>
    /// DELETE /api/orders/{id} — Elimina un pedido. Solo permitido para pedidos pendientes.
    /// </summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var order = await db.Orders.FindAsync(id);
        if (order is null)
            return NotFound();

        if (!string.Equals(order.Status, "pendiente", StringComparison.OrdinalIgnoreCase))
            return BadRequest(new { message = "Solo se pueden eliminar pedidos con estado 'pendiente'." });

        db.Orders.Remove(order);
        await db.SaveChangesAsync();
        return NoContent();
    }
}

/// <summary>
/// Datos mínimos para actualizar el pago de un pedido.
/// </summary>
public class OrderPaymentUpdate
{
    // Tipo de pago: "full" (100% pagado), "partial" (adelanto) o "none" (sin pago).
    public string? PaymentKind { get; set; }

    // Texto descriptivo del pago (opcional; si viene vacío se conserva el actual).
    public string? Payment { get; set; }
}