using ClarisaBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace ClarisaBackend.Data;

/// <summary>
/// Inicializa la base de datos con datos de demostración.
/// Se ejecuta al arrancar la API: crea las tablas (EnsureCreatedAsync) y
/// las rellena con productos, maderas, categorías, equipo y un
/// usuario administrador si la tabla de productos está vacía.
/// Los pedidos se dejan vacíos para registrar pedidos reales.
/// </summary>
public static class DbSeeder
{
    /// <summary>
    /// Agrega a la tabla "Orders" la columna "product_id" si no existe.
    /// Vincula cada pedido con una pieza del catálogo. Es idempotente: se puede
    /// ejecutar en cada arranque sin efectos secundarios.
    /// </summary>
    private static async Task EnsureOrderProductLinkAsync(ClarisaContext db, ILogger logger)
    {
        try
        {
            await db.Database.ExecuteSqlRawAsync(
                """
                ALTER TABLE "Orders" ADD COLUMN IF NOT EXISTS "product_id" integer NULL;
                """);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "No se pudo agregar la columna Orders.product_id. Revisa el esquema de la base de datos.");
        }
    }

    /// <summary>
    /// Punto de entrada de la siembra. Si la tabla de productos ya tiene datos,
    /// no hace nada (la DB ya fue inicializada en un arranque anterior).
    /// </summary>
    public static async Task InitializeAsync(ClarisaContext db, ILogger logger, string? initialAdminPassword = null)
    {
        // Asegura que la base de datos y todas las tablas definidas en el contexto existan.
        await db.Database.EnsureCreatedAsync();

        // EnsureCreated solo crea el esquema la primera vez: si la base ya existía
        // de una versión anterior, hay que añadir las columnas nuevas a mano.
        await EnsureOrderProductLinkAsync(db, logger);

        // Si ya hay productos, la siembra fue hecha previamente; se omite.
        if (await db.Products.AnyAsync())
            return;

        // Inserta todos los datos demo de una sola vez.
        db.Products.AddRange(SeedProducts);
        db.WoodLots.AddRange(SeedWoodLots);
        db.Categories.AddRange(SeedCategories);
        db.Staff.AddRange(SeedStaff);

        // Si se pasó una contraseña inicial (de user-secrets), se usa; si no,
        // se genera una aleatoria de 16 caracteres seguros.
        var password = string.IsNullOrWhiteSpace(initialAdminPassword)
            ? GeneratePassword()
            : initialAdminPassword;

        // Crea el usuario administrador por defecto: admin@clarisa.pe con rol SuperAdmin.
        db.AdminUsers.Add(new AdminUser
        {
            Email = "admin@clarisa.pe",
            Name = "Administrador Clarisa",
            Role = "SuperAdmin",
            PasswordHash = PasswordHasher.Hash(password),
        });

        // Persiste todos los registros insertados.
        await db.SaveChangesAsync();

        // Si la contraseña fue autogenerada, se loguea en la consola del servidor
        // para que el administrador pueda usarla el primer vez (contraseña temporal).
        if (initialAdminPassword is null)
        {
            logger.LogWarning(
                "Admin creado con contraseña temporal: admin@clarisa.pe / {Password}. Cámbiala en Postgres o borra el registro en la tabla AdminUsers.",
                password);
        }

        logger.LogInformation("Base de datos ClarisaMobiliario creada y sembrada con datos iniciales.");
    }

    /// <summary>
    /// Genera una contraseña aleatoria de 16 caracteres usando caracteres seguros
    /// sin símbolos ambiguos (ej.: sin O/0, l/I/1).
    /// </summary>
    private static string GeneratePassword()
    {
        var chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
        var buffer = new char[16];
        for (var i = 0; i < buffer.Length; i++)
            buffer[i] = chars[Random.Shared.Next(chars.Length)];
        return new string(buffer);
    }

    // =========================================================================
    // DATOS DE DEMOSTRACIÓN: 8 productos del catálogo de Clarisa Mobiliario
    // con precios, materiales, stock por almacén e imágenes públicas.
    // =========================================================================
    private static readonly Product[] SeedProducts =
    {
        // Sofá modular de 3 cuerpos con acabado en lino natural y estructura de roble.
        new()
        {
            Sku = "CLR-SOF-01", Name = "Sofá Modular Pachacámac", Category = "salas", CategoryLabel = "Salas",
            Material = "Roble & Lino Natural", MaterialShort = "Roble Americano & Lino Natural",
            Price = 4250, Cost = 2380, Availability = "stock", StockNote = "Stock: 3 unidades en Lima",
            Badge = "Entrega Inmediata", Waybill = "Incluye IGV",
            Tagline = "3 Cuerpos en lino natural y estructura robusta de roble curado. Cojines reversibles.",
            Description = "3 Cuerpos configurables, cojinería de alta resiliencia y tratamiento antimanchas.",
            DaysToBuild = 0, Status = "Publicado", StockMiraflores = 1, StockVes = 2, StockCentral = 0,
            ImageUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuDiLJf6QDf3pVLlpsEDe0p3cc7gj8tAi0LQPgk2Gd7zvxCNL0ozb3qzbSlRShgxeixK7utYLXtrySeh96OrjxwL6t1TENYg3ET7XiQsGzIwtVkNNYA7FIVla6pslltrWjVKXiCXGz5mExyxEnRDU7cl6mPcaIoNb6e10aM3G3_p58DvJu1pVOjCGYfEWgipVF2hdRcbY6k-JJ8IAjOkUSUqtPmufCBoGdyTnLf8di1g-bKmQ9A1ftrfeA"
        },
        // Mesa de comedor maciza de cedro amazónico, 2.20m para 8 personas.
        new()
        {
            Sku = "CLR-MES-04", Name = "Mesa de Comedor Urubamba", Category = "comedores", CategoryLabel = "Comedores",
            Material = "Cedro Macizo", MaterialShort = "Cedro Amazónico Macizo",
            Price = 3890, Cost = 2100, Availability = "custom", StockNote = "Fabricación en Taller Lima",
            Badge = "A Pedido (15 días)", Waybill = "Medida 2.20m",
            Tagline = "Madera maciza de cedro seleccionado con veta viva y acabado mate impermeable al tacto sedoso.",
            Description = "Tablero de 2.20m para 8 comensales con acabado en poliuretano al agua ultra-mate resistente a manchas.",
            DaysToBuild = 15, Status = "Publicado", StockMiraflores = 0, StockVes = 1, StockCentral = 0,
            ImageUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuBdJS1eaI9zvSCruMZP65RVpNytqOqY6Yc2pj8nvNIREedDZpx2sczejMMRR58n8ggBagjK3NaDXzplz4d3AWC8e3yswZojHPryN7a2b-WdV6xjGYzLLWqJaKEwlPY4cLOpe0Y6M0rhL63RY3BKyZI3ybaN3lfH1snmhWnV3WUwTQc9UHyhmiBS19SCYyV-usXnzv4S2H49QQCNA335gV9S-9ULIaffDvjt5iUG9Pf8Flm1k3-XT8rY9w"
        },
        // Sillón ocasional con tapiz terracota y brazos curvados de roble al vapor.
        new()
        {
            Sku = "CLR-SIL-02", Name = "Sillón Ocasional Máncora", Category = "asientos", CategoryLabel = "Sillones",
            Material = "Tapiz Terracota & Roble", MaterialShort = "Madera Curvada de Roble & Lino Terracota",
            Price = 1680, Cost = 890, Availability = "stock", StockNote = "Stock: 5 unidades en almacén",
            Badge = "En Stock", Waybill = "Entrega 48 hrs",
            Tagline = "Tapiz terracota cálido y brazos en madera curvada con técnica tradicional de ebanista.",
            Description = "Diseño de brazos sinuosos curvados al vapor. Ideal para rincón de lectura o remate de sala.",
            DaysToBuild = 0, Status = "Publicado", StockMiraflores = 2, StockVes = 0, StockCentral = 3,
            ImageUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuB4Wa34xUyVASDSbkszk_6MF9G2-84MgDk1LsgiXJtfutgXMSJkBaaXAnWynTlcu7CTjPR0rUbiAIvfj-KiaeWdSLHZkrC3wiPsVECPeA5T4ljv5ozOfo3EhvlDd2KtDnavPJj8FOVUxS3O47FWDaC8K3I7y2vIoYyS77ZMrzpTSFt88daVknxQovNfwf92hy_l8ghXl4TCfWSdMsIdEtSWnX2pUhYz-gZV-PcP7aMkPlr9Y2GxCclTlA"
        },
        // Aparador de roble macizo con puertas batientes y tejido artesanal de junco.
        new()
        {
            Sku = "CLR-APA-03", Name = "Aparador Paracas", Category = "salas", CategoryLabel = "Salas",
            Material = "Roble & Junco Tejido", MaterialShort = "Roble Peruano & Tejido de Junco",
            Price = 2950, Cost = 1540, Availability = "stock", StockNote = "Stock: 2 unidades disponibles",
            Badge = "En Stock", Waybill = "Largo 1.80m",
            Tagline = "Roble macizo con celosías en esterilla de junco tejida a mano por artesanos costeros.",
            Description = "Puertas batientes con amortiguación y tejido artesanal de la costa peruana. 1.80m de largo.",
            DaysToBuild = 0, Status = "Publicado", StockMiraflores = 2, StockVes = 0, StockCentral = 0,
            ImageUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuAR0s-pKT_Th7GET7QTfZWN3EnD9ZVpYYJAvaY6Tq5jsvnWdPBiqXTKNDnL9Dht2c6EKZ-rDjCa6PM1om86THWrkW550j9FAnE0-LWZOFTPYiPgoAZM9X1TbcmeafcBAD88WjVIr6jP0tiZWl2yV1Sj6lrXcBM0zTSKhpwZdL8yzIcO0J-dR4T1sMav9KofQfNkOic9nNUJIxHT93SzWP6fccqHnt4Ya5zC49YIfQhBMqfg69b9u7psSg"
        },
        // Cama queen con cabecera flotante de cedro y tapizado bouclé.
        new()
        {
            Sku = "CLR-CAM-08", Name = "Cama Queen Colca", Category = "dormitorios", CategoryLabel = "Dormitorios",
            Material = "Cedro & Bouclé", MaterialShort = "Cedro & Tapizado Bouclé",
            Price = 3400, Cost = 1810, Availability = "stock", StockNote = "Almacén Central Lima",
            Badge = "En Stock", Waybill = "Para Colchón Queen",
            Tagline = "Cabecera flotante en cedro con tapizado táctil bouclé que aporta serenidad y descanso.",
            Description = "Estructura flotante reforzada con largueros de tornillo curado y cabecera envolvente en bouclé hueso.",
            DaysToBuild = 0, Status = "Publicado", StockMiraflores = 0, StockVes = 0, StockCentral = 1,
            ImageUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuDhAfHOHotS93XEAhRCUrJd_dp097z6E2QqZ7N2rAlAKHyEtAdVJd5--Hy8as_gnj7rKas5U3C_aSS71rx2kbw_lSVaMdnGZUgng6rW8Y3pCiJIbNfN-GHD0ZCfXxwEV5jsNh1PxJBfSuiJbjuq0Ekba7hRv-49fbk2KY2nFVXfgFjuZjSc09aCn0fgyViLJrMlLE591KTPAUx4CMzjfMW8WbHzLdoIv4CRmYxicvl8_niO9MnAOAc6Rg"
        },
        // Mesa de centro de mármol travertino andino con base de cedro oscuro escultural.
        new()
        {
            Sku = "CLR-MES-09", Name = "Mesa de Centro Huascarán", Category = "mesas", CategoryLabel = "Mesas",
            Material = "Travertino & Cedro", MaterialShort = "Mármol Travertino Andino & Cedro",
            Price = 1450, Cost = 760, Availability = "stock", StockNote = "Stock: 4 unidades",
            Badge = "En Stock", Waybill = "Diámetro 90cm",
            Tagline = "Mármol travertino andino y base en cedro oscuro escultural de tres apoyos orgánicos.",
            Description = "Piedra travertino peruana pulida con sello mate antimanchas. Diámetro 90cm x 40cm alto.",
            DaysToBuild = 0, Status = "Publicado", StockMiraflores = 1, StockVes = 0, StockCentral = 3,
            ImageUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuC9-GWIDvFNh5FnN5MzorH5t3NcIG6DqG8x1HOd8GgvqgNjwLjQmPphmwnaLUFsEk50kqQOScDTublnmx3gRRCyNyUpX72cXtUnjwzKdtb-xIwgmb75oaRyxNNBGc6nfk9HUdxa8yraxkAdSTWPanAOGVLBdV5MYULA4xNsdbDpDKvrurhdEsCFBHu4eUTUSSHzzjfnxHshwwXJRYqH2HVBbArRa9vO-CTVoaSrL0k1_5ydiHGzjUHApw"
        },
        // Par de sillas de comedor con espaldar curvado ergonómico y lino antimanchas.
        new()
        {
            Sku = "CLR-SIL-11", Name = "Sillas Comedor Canta (x2)", Category = "comedores", CategoryLabel = "Comedores",
            Material = "Tornillo & Lino", MaterialShort = "Tornillo Curado & Lino Hueso",
            Price = 1120, Cost = 540, Availability = "stock", StockNote = "Stock: 6 sets de 2 unidades",
            Badge = "En Stock", Waybill = "Precio por el Par",
            Tagline = "Estructura en tornillo curado secado en horno y asiento en lino antimanchas tono hueso.",
            Description = "Espaldar curvado ergonómico que abraza la espalda. Precio incluye 2 sillas completamente armadas.",
            DaysToBuild = 0, Status = "Publicado", StockMiraflores = 6, StockVes = 0, StockCentral = 0,
            ImageUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuA_ly7cnXYTh93_32-a3zLNYhYlxBThsDM7jwwi3EtBr-HemGnWYj6HJFoQnXSeU7MvyXdilO73miRCnawAeGmtd5ZpHAkoE0goe76RpCTHqJa9yIaA51Tu8ZTzDtRfU_wIss9CHZyk3mVND-Qjy6hOzcTqcCgXRGk9T8Qiz9JAVdJRadZ3lHPT_WK3Q4bG0JDuPMzUFkBXjcIjCWhn5lSrJS7OPxgHJllXSfiCbE-Mcz6if26e6GU_zg"
        },
        // Estantería abierta con diseño geométrico inspirado en terrazas andinas.
        new()
        {
            Sku = "CLR-EST-05", Name = "Estantería Andina Abierta", Category = "salas", CategoryLabel = "Salas & Estudio",
            Material = "Maderas Nativas", MaterialShort = "Madera Nativa & Ensambles Ocultos",
            Price = 2350, Cost = 1280, Availability = "custom", StockNote = "Diseño a Escala Disponible",
            Badge = "A Pedido (15 días)", Waybill = "Alto 1.90m",
            Tagline = "Diseño geométrico minimalista inspirado en terrazas andinas con ensambles ciegos tradicionales.",
            Description = "5 baldas de madera maciza de cedro y tornillo con uniones machihembradas sin tornillos a la vista.",
            DaysToBuild = 15, Status = "Pausado", StockMiraflores = 0, StockVes = 0, StockCentral = 0,
            ImageUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuA_PAKnlq5yhhLxatAOD5awnT0drfnHYeOlhiAIFwGKDb_rjAHlLvAQ_Trci_4CW0vv8ExZ9YmwFu6gzks-5hAcRrFoW8SOOPBSd4MVcH706wcE31WB9uwSMTsUPe8q0SypbFUkcg3YeMNzh9zzzUux6Qz7iSv55NMsO7KNvWsdSKAYf3aKYuXdsCEIE2nm-4JUjy_KXmeqwN16ruIOGC7wogTqIpUSNOeMmzrWkuJr3HYsJltCvdUOBw"
        },
    };

    // =========================================================================
    // DATOS DE DEMOSTRACIÓN: 5 lotes de madera nativa peruana con trazabilidad
    // SERFOR, incluyendo especie, origen regional y estado de uso.
    // =========================================================================
    private static readonly WoodLot[] SeedWoodLots =
    {
        // Cedro rojo de Oxapampa, usado en sofá y mesa; actualmente en bancos de ensamble.
        new()
        {
            LotNumber = "LOT-CED-2025-08", Species = "Cedro Rojo de Oxapampa", Scientific = "Cedrela odorata",
            Region = "Pasco", GtfCode = "GTF 001-SERFOR-09412", Supplier = "Consorcio San Román",
            SupplierShort = "Cons. San Román", Volume = 8400, Humidity = "10.5%", ConditionText = "Óptimo",
            Stage = "En Bancos de Ensamble", StageShort = "En Ensamble", StageIcon = "handyman",
            UsedIn = "Sofá Pachacámac • Mesa Urubamba", Loads = 2, Received = "18 Ene 2025"
        },
        // Tornillo amazónico de Ucayali, usado en cama y sillas; en etapa de corte.
        new()
        {
            LotNumber = "LOT-TOR-2025-14", Species = "Tornillo Amazónico", Scientific = "Cedrelinga cateniformis",
            Region = "Ucayali", GtfCode = "GTF 014-SERFOR-03821", Supplier = "Maderas Nativas Pucallpa",
            SupplierShort = "Maderas Pucallpa", Volume = 12200, Humidity = "11.2%", ConditionText = "Seco Estufa",
            Stage = "En Habilitado & Corte", StageShort = "Corte", StageIcon = "content_cut",
            UsedIn = "Cama Colca • Sillas Canta", Loads = 3, Received = "02 Feb 2025"
        },
        // Nogal peruano seleccionado de Satipo; disponible en almacén VES.
        new()
        {
            LotNumber = "LOT-NOG-2025-03", Species = "Nogal Peruano Seleccionado", Scientific = "Juglans neotropica",
            Region = "Satipo, Junín", GtfCode = "GTF 004-SERFOR-01948", Supplier = "Bosques Manejados Satipo",
            SupplierShort = "Bosques Satipo", Volume = 5600, Humidity = "9.8%", ConditionText = "Equilibrio",
            Stage = "Stock Disponible (VES)", StageShort = "Stock VES", StageIcon = "warehouse",
            UsedIn = "Aparador Paracas • Colección Pachacámac", Loads = 1, Received = "09 Feb 2025"
        },
        // Moena amarilla de Madre de Dios; bajo stock, reservada para cabeceras.
        new()
        {
            LotNumber = "LOT-MOE-2025-01", Species = "Moena Amarilla", Scientific = "Aniba amazonica",
            Region = "Madre de Dios", GtfCode = "GTF 002-SERFOR-08472", Supplier = "Forestal San Francisco",
            SupplierShort = "Forestal SF", Volume = 4150, Humidity = "11.8%", ConditionText = "Bajo Stock (Alerta)",
            Stage = "Reservada para Cama Colca", StageShort = "Reservada", StageIcon = "reserved",
            UsedIn = "Cabeceras Dormitorios (Reserva)", Loads = 1, Received = "12 Feb 2025"
        },
        // Roble andino (openedor) de Cusco; 100% consumido en obras anteriores.
        new()
        {
            LotNumber = "LOT-ROB-2024-42", Species = "Roble Andino (Openedor)", Scientific = "Ocotea puberula",
            Region = "Cusco", GtfCode = "GTF 019-SERFOR-06120", Supplier = "Aserradero Valle Sagrado",
            SupplierShort = "Valle Sagrado", Volume = 0, Humidity = "—", ConditionText = "Consumido",
            Stage = "100% Consumido en Obras", StageShort = "Consumido", StageIcon = "verified",
            UsedIn = "Mesa Huascarán • Mesa Qochawasi", Loads = 2, Received = "28 Nov 2024"
        },
    };

    // =========================================================================
    // DATOS DE DEMOSTRACIÓN: 5 categorías del catálogo de muebles
    // (comedores, salas, dormitorios, colecciones especiales y escritorios).
    // =========================================================================
    private static readonly Category[] SeedCategories =
    {
        // Categoría destacada de comedores con prioridad alta.
        new()
        {
            Name = "Comedores Nobles & Mesas de Autor", Slug = "comedores-nobles", Type = "Categoría de Estancia",
            Priority = 1, Pieces = 6, Materials = new[] { "Cedro", "Tornillo", "Roble" }, Status = "En Home & Menú",
            Accent = true,
            ImageUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuB4I6BJxRG27IxIDkd_KnrEBsVnVLraVU5tii4NvkDfOBeDadGUSwdK1XufJzJiK5LIPkwMoFd5ehEMXeZVJ_3dYOLqzXhbwMCd8TOBo6GUgRtsmILBO1sYFRODUnfnxk1RETyKNDJ1V8Megdw2uLKid2NNGFSe845Qhk5vgVYfSyjmTwIUULz9e6KeJrkXLKINqHjQ_yjvrR25fymu9QmoRSnREh7APQXQK3Bb0OpHbbfoQgRlwJ4qmA"
        },
        // Categoría principal de salas de estar con piezas de autor.
        new()
        {
            Name = "Salas de Estar & Asientos", Slug = "salas", Type = "Categoría de Estancia",
            Priority = 2, Pieces = 8, Materials = new[] { "Nogal Amazónico", "Lino Puro" }, Status = "Menú Principal",
            Accent = false,
            ImageUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuCkJ8mWifJzpA1UwsHBXx-pnGgdG1doxjKWTRk-7pRpCpbHfHtV2u_RQdwqwyx5YSdCy05F4U-RFW8FRo7U7Hsmd-AsSZm4H72kIhPuTyDXfgDwxgLU9k8TGYBOehz3F11nIwKYSzTd-ToPFL0ai5wwFZs21nE0SBrB9xiCugsmEC6tdtVQdgpQE4MfwNtZif2xpmTp3bIaDBuh7dt4J17Qad8ltmVxnauxAruhHqox-4rvaQ0Z833PEw"
        },
        // Categoría de dormitorios con maderas nobles amazónicas.
        new()
        {
            Name = "Dormitorios & Descanso", Slug = "dormitorios", Type = "Categoría de Estancia",
            Priority = 3, Pieces = 4, Materials = new[] { "Moena", "Cedro" }, Status = "Menú Principal",
            Accent = false,
            ImageUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuB0PZm6w11Ok6A3KbQQ8p46AbwaKbJgzhEImG_rtX7hYmfKtDSFCYdOWFNXjxgPY-yGvoNWo038mg98faXWNHBJ6U9aygMRre4u1o7qLHgOBRhFpOk1Eu1Gbf4QAoVhTEW5wqAtfRrC6WIUeTyhKloyzt9P1LbtqYA11XydK_H8wVTz0XMtZeWETH7fQ-vJ_hsKldum6KfU8KerkvzJT_4PW40TI5-aaHKGbkTs8hw38lPNlvPcuOzKNQ"
        },
        // Colección especial (edición limitada) con diseño contemporáneo.
        new()
        {
            Name = "Colección Pachacámac", Slug = "pachacamac", Type = "Colección Especial",
            Priority = 0, Pieces = 5, Materials = new[] { "Tornillo Curado", "Fierro Quemado" }, Status = "Edición Limitada",
            Accent = true,
            ImageUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuCTQtO7Dgy5WK7SUnwbNIUH09xkz53UtTQzqKkoKrDeyxHgnNT2OHk9T2lvkCicclYC2qNAotLMWlDtLlaHkNosxgrHwU57C2GmMimQGyCvtu8UEbkO1j3mTLlaF4E_cMtHODdCR5sS4pBzgaxS84UhjMJ6WT0S-Xv9zRki2V2FvNbbHu9acwj4WH4BmPYjclA5Nv7aa3_7hVF-iERG8Wo3CEFK1AkZgyhxG2EgGi3VxEYuwrLWjxhQwg"
        },
        // Escritorios y espacio de estudio con materiales premium.
        new()
        {
            Name = "Escritorios & Estudio", Slug = "escritorios", Type = "Categoría de Estancia",
            Priority = 4, Pieces = 3, Materials = new[] { "Cedro Rojo", "Cuero Natural" }, Status = "Menú Principal",
            Accent = false,
            ImageUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuD0AM4fp_VTYt5SOBA-3rGTOUO9Wpc_ezfsR5cnGrYielFI3_ovhMUbnmuj1bm7kaWABgaH-D32eHpM9YocvsMpXy0qdTCpTQfFzhPcO3EZnJacmEbkwSC4ZwSygzF8O7LoJo3sFxGULJrWilj0cjk0FsrFiYL3d0aotKz7H4SUEKgenJlGwRI6wzxp3lgMqA4GKKJpIk-LAHaC80jJz1TdQsxLa_pu1HPRQY4oH5zIFtA5gTU_0G-g4g"
        },
    };

    // =========================================================================
    // DATOS DE DEMOSTRACIÓN: 5 miembros del equipo con sus roles y permisos.
    // =========================================================================
    private static readonly StaffMember[] SeedStaff =
    {
        // Administrador principal con control total del sistema.
        new()
        {
            Name = "Arq. Mateo Bianchi", Email = "mateo@clarisa.pe", Initials = "MB", Role = "SuperAdmin",
            Sede = "VES & Dirección", Permissions = new[] { "Control Total", "RLS / Precios S/.", "Postgres Root" },
            LastAccess = "Hace 4 min", Online = true, Active = true
        },
        // Jefe de ebanistería: gestiona stock, guías SERFOR y fases del taller.
        new()
        {
            Name = "Maestro Evaristo Quispe", Email = "taller.ves@clarisa.pe", Initials = "EQ", Role = "Jefe Ebanistería",
            Sede = "Taller VES", Permissions = new[] { "Stock Madera", "Guías SERFOR", "Fases Taller" },
            LastAccess = "Hoy 08:35", Online = true, Active = true
        },
        // Asesora de showroom: cotización por WhatsApp, citas y stock exhibido.
        new()
        {
            Name = "Luciana Valdivia", Email = "luciana@clarisa.pe", Initials = "LV", Role = "Asesora Showroom",
            Sede = "Showroom Miraflores", Permissions = new[] { "Cotizar WA", "Citas Galería", "Stock Exhibido" },
            LastAccess = "Hace 18 min", Online = true, Active = true
        },
        // Operador de WhatsApp: responde clientes y deriva al taller.
        new()
        {
            Name = "Diego Mendoza", Email = "atencion@clarisa.pe", Initials = "DM", Role = "Operador WhatsApp",
            Sede = "Sede Central (Remota)", Permissions = new[] { "Respuestas WA", "Derivar Taller" },
            LastAccess = "Ayer 18:40", Online = false, Active = true
        },
        // Finanzas: facturación SUNAT, adelantos 50% y reportes de cierre.
        new()
        {
            Name = "Carmen Rosa Ugarte", Email = "finanzas@clarisa.pe", Initials = "CU", Role = "Finanzas & Facturas",
            Sede = "Oficina Miraflores", Permissions = new[] { "Facturas SUNAT", "Adelantos 50%", "Reportes Cierre" },
            LastAccess = "Hoy 10:12", Online = true, Active = true
        },
    };
}