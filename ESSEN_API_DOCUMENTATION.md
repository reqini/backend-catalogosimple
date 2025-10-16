# 🍳 API Pública Essen - Documentación Completa

## 📋 Descripción

API open source para consultar el catálogo completo de productos Essen. Esta API proporciona acceso público a información detallada de productos **SIN incluir precios ni cuotas**, que están reservados para usuarios registrados.

## 🔗 URL Base

```
https://backend-catalogosimple.onrender.com/api/essen
```

## 🔒 Política de Precios

- ❌ **NO se incluyen precios** en la API pública
- ❌ **NO se incluyen cuotas** en la API pública  
- ❌ **NO se incluye información financiera**
- ✅ **SÍ se incluye información de contacto** para obtener precios
- 💰 **Para precios:** Contacte directamente con el equipo comercial

---

## 📡 Endpoints Disponibles

### 🏠 Información General

#### `GET /api/essen/`
Obtiene información sobre la API y sus endpoints.

**Respuesta:**
```json
{
  "success": true,
  "message": "API Pública de Productos Essen",
  "version": "1.0.0",
  "description": "API open source para consultar el catálogo completo de productos Essen (sin precios)",
  "pricing_policy": {
    "message": "Los precios y cuotas NO están disponibles en la API pública",
    "reason": "Los precios están reservados para usuarios registrados y pagos",
    "contact": "Para obtener precios, contacte con nosotros directamente"
  },
  "endpoints": { ... },
  "examples": { ... }
}
```

---

### 📦 Productos

#### `GET /api/essen/products`
Obtiene todos los productos con filtros y paginación.

**Parámetros:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Productos por página (default: 50, max: 100)
- `familia` (opcional): Filtrar por familia de producto
- `linea` (opcional): Filtrar por línea de producto
- `vigencia` (opcional): Filtrar por vigencia (SI/NO)
- `search` (opcional): Búsqueda de texto libre
- `sort` (opcional): Campo para ordenar (combo, descripcion, familia, linea)
- `order` (opcional): Orden (asc/desc)

**Ejemplo:**
```bash
GET /api/essen/products?familia=Durables&vigencia=SI&limit=10
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "combo": 505,
      "familia": "Durables",
      "linea": "Capri",
      "codigo": "90050513",
      "descripcion": "COMBO FLIP Y PELADOR DE VEGETALES CAPRI",
      "puntos": "137",
      "vigencia": "SI",
      "multimedia": {
        "imagen": "https://i.ibb.co/whM24qw8/Disen-o-sin-ti-tulo-40.png",
        "ficha_tecnica": ""
      },
      "promociones": {
        "discount": "PELADOR DE VEGETALES GRATIS",
        "event": "SI"
      },
      "pricing_info": {
        "has_pricing": true,
        "message": "Los precios y cuotas están disponibles para usuarios registrados",
        "contact_message": "Contacte con nosotros para obtener precios y opciones de pago"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1055,
    "pages": 106
  },
  "filters": {
    "familia": "Durables",
    "vigencia": "SI"
  },
  "meta": {
    "cache_updated": "2024-01-15T10:30:00.000Z",
    "total_products": 1055
  }
}
```

#### `GET /api/essen/products/:id`
Obtiene un producto específico por ID.

**Ejemplo:**
```bash
GET /api/essen/products/1
```

#### `GET /api/essen/products/combo/:combo`
Obtiene un producto específico por número de combo.

**Ejemplo:**
```bash
GET /api/essen/products/combo/505
```

---

### 🔍 Búsqueda

#### `GET /api/essen/search`
Búsqueda avanzada de productos.

**Parámetros:**
- `q` (opcional): Término de búsqueda
- `familia` (opcional): Filtrar por familia
- `linea` (opcional): Filtrar por línea
- `vigencia` (opcional): Filtrar por vigencia

**Ejemplo:**
```bash
GET /api/essen/search?q=Capri&familia=Durables
```

**Respuesta:**
```json
{
  "success": true,
  "data": [ ... ],
  "total": 15,
  "search_params": {
    "q": "Capri",
    "familia": "Durables"
  },
  "pricing_info": {
    "message": "Para consultas de precios, contacte con nosotros",
    "contact": "Los precios y cuotas están disponibles para usuarios registrados"
  }
}
```

---

### 📂 Categorías

#### `GET /api/essen/categories`
Obtiene todas las categorías disponibles.

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "familias": [
      {
        "value": "Durables",
        "label": "Durables",
        "count": 500
      },
      {
        "value": "Temporales",
        "label": "Temporales",
        "count": 200
      }
    ],
    "lineas": [
      {
        "value": "Capri",
        "label": "Capri",
        "count": 150
      },
      {
        "value": "Terra",
        "label": "Terra",
        "count": 120
      }
    ],
    "vigencias": [
      {
        "value": "SI",
        "label": "SI",
        "count": 800
      },
      {
        "value": "NO",
        "label": "NO",
        "count": 255
      }
    ]
  }
}
```

---

### 📊 Estadísticas

#### `GET /api/essen/stats`
Obtiene estadísticas del catálogo.

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "total": 1055,
    "por_familia": {
      "Durables": 500,
      "Temporales": 200,
      "Especiales": 355
    },
    "por_linea": {
      "Capri": 150,
      "Terra": 120,
      "Ceramica": 100
    },
    "por_vigencia": {
      "SI": 800,
      "NO": 255
    },
    "pricing_info": {
      "message": "Información de precios disponible para usuarios registrados",
      "contact": "Contacte para obtener detalles de precios y cuotas"
    }
  },
  "meta": {
    "cache_updated": "2024-01-15T10:30:00.000Z",
    "last_updated": "2024-01-15T10:35:00.000Z"
  }
}
```

---

## 📝 Ejemplos de Uso

### JavaScript/Fetch
```javascript
// Obtener productos Durables
fetch('https://backend-catalogosimple.onrender.com/api/essen/products?familia=Durables&limit=5')
  .then(response => response.json())
  .then(data => {
    console.log('Productos:', data.data);
    console.log('Total:', data.pagination.total);
  });

// Buscar productos Capri
fetch('https://backend-catalogosimple.onrender.com/api/essen/search?q=Capri')
  .then(response => response.json())
  .then(data => {
    console.log('Resultados:', data.data);
  });
```

### Python/Requests
```python
import requests

# Obtener estadísticas
response = requests.get('https://backend-catalogosimple.onrender.com/api/essen/stats')
data = response.json()
print(f"Total productos: {data['data']['total']}")

# Buscar productos
response = requests.get('https://backend-catalogosimple.onrender.com/api/essen/search?q=Capri')
products = response.json()['data']
print(f"Encontrados {len(products)} productos Capri")
```

### cURL
```bash
# Obtener productos activos
curl "https://backend-catalogosimple.onrender.com/api/essen/products?vigencia=SI&limit=10"

# Buscar productos
curl "https://backend-catalogosimple.onrender.com/api/essen/search?q=Capri"

# Obtener categorías
curl "https://backend-catalogosimple.onrender.com/api/essen/categories"
```

---

## 🚀 Características Técnicas

### ⚡ Performance
- **Cache**: Los datos se cachean por 5 minutos
- **Paginación**: Máximo 100 productos por página
- **Response time**: < 2 segundos promedio

### 🔒 Seguridad
- **Sin precios**: Información financiera protegida
- **Rate limiting**: Límites de requests por minuto
- **CORS**: Configurado para uso público

### 📊 Datos Disponibles
✅ **Incluidos:**
- ID y número de combo
- Familia y línea de producto
- Código y descripción
- Puntos
- Vigencia
- Imágenes
- Fichas técnicas
- Información de promociones

❌ **NO Incluidos:**
- Precios
- Cuotas
- Información de comisiones
- Datos financieros

---

## 🤝 Contacto para Precios

Para obtener información de precios y cuotas:

📧 **Email**: [contacto@essen.com](mailto:contacto@essen.com)
📱 **WhatsApp**: [Número de contacto]
🌐 **Web**: [Sitio web oficial]

---

## 📄 Licencia

Esta API es open source bajo licencia MIT.

## 🔗 Repositorio

Código fuente disponible en: [GitHub Repository](https://github.com/reqini/backend-catalogosimple)

---

## 🆘 Soporte

Para reportar bugs o solicitar nuevas funcionalidades:
- Abrir un issue en GitHub
- Contactar al equipo de desarrollo
- Revisar la documentación técnica

---

*Última actualización: Enero 2024*
