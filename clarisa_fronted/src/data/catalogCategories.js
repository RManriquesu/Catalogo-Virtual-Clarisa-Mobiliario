// ============================================================
// Datos demo de la página "Categorías y colecciones".
// categories: agrupaciones del catálogo (categorías de estancia y
//   colecciones de autor). Estructura del objeto:
//   id, name, slug (URL pública), type, priority (orden en menú),
//   pieces, materials, status, accent (color oscuro del badge),
//   limited (edición limitada), image.
// catalogStatus: números resumen del estado del catálogo.
// ============================================================

export const categories = [
  {
    id: 'cat_comedores_0921',
    name: 'Comedores Nobles & Mesas de Autor',
    slug: 'comedores-nobles',
    type: 'Categoría de Estancia',
    priority: 1,
    pieces: 6,
    materials: ['Cedro', 'Tornillo', 'Roble'],
    status: 'En Home & Menú',
    accent: true,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB4I6BJxRG27IxIDkd_KnrEBsVnVLraVU5tii4NvkDfOBeDadGUSwdK1XufJzJiK5LIPkwMoFd5ehEMXeZVJ_3dYOLqzXhbwMCd8TOBo6GUgRtsmILBO1sYFRODUnfnxk1RETyKNDJ1V8Megdw2uLKid2NNGFSe845Qhk5vgVYfSyjmTwIUULz9e6KeJrkXLKINqHjQ_yjvrR25fymu9QmoRSnREh7APQXQK3Bb0OpHbbfoQgRlwJ4qmA',
  },
  {
    id: 'cat_salas_0918',
    name: 'Salas de Estar & Asientos',
    slug: 'salas',
    type: 'Categoría de Estancia',
    priority: 2,
    pieces: 8,
    materials: ['Nogal Amazónico', 'Lino Puro'],
    status: 'Menú Principal',
    accent: false,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCkJ8mWifJzpA1UwsHBXx-pnGgdG1doxjKWTRk-7pRpCpbHfHtV2u_RQdwqwyx5YSdCy05F4U-RFW8FRo7U7Hsmd-AsSZm4H72kIhPuTyDXfgDwxgLU9k8TGYBOehz3F11nIwKYSzTd-ToPFL0ai5wwFZs21nE0SBrB9xiCugsmEC6tdtVQdgpQE4MfwNtZif2xpmTp3bIaDBuh7dt4J17Qad8ltmVxnauxAruhHqox-4rvaQ0Z833PEw',
  },
  {
    id: 'cat_dorm_0915',
    name: 'Dormitorios & Descanso',
    slug: 'dormitorios',
    type: 'Categoría de Estancia',
    priority: 3,
    pieces: 4,
    materials: ['Moena', 'Cedro'],
    status: 'Menú Principal',
    accent: false,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB0PZm6w11Ok6A3KbQQ8p46AbwaKbJgzhEImG_rtX7hYmfKtDSFCYdOWFNXjxgPY-yGvoNWo038mg98faXWNHBJ6U9aygMRre4u1o7qLHgOBRhFpOk1Eu1Gbf4QAoVhTEW5wqAtfRrC6WIUeTyhKloyzt9P1LbtqYA11XydK_H8wVTz0XMtZeWETH7fQ-vJ_hsKldum6KfU8KerkvzJT_4PW40TI5-aaHKGbkTs8hw38lPNlvPcuOzKNQ',
  },
  {
    id: 'col_pachacamac_0770',
    name: 'Colección Pachacámac',
    slug: 'pachacamac',
    type: 'Colección Especial',
    priority: 0,
    pieces: 5,
    materials: ['Tornillo Curado', 'Fierro Quemado'],
    status: 'Edición Limitada',
    accent: true,
    limited: true,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCTQtO7Dgy5WK7SUnwbNIUH09xkz53UtTQzqKkoKrDeyxHgnNT2OHk9T2lvkCicclYC2qNAotLMWlDtLlaHkNosxgrHwU57C2GmMimQGyCvtu8UEbkO1j3mTLlaF4E_cMtHODdCR5sS4pBzgaxS84UhjMJ6WT0S-Xv9zRki2V2FvNbbHu9acwj4WH4BmPYjclA5Nv7aa3_7hVF-iERG8Wo3CEFK1AkZgyhxG2EgGi3VxEYuwrLWjxhQwg',
  },
  {
    id: 'cat_escr_0922',
    name: 'Escritorios & Estudio',
    slug: 'escritorios',
    type: 'Categoría de Estancia',
    priority: 4,
    pieces: 3,
    materials: ['Cedro Rojo', 'Cuero Natural'],
    status: 'Menú Principal',
    accent: false,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD0AM4fp_VTYt5SOBA-3rGTOUO9Wpc_ezfsR5cnGrYielFI3_ovhMUbnmuj1bm7kaWABgaH-D32eHpM9YocvsMpXy0qdTCpTQfFzhPcO3EZnJacmEbkwSC4ZwSygzF8O7LoJo3sFxGULJrWilj0cjk0FsrFiYL3d0aotKz7H4SUEKgenJlGwRI6wzxp3lgMqA4GKKJpIk-LAHaC80jJz1TdQsxLa_pu1HPRQY4oH5zIFtA5gTU_0G-g4g',
  },
]

// Resumen del estado del catálogo para la página de categorías.
export const catalogStatus = {
  active: 8,
  collections: 4,
  pieces: '28 / 28',
  woods: 5,
}