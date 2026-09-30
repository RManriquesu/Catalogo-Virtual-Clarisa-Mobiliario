using ClarisaBackend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClarisaBackend.Controllers;

/// <summary>
/// Controlador de categorías del catálogo.
/// Expone la lista de categorías, pública (la consume la tienda y el panel).
/// </summary>
[ApiController]
[Route("api/categories")]
[AllowAnonymous]
public class CategoriesController(ClarisaContext db) : ControllerBase
{
    /// <summary>
    /// GET /api/categories — Devuelve todas las categorías ordenadas por prioridad (menor primero).
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await db.Categories.OrderBy(c => c.Priority).ToListAsync());
}