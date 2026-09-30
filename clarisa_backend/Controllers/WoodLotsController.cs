using ClarisaBackend.Data;
using ClarisaBackend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClarisaBackend.Controllers;

/// <summary>
/// Controlador de lotes de madera (trazabilidad SERFOR).
/// Permite listar los lotes con filtros de condición y búsqueda, y crear nuevos lotes.
/// </summary>
[ApiController]
[Route("api/woodlots")]
public class WoodLotsController(ClarisaContext db) : ControllerBase
{
    /// <summary>
    /// GET /api/woodlots — Lista los lotes de madera ordenados por volumen descendente.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? condition = null, [FromQuery] string? search = null)
    {
        var query = db.WoodLots.AsQueryable();

        // Filtra por condición del lote (ej.: "Óptimo", "Seco Estufa").
        // "todas" o vacío = sin filtro.
        if (!string.IsNullOrWhiteSpace(condition) && condition != "todas")
            query = query.Where(w => w.ConditionText.Contains(condition));

        // Búsqueda libre por especie, número de lote o proveedor.
        if (!string.IsNullOrWhiteSpace(search))
        {
            var q = search.Trim().ToLower();
            query = query.Where(w =>
                w.Species.ToLower().Contains(q) ||
                w.LotNumber.ToLower().Contains(q) ||
                w.Supplier.ToLower().Contains(q));
        }

        return Ok(await query.OrderByDescending(w => w.Volume).ToListAsync());
    }

    /// <summary>
    /// POST /api/woodlots — Crea un nuevo lote de madera en el sistema.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create(WoodLot lot)
    {
        lot.Id = 0; // El ID lo asigna la base de datos.
        db.WoodLots.Add(lot);
        await db.SaveChangesAsync();
        return Ok(lot);
    }
}