namespace ClarisaBackend.Models;

/// <summary>
/// Categoría del catálogo de la tienda.
/// Define los agrupadores de productos: "Categoría de Estancia" (Salas,
/// Comedores, Dormitorios...) y "Colección Especial" (ediciones limitadas),
/// con su orden de prioridad, piezas y materiales que la componen.
/// </summary>
public class Category
{
    // Identificador único de la categoría (autogenerado).
    public int Id { get; set; }

    // Nombre público de la categoría (ej.: "Comedores Nobles & Mesas de Autor").
    public string Name { get; set; } = string.Empty;

    // Slug o identificador legible para URLs y filtros (ej.: "comedores-nobles").
    public string Slug { get; set; } = string.Empty;

    // Tipo de categoría: "Categoría de Estancia" o "Colección Especial".
    public string Type { get; set; } = string.Empty;

    // Prioridad de orden en el menú (menor número = aparece primero).
    public int Priority { get; set; }

    // Cantidad de piezas/productos que componen la categoría.
    public int Pieces { get; set; }

    // Lista de materiales o maderas usados en esta categoría.
    public string[] Materials { get; set; } = Array.Empty<string>();

    // Estado de visibilidad: "Menú Principal", "En Home & Menú", "Edición Limitada".
    public string Status { get; set; } = "Menú Principal";

    // Indica si la categoría debe destacarse visualmente (accent = true).
    public bool Accent { get; set; }

    // URL de la imagen de portada de la categoría.
    public string ImageUrl { get; set; } = string.Empty;
}