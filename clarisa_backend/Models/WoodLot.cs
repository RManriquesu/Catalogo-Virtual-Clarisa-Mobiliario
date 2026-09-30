namespace ClarisaBackend.Models;

/// <summary>
/// Lote de madera con trazabilidad SERFOR.
/// Registra cada compra de madera nativa peruana: especie, región de origen,
/// código GTF (guía de transporte forestal), proveedor y el estado actual
/// de su uso en el taller (etapa del proceso productivo).
/// </summary>
public class WoodLot
{
    // Identificador único del lote (autogenerado).
    public int Id { get; set; }

    // Número de lote interno (ej.: "LOT-CED-2025-08").
    public string LotNumber { get; set; } = string.Empty;

    // Nombre común de la especie de madera (ej.: "Cedro Rojo de Oxapampa").
    public string Species { get; set; } = string.Empty;

    // Nombre científico de la especie (ej.: "Cedrela odorata").
    public string Scientific { get; set; } = string.Empty;

    // Región o departamento de origen de la madera (ej.: "Pasco").
    public string Region { get; set; } = string.Empty;

    // Código de la Guía de Transporte Forestal (GTF) emitida por SERFOR.
    public string GtfCode { get; set; } = string.Empty;

    // Nombre completo del proveedor de la madera.
    public string Supplier { get; set; } = string.Empty;

    // Nombre abreviado del proveedor para mostrar en tablas compactas.
    public string SupplierShort { get; set; } = string.Empty;

    // Volumen del lote en pies tablares (pt).
    public int Volume { get; set; }

    // Porcentaje de humedad de la madera (ej.: "10.5%"), clave para su secado.
    public string Humidity { get; set; } = string.Empty;

    // Condición del lote (ej.: "Óptimo", "Seco Estufa", "Bajo Stock (Alerta)").
    public string ConditionText { get; set; } = string.Empty;

    // Etapa del proceso productivo en la que se usa el lote (ej.: "En Ensamble").
    public string Stage { get; set; } = string.Empty;

    // Versión corta de la etapa para chips/etiquetas.
    public string StageShort { get; set; } = string.Empty;

    // Nombre del ícono (Material Symbols) asociado a la etapa.
    public string StageIcon { get; set; } = string.Empty;

    // Productos/piezas donde se ha utilizado o está reservado este lote.
    public string UsedIn { get; set; } = string.Empty;

    // Cantidad de cargas/guías de transporte recibidas para este lote.
    public int Loads { get; set; }

    // Fecha de recepción del lote en el taller (ej.: "18 Ene 2025").
    public string Received { get; set; } = string.Empty;
}