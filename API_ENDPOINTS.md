# 📚 API Endpoints - Backend Catálogo Simple

## 🗂️ Estructura de la API

La API está dividida en dos secciones:
- **Legacy (Google Sheets)**: Endpoints que usan Google Sheets como base de datos
- **Nueva (PostgreSQL)**: Endpoints que usan PostgreSQL para el dashboard

---

## 🔄 Legacy Endpoints (Google Sheets)

### Productos
- `GET /api/productos` - Obtener productos desde Google Sheets

### Usuarios
- `GET /api/user/all` - Obtener todos los usuarios
- `POST /api/user/update-password` - Actualizar contraseña
- `POST /api/user/delete-account` - Eliminar cuenta
- `POST /api/user/test-add-user` - Agregar usuario de prueba

### Ventas
- `GET /api/ventas` - Obtener ventas
- `POST /api/ventas` - Crear venta

### Clientes
- `GET /api/clientes` - Obtener clientes
- `POST /api/clientes` - Crear cliente

### Bancos
- `GET /api/bancos` - Obtener bancos

### Admin
- `GET /api/admin` - Endpoints administrativos

---

## 🆕 Nueva API (PostgreSQL) - Para Dashboard

### 📦 Productos (`/api/products`)

#### Obtener productos
```http
GET /api/products
GET /api/products?page=1&limit=50
GET /api/products?familia=Durables&linea=Capri&vigencia=SI
```

#### Obtener producto específico
```http
GET /api/products/:id
GET /api/products/combo/:combo
```

#### Crear producto
```http
POST /api/products
Content-Type: application/json

{
  "combo": 505,
  "familia": "Durables",
  "linea": "Capri",
  "codigo": "90050513",
  "descripcion": "NUEVO PRODUCTO",
  "puntos": "150",
  "precio_preferencial": "$500,000",
  "precio_negocio": "$588,235",
  "vigencia": "SI",
  "imagen": "https://example.com/image.jpg"
}
```

#### Actualizar producto
```http
PUT /api/products/:id
Content-Type: application/json

{
  "descripcion": "Producto actualizado",
  "precio_negocio": "$600,000"
}
```

#### Eliminar producto
```http
DELETE /api/products/:id
```

#### Estadísticas de productos
```http
GET /api/products/stats/overview
```

---

### 👥 Usuarios (`/api/users`)

#### Obtener usuarios
```http
GET /api/users
GET /api/users?page=1&limit=50
GET /api/users?rango=Demostrador/a&tipo_usuario=full&estado=Activo
```

#### Obtener usuario específico
```http
GET /api/users/:id
GET /api/users/username/:username
```

#### Crear usuario
```http
POST /api/users
Content-Type: application/json

{
  "username": "nuevo_usuario",
  "password": "123456",
  "email": "usuario@ejemplo.com",
  "nombre": "Juan",
  "apellido": "Pérez",
  "rango": "Demostrador/a",
  "tipo_usuario": "full",
  "estado": "Activo"
}
```

#### Actualizar usuario
```http
PUT /api/users/:id
Content-Type: application/json

{
  "nombre": "Juan Carlos",
  "rango": "Coordinador/a"
}
```

#### Eliminar usuario
```http
DELETE /api/users/:id
```

#### Estadísticas del usuario
```http
GET /api/users/:id/stats
```

---

### 💰 Ventas (`/api/sales`)

#### Obtener ventas
```http
GET /api/sales
GET /api/sales?page=1&limit=50
GET /api/sales?userId=1&estado=completada
GET /api/sales?fecha_desde=2024-01-01&fecha_hasta=2024-12-31
```

#### Obtener venta específica
```http
GET /api/sales/:id
```

#### Crear venta
```http
POST /api/sales
Content-Type: application/json

{
  "userId": 1,
  "clientId": 1,
  "metodo_pago": "efectivo",
  "notas": "Venta especial",
  "comision": 50000,
  "items": [
    {
      "productId": 1,
      "cantidad": 2,
      "precio_unitario": 100000,
      "descuento": 10000
    }
  ]
}
```

#### Actualizar venta
```http
PUT /api/sales/:id
Content-Type: application/json

{
  "estado": "completada",
  "notas": "Venta completada"
}
```

#### Eliminar venta
```http
DELETE /api/sales/:id
```

#### Estadísticas de ventas
```http
GET /api/sales/stats/overview
```

---

### 👤 Clientes (`/api/clients`)

#### Obtener clientes
```http
GET /api/clients
GET /api/clients?page=1&limit=50
GET /api/clients?userId=1&activo=true
```

#### Obtener cliente específico
```http
GET /api/clients/:id
```

#### Crear cliente
```http
POST /api/clients
Content-Type: application/json

{
  "userId": 1,
  "nombre": "María",
  "apellido": "González",
  "email": "maria@ejemplo.com",
  "telefono": "+54 9 11 1234-5678",
  "direccion": "Av. Corrientes 1234",
  "documento": "12345678",
  "tipo_documento": "DNI"
}
```

#### Actualizar cliente
```http
PUT /api/clients/:id
Content-Type: application/json

{
  "telefono": "+54 9 11 9876-5432",
  "activo": true
}
```

#### Eliminar cliente
```http
DELETE /api/clients/:id
```

#### Estadísticas del cliente
```http
GET /api/clients/:id/stats
```

---

### 📊 Dashboard (`/api/dashboard`)

#### Estadísticas generales
```http
GET /api/dashboard/overview
```

Respuesta incluye:
- Estadísticas de productos, usuarios, clientes, ventas
- Ventas por familia y línea de productos
- Top productos más vendidos
- Top usuarios con más ventas
- Ventas por mes (últimos 12 meses)

#### Estadísticas de productos
```http
GET /api/dashboard/products/stats
GET /api/dashboard/products/stats?familia=Durables&linea=Capri
```

#### Tendencias de ventas
```http
GET /api/dashboard/sales/trends
GET /api/dashboard/sales/trends?periodo=30
```

---

## 🔧 Configuración de Base de Datos

### Variables de entorno requeridas:
```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/catalogo_db"
GOOGLE_SHEET_ID="1ATl5Avm6NjoiaPrVOG8xw8fLAZeBfuf5HG-sGBMCGQw"
GOOGLE_CREDENTIALS='{"type":"service_account",...}'
```

### Scripts disponibles:
```bash
npm run db:generate    # Generar cliente Prisma
npm run db:push        # Sincronizar schema con DB
npm run db:migrate     # Crear migración
npm run db:studio      # Abrir Prisma Studio
npm run db:migrate-data # Migrar datos de Google Sheets
```

---

## 📝 Respuestas de la API

### Formato estándar de respuesta exitosa:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operación exitosa",
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "pages": 2
  }
}
```

### Formato de respuesta de error:
```json
{
  "success": false,
  "message": "Descripción del error",
  "error": "Detalles técnicos del error"
}
```

---

## 🚀 Próximos pasos para el Frontend

1. **Configurar base de datos PostgreSQL** en Render
2. **Ejecutar migraciones** para crear las tablas
3. **Migrar datos** de Google Sheets a PostgreSQL
4. **Implementar autenticación** para el dashboard
5. **Crear interfaz de administración** con React/Next.js

---

## 📞 Soporte

Para cualquier duda sobre los endpoints, revisar:
- Logs del servidor en Render
- Documentación de Prisma: https://www.prisma.io/docs
- Documentación de Express: https://expressjs.com/
