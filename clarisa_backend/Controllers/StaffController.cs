using ClarisaBackend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClarisaBackend.Controllers;

/// <summary>
/// Controlador de miembros del equipo.
/// Expone la lista del personal de Clarisa Mobiliario para el panel de gestión.
/// </summary>
[ApiController]
[Route("api/staff")]
public class StaffController(ClarisaContext db) : ControllerBase
{
    /// <summary>
    /// GET /api/staff — Devuelve todos los miembros del equipo ordenados por ID.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await db.Staff.OrderBy(s => s.Id).ToListAsync());
}