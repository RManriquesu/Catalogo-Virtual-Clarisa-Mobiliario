// ============================================================
// Datos demo del catálogo de productos (tienda pública y panel).
// products: piezas del catálogo. Estructura del objeto:
//   id, sku, name, category (slug), categoryLabel, material,
//   materialShort, price, cost, availability (stock|custom), stockNote,
//   badge, waybill, tagline, description, days (fabricación), warehouses
//   (stock por almacén: miraflores, ves, central), status (Publicado|Pausado),
//   image.
// categories: nombres usados como filtros de la tienda.
// WhatsAppNumber: número de WhatsApp al que se envían las cotizaciones.
// waLink(): genera el enlace de WhatsApp para una pieza.
// ============================================================

export const products = [
  {
    id: 1,
    sku: 'CLR-SOF-01',
    name: 'Sofá Modular Pachacámac',
    category: 'salas',
    categoryLabel: 'Salas',
    material: 'Roble & Lino Natural',
    materialShort: 'Roble Americano & Lino Natural',
    price: 4250,
    cost: 2380,
    availability: 'stock',
    stockNote: 'Stock: 3 unidades en Lima',
    badge: 'Entrega Inmediata',
    waybill: 'Incluye IGV',
    tagline: '3 Cuerpos en lino natural y estructura robusta de roble curado. Cojines reversibles.',
    description: '3 Cuerpos configurables, cojinería de alta resiliencia y tratamiento antimanchas.',
    days: 0,
    warehouses: { miraflores: 1, ves: 2, central: 0 },
    status: 'Publicado',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDiLJf6QDf3pVLlpsEDe0p3cc7gj8tAi0LQPgk2Gd7zvxCNL0ozb3qzbSlRShgxeixK7utYLXtrySeh96OrjxwL6t1TENYg3ET7XiQsGzIwtVkNNYA7FIVla6pslltrWjVKXiCXGz5mExyxEnRDU7cl6mPcaIoNb6e10aM3G3_p58DvJu1pVOjCGYfEWgipVF2hdRcbY6k-JJ8IAjOkUSUqtPmufCBoGdyTnLf8di1g-bKmQ9A1ftrfeA',
  },
  {
    id: 2,
    sku: 'CLR-MES-04',
    name: 'Mesa de Comedor Urubamba',
    category: 'comedores',
    categoryLabel: 'Comedores',
    material: 'Cedro Macizo',
    materialShort: 'Cedro Amazónico Macizo',
    price: 3890,
    cost: 2100,
    availability: 'custom',
    stockNote: 'Fabricación en Taller Lima',
    badge: 'A Pedido (15 días)',
    waybill: 'Medida 2.20m',
    tagline: 'Madera maciza de cedro seleccionado con veta viva y acabado mate impermeable al tacto sedoso.',
    description: 'Tablero de 2.20m para 8 comensales con acabado en poliuretano al agua ultra-mate resistente a manchas.',
    days: 15,
    warehouses: { miraflores: 0, ves: 1, central: 0 },
    status: 'Publicado',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBdJS1eaI9zvSCruMZP65RVpNytqOqY6Yc2pj8nvNIREedDZpx2sczejMMRR58n8ggBagjK3NaDXzplz4d3AWC8e3yswZojHPryN7a2b-WdV6xjGYzLLWqJaKEwlPY4cLOpe0Y6M0rhL63RY3BKyZI3ybaN3lfH1snmhWnV3WUwTQc9UHyhmiBS19SCYyV-usXnzv4S2H49QQCNA335gV9S-9ULIaffDvjt5iUG9Pf8Flm1k3-XT8rY9w',
  },
  {
    id: 3,
    sku: 'CLR-SIL-02',
    name: 'Sillón Ocasional Máncora',
    category: 'asientos',
    categoryLabel: 'Sillones',
    material: 'Tapiz Terracota & Roble',
    materialShort: 'Madera Curvada de Roble & Lino Terracota',
    price: 1680,
    cost: 890,
    availability: 'stock',
    stockNote: 'Stock: 5 unidades en almacén',
    badge: 'En Stock',
    waybill: 'Entrega 48 hrs',
    tagline: 'Tapiz terracota cálido y brazos en madera curvada con técnica tradicional de ebanista.',
    description: 'Diseño de brazos sinuosos curvados al vapor. Ideal para rincón de lectura o remate de sala.',
    days: 0,
    warehouses: { miraflores: 2, ves: 0, central: 3 },
    status: 'Publicado',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB4Wa34xUyVASDSbkszk_6MF9G2-84MgDk1LsgiXJtfutgXMSJkBaaXAnWynTlcu7CTjPR0rUbiAIvfj-KiaeWdSLHZkrC3wiPsVECPeA5T4ljv5ozOfo3EhvlDd2KtDnavPJj8FOVUxS3O47FWDaC8K3I7y2vIoYyS77ZMrzpTSFt88daVknxQovNfwf92hy_l8ghXl4TCfWSdMsIdEtSWnX2pUhYz-gZV-PcP7aMkPlr9Y2GxCclTlA',
  },
  {
    id: 4,
    sku: 'CLR-APA-03',
    name: 'Aparador Paracas',
    category: 'salas',
    categoryLabel: 'Salas',
    material: 'Roble & Junco Tejido',
    materialShort: 'Roble Peruano & Tejido de Junco',
    price: 2950,
    cost: 1540,
    availability: 'stock',
    stockNote: 'Stock: 2 unidades disponibles',
    badge: 'En Stock',
    waybill: 'Largo 1.80m',
    tagline: 'Roble macizo con celosías en esterilla de junco tejida a mano por artesanos costeros.',
    description: 'Puertas batientes con amortiguación y tejido artesanal de la costa peruana. 1.80m de largo.',
    days: 0,
    warehouses: { miraflores: 2, ves: 0, central: 0 },
    status: 'Publicado',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAR0s-pKT_Th7GET7QTfZWN3EnD9ZVpYYJAvaY6Tq5jsvnWdPBiqXTKNDnL9Dht2c6EKZ-rDjCa6PM1om86THWrkW550j9FAnE0-LWZOFTPYiPgoAZM9X1TbcmeafcBAD88WjVIr6jP0tiZWl2yV1Sj6lrXcBM0zTSKhpwZdL8yzIcO0J-dR4T1sMav9KofQfNkOic9nNUJIxHT93SzWP6fccqHnt4Ya5zC49YIfQhBMqfg69b9u7psSg',
  },
  {
    id: 5,
    sku: 'CLR-CAM-08',
    name: 'Cama Queen Colca',
    category: 'dormitorios',
    categoryLabel: 'Dormitorios',
    material: 'Cedro & Bouclé',
    materialShort: 'Cedro & Tapizado Bouclé',
    price: 3400,
    cost: 1810,
    availability: 'stock',
    stockNote: 'Almacén Central Lima',
    badge: 'En Stock',
    waybill: 'Para Colchón Queen',
    tagline: 'Cabecera flotante en cedro con tapizado táctil bouclé que aporta serenidad y descanso.',
    description: 'Estructura flotante reforzada con largueros de tornillo curado y cabecera envolvente en bouclé hueso.',
    days: 0,
    warehouses: { miraflores: 0, ves: 0, central: 1 },
    status: 'Publicado',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDhAfHOHotS93XEAhRCUrJd_dp097z6E2QqZ7N2rAlAKHyEtAdVJd5--Hy8as_gnj7rKas5U3C_aSS71rx2kbw_lSVaMdnGZUgng6rW8Y3pCiJIbNfN-GHD0ZCfXxwEV5jsNh1PxJBfSuiJbjuq0Ekba7hRv-49fbk2KY2nFVXfgFjuZjSc09aCn0fgyViLJrMlLE591KTPAUx4CMzjfMW8WbHzLdoIv4CRmYxicvl8_niO9MnAOAc6Rg',
  },
  {
    id: 6,
    sku: 'CLR-MES-09',
    name: 'Mesa de Centro Huascarán',
    category: 'mesas',
    categoryLabel: 'Mesas',
    material: 'Travertino & Cedro',
    materialShort: 'Mármol Travertino Andino & Cedro',
    price: 1450,
    cost: 760,
    availability: 'stock',
    stockNote: 'Stock: 4 unidades',
    badge: 'En Stock',
    waybill: 'Diámetro 90cm',
    tagline: 'Mármol travertino andino y base en cedro oscuro escultural de tres apoyos orgánicos.',
    description: 'Piedra travertino peruana pulida con sello mate antimanchas. Diámetro 90cm x 40cm alto.',
    days: 0,
    warehouses: { miraflores: 1, ves: 0, central: 3 },
    status: 'Publicado',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC9-GWIDvFNh5FnN5MzorH5t3NcIG6DqG8x1HOd8GgvqgNjwLjQmPphmwnaLUFsEk50kqQOScDTublnmx3gRRCyNyUpX72cXtUnjwzKdtb-xIwgmb75oaRyxNNBGc6nfk9HUdxa8yraxkAdSTWPanAOGVLBdV5MYULA4xNsdbDpDKvrurhdEsCFBHu4eUTUSSHzzjfnxHshwwXJRYqH2HVBbArRa9vO-CTVoaSrL0k1_5ydiHGzjUHApw',
  },
  {
    id: 7,
    sku: 'CLR-SIL-11',
    name: 'Sillas Comedor Canta (x2)',
    category: 'comedores',
    categoryLabel: 'Comedores',
    material: 'Tornillo & Lino',
    materialShort: 'Tornillo Curado & Lino Hueso',
    price: 1120,
    cost: 540,
    availability: 'stock',
    stockNote: 'Stock: 6 sets de 2 unidades',
    badge: 'En Stock',
    waybill: 'Precio por el Par',
    tagline: 'Estructura en tornillo curado secado en horno y asiento en lino antimanchas tono hueso.',
    description: 'Espaldar curvado ergonómico que abraza la espalda. Precio incluye 2 sillas completamente armadas.',
    days: 0,
    warehouses: { miraflores: 6, ves: 0, central: 0 },
    status: 'Publicado',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA_ly7cnXYTh93_32-a3zLNYhYlxBThsDM7jwwi3EtBr-HemGnWYj6HJFoQnXSeU7MvyXdilO73miRCnawAeGmtd5ZpHAkoE0goe76RpCTHqJa9yIaA51Tu8ZTzDtRfU_wIss9CHZyk3mVND-Qjy6hOzcTqcCgXRGk9T8Qiz9JAVdJRadZ3lHPT_WK3Q4bG0JDuPMzUFkBXjcIjCWhn5lSrJS7OPxgHJllXSfiCbE-Mcz6if26e6GU_zg',
  },
  {
    id: 8,
    sku: 'CLR-EST-05',
    name: 'Estantería Andina Abierta',
    category: 'salas',
    categoryLabel: 'Salas & Estudio',
    material: 'Maderas Nativas',
    materialShort: 'Madera Nativa & Ensambles Ocultos',
    price: 2350,
    cost: 1280,
    availability: 'custom',
    stockNote: 'Diseño a Escala Disponible',
    badge: 'A Pedido (15 días)',
    waybill: 'Alto 1.90m',
    tagline: 'Diseño geométrico minimalista inspirado en terrazas andinas con ensambles ciegos tradicionales.',
    description: '5 baldas de madera maciza de cedro y tornillo con uniones machihembradas sin tornillos a la vista.',
    days: 15,
    warehouses: { miraflores: 0, ves: 0, central: 0 },
    status: 'Pausado',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA_PAKnlq5yhhLxatAOD5awnT0drfnHYeOlhiAIFwGKDb_rjAHlLvAQ_Trci_4CW0vv8ExZ9YmwFu6gzks-5hAcRrFoW8SOOPBSd4MVcH706wcE31WB9uwSMTsUPe8q0SypbFUkcg3YeMNzh9zzzUux6Qz7iSv55NMsO7KNvWsdSKAYf3aKYuXdsCEIE2nm-4JUjy_KXmeqwN16ruIOGC7wogTqIpUSNOeMmzrWkuJr3HYsJltCvdUOBw',
  },
]

// Nombres de categorías que se muestran como filtros en la tienda pública.
export const categories = [
  'Todos',
  'Salas',
  'Comedores',
  'Dormitorios',
  'Mesas de Centro',
  'Sillas y Sillones',
]

// Número a donde llegan las cotizaciones de WhatsApp (sin el +).
// 51 = código de Perú, 959851877 = número local de Clarisa Mobiliario.
export const WhatsAppNumber = '51959851877'

// Mismo número en formato legible para mostrar en texts y footers.
export const WhatsAppDisplay = '+51 959 851 877'

// Genera el enlace de WhatsApp para cotizar una pieza.
export function waLink(name, priceLabel, suffix = '') {
  const text = `Hola Clarisa Mobiliario, deseo ${suffix || `comprar el ${name} (${priceLabel})`}.`
  return `https://wa.me/${WhatsAppNumber}?text=${encodeURIComponent(text)}`
}