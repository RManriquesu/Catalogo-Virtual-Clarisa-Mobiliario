using ClarisaBackend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClarisaBackend.Controllers;

/// <summary>
/// Controlador del panel de métricas (Dashboard).
/// Agrega datos operativos de la tienda: pedidos, productos, madera y stock.
/// </summary>
[ApiController]
[Route("api/dashboard")]
public class DashboardController(ClarisaContext db) : ControllerBase
{
    /// <summary>
    /// GET /api/dashboard/summary — Devuelve el resumen de KPIs del panel:
    /// ingresos, número de pedidos y su estado, stock, valor y trazabilidad de madera.
    /// </summary>
    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        // Carga todos los registros de pedidos, productos y lotes de madera.
        var orders = await db.Orders.ToListAsync();
        var products = await db.Products.ToListAsync();
        var woodLots = await db.WoodLots.ToListAsync();

        // Devuelve un objeto anónimo con las métricas calculadas sobre los datos cargados.
        return Ok(new
        {
            // Ingreso de los últimos 30 días (valor de demo fijo).
            Revenue30Days = 248920m,

            // Total de pedidos registrados.
            OrderCount = orders.Count,

            // Pedidos según su estado de producción/entrega.
            PendingOrders = orders.Count(o => o.Status == "pendiente"),
            InWorkshop = orders.Count(o => o.Status == "taller"),
            InTransit = orders.Count(o => o.Status == "ruta"),

            // Porcentaje de entregas a tiempo (valor de demo).
            OnTimeDelivery = 94.0m,

            // Cantidad de productos publicados en el catálogo.
            ProductsInCatalog = products.Count,

            // Unidades totales disponibles sumando los tres almacenes.
            TotalStockUnits = products.Sum(p => p.TotalStock),

            // Valor económico del stock:
            // - unidades en stock valorizadas a precio de venta;
            // - unidades faltantes para llegar a 100 valorizadas a costo.
            StockValue = products.Sum(p => p.Price * p.TotalStock) + products.Sum(p => p.Cost * Math.Max(0, 100 - p.TotalStock)),

            // Trazabilidad de madera: volumen total en custodia.
            WoodVolumeTotal = woodLots.Sum(w => w.Volume),

            // Número de especies de madera distintas.
            WoodSpecies = woodLots.Select(w => w.Species).Distinct().Count(),

            // Total de guías/GTF cargadas.
            WoodGuides = woodLots.Sum(w => w.Loads),

            // Número de proveedores distintos.
            WoodSuppliers = woodLots.Select(w => w.Supplier).Distinct().Count(),

            // Suma de precios de todos los pedidos (valor total en cartera).
            TotalValue = orders.Sum(o => o.Price),
        });
    }
}