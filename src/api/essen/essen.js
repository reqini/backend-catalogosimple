import express from "express";
import { google } from "googleapis";
import config from "../../config/index.js";

const router = express.Router();

// Función para obtener datos de Google Sheets
async function getEssenProducts() {
  try {
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    
    const auth = new google.auth.GoogleAuth({
      credentials: credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"]
    });
    
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: authClient });
    
    // Obtener productos de Essen
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: config.GOOGLE_SHEET_ID,
      range: "A:AE",
    });
    
    const rawData = response.data.values || [];
    
    // Procesar datos y convertirlos a formato API pública (SIN PRECIOS)
    const products = rawData.slice(1).map((row, index) => ({
      id: index + 1,
      combo: row[0] ? parseInt(row[0]) : null,
      familia: row[1] || null,
      linea: row[2] || null,
      codigo: row[3] || null,
      descripcion: row[4] || null,
      puntos: row[5] || null,
      vigencia: row[23] || null,
      multimedia: {
        imagen: row[27] || null,
        ficha_tecnica: row[28] || null
      },
      promociones: {
        discount: row[29] || null,
        event: row[30] || null
      },
      // Información sobre precios (sin mostrar los valores)
      pricing_info: {
        has_pricing: true,
        message: "Los precios y cuotas están disponibles para usuarios registrados",
        contact_message: "Contacte con nosotros para obtener precios y opciones de pago"
      }
    })).filter(product => product.combo); // Solo productos con combo válido
    
    return products;
  } catch (error) {
    console.error("Error al obtener productos de Essen:", error);
    throw new Error("No se pudieron obtener los productos de Essen");
  }
}

// Cache para mejorar performance
let productCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

async function getCachedProducts() {
  const now = Date.now();
  
  if (!productCache || !cacheTimestamp || (now - cacheTimestamp) > CACHE_DURATION) {
    productCache = await getEssenProducts();
    cacheTimestamp = now;
    console.log(`🔄 Cache actualizado: ${productCache.length} productos`);
  }
  
  return productCache;
}

// GET /api/essen/products - Obtener todos los productos Essen
router.get("/products", async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      familia, 
      linea, 
      vigencia,
      search,
      sort = 'combo',
      order = 'asc'
    } = req.query;

    let products = await getCachedProducts();

    // Aplicar filtros
    if (familia) {
      products = products.filter(p => p.familia && p.familia.toLowerCase().includes(familia.toLowerCase()));
    }
    
    if (linea) {
      products = products.filter(p => p.linea && p.linea.toLowerCase().includes(linea.toLowerCase()));
    }
    
    if (vigencia) {
      products = products.filter(p => p.vigencia === vigencia);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      products = products.filter(p => 
        (p.descripcion && p.descripcion.toLowerCase().includes(searchLower)) ||
        (p.codigo && p.codigo.toLowerCase().includes(searchLower)) ||
        (p.familia && p.familia.toLowerCase().includes(searchLower)) ||
        (p.linea && p.linea.toLowerCase().includes(searchLower))
      );
    }

    // Aplicar ordenamiento
    products.sort((a, b) => {
      let aVal = a[sort];
      let bVal = b[sort];
      
      if (sort === 'combo') {
        aVal = parseInt(aVal) || 0;
        bVal = parseInt(bVal) || 0;
      } else {
        aVal = String(aVal || '').toLowerCase();
        bVal = String(bVal || '').toLowerCase();
      }
      
      if (order === 'desc') {
        return bVal > aVal ? 1 : -1;
      } else {
        return aVal > bVal ? 1 : -1;
      }
    });

    // Aplicar paginación
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedProducts = products.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedProducts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: products.length,
        pages: Math.ceil(products.length / limit)
      },
      filters: {
        familia,
        linea,
        vigencia,
        search,
        sort,
        order
      },
      meta: {
        cache_updated: cacheTimestamp ? new Date(cacheTimestamp).toISOString() : null,
        total_products: products.length
      }
    });
  } catch (error) {
    console.error("Error al obtener productos Essen:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener productos de Essen",
      error: error.message
    });
  }
});

// GET /api/essen/products/:id - Obtener producto por ID
router.get("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const products = await getCachedProducts();
    
    const product = products.find(p => p.id === parseInt(id));
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado"
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error("Error al obtener producto Essen:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener producto de Essen",
      error: error.message
    });
  }
});

// GET /api/essen/products/combo/:combo - Obtener producto por número de combo
router.get("/products/combo/:combo", async (req, res) => {
  try {
    const { combo } = req.params;
    const products = await getCachedProducts();
    
    const product = products.find(p => p.combo === parseInt(combo));
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado"
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error("Error al obtener producto Essen:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener producto de Essen",
      error: error.message
    });
  }
});

// GET /api/essen/categories - Obtener categorías disponibles
router.get("/categories", async (req, res) => {
  try {
    const products = await getCachedProducts();
    
    const familias = [...new Set(products.map(p => p.familia).filter(Boolean))];
    const lineas = [...new Set(products.map(p => p.linea).filter(Boolean))];
    const vigencias = [...new Set(products.map(p => p.vigencia).filter(Boolean))];

    res.json({
      success: true,
      data: {
        familias: familias.map(f => ({ 
          value: f, 
          label: f,
          count: products.filter(p => p.familia === f).length
        })),
        lineas: lineas.map(l => ({ 
          value: l, 
          label: l,
          count: products.filter(p => p.linea === l).length
        })),
        vigencias: vigencias.map(v => ({ 
          value: v, 
          label: v,
          count: products.filter(p => p.vigencia === v).length
        }))
      }
    });
  } catch (error) {
    console.error("Error al obtener categorías Essen:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener categorías de Essen",
      error: error.message
    });
  }
});

// GET /api/essen/stats - Estadísticas de productos Essen
router.get("/stats", async (req, res) => {
  try {
    const products = await getCachedProducts();
    
    const stats = {
      total: products.length,
      por_familia: {},
      por_linea: {},
      por_vigencia: {},
      pricing_info: {
        message: "Información de precios disponible para usuarios registrados",
        contact: "Contacte para obtener detalles de precios y cuotas"
      }
    };

    // Contar por familia
    products.forEach(p => {
      if (p.familia) {
        stats.por_familia[p.familia] = (stats.por_familia[p.familia] || 0) + 1;
      }
    });

    // Contar por línea
    products.forEach(p => {
      if (p.linea) {
        stats.por_linea[p.linea] = (stats.por_linea[p.linea] || 0) + 1;
      }
    });

    // Contar por vigencia
    products.forEach(p => {
      if (p.vigencia) {
        stats.por_vigencia[p.vigencia] = (stats.por_vigencia[p.vigencia] || 0) + 1;
      }
    });

    res.json({
      success: true,
      data: stats,
      meta: {
        cache_updated: cacheTimestamp ? new Date(cacheTimestamp).toISOString() : null,
        last_updated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error al obtener estadísticas Essen:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener estadísticas de Essen",
      error: error.message
    });
  }
});

// GET /api/essen/search - Búsqueda avanzada
router.get("/search", async (req, res) => {
  try {
    const { q, familia, linea, vigencia } = req.query;
    
    if (!q && !familia && !linea && !vigencia) {
      return res.status(400).json({
        success: false,
        message: "Debe proporcionar al menos un parámetro de búsqueda",
        available_params: ["q", "familia", "linea", "vigencia"]
      });
    }

    let products = await getCachedProducts();

    // Búsqueda por texto
    if (q) {
      const searchLower = q.toLowerCase();
      products = products.filter(p => 
        (p.descripcion && p.descripcion.toLowerCase().includes(searchLower)) ||
        (p.codigo && p.codigo.toLowerCase().includes(searchLower)) ||
        (p.familia && p.familia.toLowerCase().includes(searchLower)) ||
        (p.linea && p.linea.toLowerCase().includes(searchLower))
      );
    }

    // Filtros adicionales
    if (familia) {
      products = products.filter(p => p.familia === familia);
    }
    
    if (linea) {
      products = products.filter(p => p.linea === linea);
    }
    
    if (vigencia) {
      products = products.filter(p => p.vigencia === vigencia);
    }

    res.json({
      success: true,
      data: products,
      total: products.length,
      search_params: {
        q,
        familia,
        linea,
        vigencia
      },
      pricing_info: {
        message: "Para consultas de precios, contacte con nosotros",
        contact: "Los precios y cuotas están disponibles para usuarios registrados"
      }
    });
  } catch (error) {
    console.error("Error en búsqueda Essen:", error);
    res.status(500).json({
      success: false,
      message: "Error en búsqueda de productos Essen",
      error: error.message
    });
  }
});

// GET /api/essen/ - Información de la API
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API Pública de Productos Essen",
    version: "1.0.0",
    description: "API open source para consultar el catálogo completo de productos Essen (sin precios)",
    pricing_policy: {
      message: "Los precios y cuotas NO están disponibles en la API pública",
      reason: "Los precios están reservados para usuarios registrados y pagos",
      contact: "Para obtener precios, contacte con nosotros directamente"
    },
    endpoints: {
      products: {
        "GET /api/essen/products": "Obtener todos los productos con filtros y paginación",
        "GET /api/essen/products/:id": "Obtener producto por ID",
        "GET /api/essen/products/combo/:combo": "Obtener producto por número de combo",
        "GET /api/essen/search": "Búsqueda avanzada de productos"
      },
      categories: {
        "GET /api/essen/categories": "Obtener categorías disponibles"
      },
      stats: {
        "GET /api/essen/stats": "Estadísticas del catálogo"
      }
    },
    parameters: {
      pagination: {
        page: "Número de página (default: 1)",
        limit: "Productos por página (default: 50, max: 100)"
      },
      filters: {
        familia: "Filtrar por familia de producto",
        linea: "Filtrar por línea de producto",
        vigencia: "Filtrar por vigencia (SI/NO)",
        search: "Búsqueda de texto libre",
        sort: "Campo para ordenar (combo, descripcion, familia, linea)",
        order: "Orden (asc/desc)"
      },
      search: {
        q: "Término de búsqueda",
        familia: "Filtrar por familia",
        linea: "Filtrar por línea",
        vigencia: "Filtrar por vigencia"
      }
    },
    examples: {
      "Obtener productos Durables": "/api/essen/products?familia=Durables",
      "Buscar productos Capri": "/api/essen/search?q=Capri",
      "Productos activos": "/api/essen/products?vigencia=SI",
      "Producto específico": "/api/essen/products/combo/505"
    },
    data_included: {
      available: [
        "ID y número de combo",
        "Familia y línea de producto",
        "Código y descripción",
        "Puntos",
        "Vigencia",
        "Imágenes",
        "Fichas técnicas",
        "Información de promociones"
      ],
      not_available: [
        "Precios",
        "Cuotas",
        "Información de comisiones",
        "Datos financieros"
      ]
    },
    cache: "Los datos se cachean por 5 minutos para optimizar performance",
    source: "https://github.com/reqini/backend-catalogosimple",
    license: "MIT",
    contact: "Para precios y cuotas, contacte directamente con el equipo comercial"
  });
});

export default router;
