using ClarisaBackend.Data;
using ClarisaBackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClarisaBackend.Controllers;

/// <summary>
/// Controlador CRUD de productos del catálogo.
/// La lectura (GET) es pública (la usa la tienda); las operaciones de
/// escritura (POST/PUT/PATCH/DELETE) requieren autenticación.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class ProductsController(ClarisaContext db) : ControllerBase
{
    /// <summary>
    /// GET /api/products — Lista los productos de la tienda con filtros opcionales
    /// de búsqueda, categoría, disponibilidad, estado y ordenamiento.
    /// </summary>
    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<Product>>> GetAll(
        [FromQuery] string? search = null,
        [FromQuery] string? category = null,
        [FromQuery] string? availability = null,
        [FromQuery] string? status = null,
        [FromQuery] string? sort = null)
    {
        var query = db.Products.AsQueryable();

        // Búsqueda libre por nombre, sku, material o etiqueta de categoría.
        if (!string.IsNullOrWhiteSpace(search))
        {
            var q = search.Trim().ToLower();
            query = query.Where(p =>
                p.Name.ToLower().Contains(q) ||
                p.Sku.ToLower().Contains(q) ||
                p.Material.ToLower().Contains(q) ||
                p.CategoryLabel.ToLower().Contains(q));
        }

        // Filtra por categoría (etiqueta). "todos"/"all" = sin filtro.
        if (!string.IsNullOrWhiteSpace(category) && category != "todos" && category != "all")
            query = query.Where(p => p.CategoryLabel.ToLower().Contains(category.ToLower()));

        // Filtra por disponibilidad: "stock" (hay unidades) o "custom" (a pedido).
        if (!string.IsNullOrWhiteSpace(availability) && availability != "all")
            query = query.Where(p => p.Availability == availability);

        // Filtra por estado de publicación: "Publicado" o "Pausado".
        if (!string.IsNullOrWhiteSpace(status) && status != "all")
            query = query.Where(p => p.Status == status);

        var result = await query.ToListAsync();

        // Aplica el ordenamiento solicitado (por precio o por nombre).
        result = sort switch
        {
            "price-asc" => result.OrderBy(p => p.Price).ToList(),
            "price-desc" => result.OrderByDescending(p => p.Price).ToList(),
            "a-z" => result.OrderBy(p => p.Name).ToList(),
            _ => result,
        };

        return Ok(result);
    }

    /// <summary>
    /// GET /api/products/{id} — Devuelve un producto por su identificador.
    /// </summary>
    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<ActionResult<Product>> GetById(int id)
    {
        var product = await db.Products.FindAsync(id);
        return product is null ? NotFound() : Ok(product);
    }

    /// <summary>
    /// POST /api/products — Crea un nuevo producto en el catálogo.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<Product>> Create(Product product)
    {
        product.Id = 0; // El ID lo asigna la base de datos.
        db.Products.Add(product);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
    }

    /// <summary>
    /// POST /api/products/upload-image — Sube una imagen al servidor (wwwroot/uploads)
    /// y devuelve su URL pública para asignarla al producto.
    /// </summary>
    [HttpPost("upload-image")]
    public async Task<ActionResult<object>> UploadImage([FromForm] IFormFile file)
    {
        const long maxBytes = 5 * 1024 * 1024; // Límite de 5 MB.
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp", ".gif" };

        if (file is null || file.Length == 0)
            return BadRequest("Selecciona un archivo de imagen.");

        if (file.Length > maxBytes)
            return BadRequest("La imagen no puede superar los 5 MB.");

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(extension))
            return BadRequest("Formato no permitido. Usa JPG, PNG, WEBP o GIF.");

        // Carpeta donde se persisten las imágenes subidas.
        var uploadDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
        Directory.CreateDirectory(uploadDir);

        // Nombre único para evitar colisiones y path traversal.
        var fileName = $"{Guid.NewGuid():N}{extension}";
        var fullPath = Path.Combine(uploadDir, fileName);

        await using (var stream = new FileStream(fullPath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        // URL pública: el frontend la guarda en ImageUrl del producto.
        var url = $"{Request.Scheme}://{Request.Host}{Request.PathBase}/uploads/{fileName}";
        return Ok(new { url });
    }

    /// <summary>
    /// PUT /api/products/{id} — Actualiza completamente un producto existente.
    /// </summary>
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, Product product)
    {
        // El ID en la URL debe coincidir con el ID del cuerpo de la petición.
        if (id != product.Id)
            return BadRequest("El id del body no coincide con la URL.");

        // Marca la entidad como modificada para que EF Core actualice todo el registro.
        db.Entry(product).State = EntityState.Modified;
        try
        {
            await db.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            // Si el registro fue eliminado mientras tanto, devuelve 404.
            if (!await db.Products.AnyAsync(p => p.Id == id))
                return NotFound();
            throw;
        }
        return NoContent();
    }

    /// <summary>
    /// PATCH /api/products/{id}/status — Alterna el estado de un producto entre
    /// "Publicado" y "Pausado" (mostrar/ocultar en la tienda).
    /// </summary>
    [HttpPatch("{id:int}/status")]
    public async Task<IActionResult> SetStatus(int id, [FromBody] string status)
    {
        var product = await db.Products.FindAsync(id);
        if (product is null)
            return NotFound();

        // Solo se permiten los dos estados válidos; cualquier otro valor → "Pausado".
        product.Status = status == "Publicado" ? "Publicado" : "Pausado";
        await db.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>
    /// DELETE /api/products/{id} — Elimina un producto del catálogo.
    /// </summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var product = await db.Products.FindAsync(id);
        if (product is null)
            return NotFound();

        db.Products.Remove(product);
        await db.SaveChangesAsync();
        return NoContent();
    }
}