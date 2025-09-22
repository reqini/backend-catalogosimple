# API Endpoints - Perfil de Usuario

## Autenticación
Todos los endpoints requieren autenticación JWT. Incluir el token en el header:
```
Authorization: Bearer <token>
```

## Endpoints Implementados

### 1. GET /api/profile/:username
**Descripción:** Obtener datos del perfil del usuario

**Headers:**
- `Authorization: Bearer <token>`

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "username": "cocinaty",
    "email": "cocinaty@ejemplo.com", 
    "phone": "+54 9 11 1234-5678",
    "address": "Buenos Aires, Argentina",
    "businessName": "Cocina TY - Productos de Cocina",
    "businessType": "Venta de productos de cocina",
    "avatar": "",
    "rango": "Demostrador/a",
    "fechaRegistro": "2024-01-15",
    "preferences": {
      "notifications": true,
      "darkMode": false,
      "language": "es",
      "theme": "default"
    }
  }
}
```

### 2. PUT /api/profile/:username
**Descripción:** Actualizar datos del perfil del usuario

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Body:**
```json
{
  "email": "nuevo@email.com",
  "phone": "+54 9 11 5678-1234",
  "preferences": {
    "notifications": false
  }
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Perfil actualizado exitosamente"
}
```

### 3. GET /api/profile/:username/stats
**Descripción:** Obtener estadísticas del usuario

**Headers:**
- `Authorization: Bearer <token>`

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "totalVentas": 1247,
    "clientesActivos": 89,
    "placasGeneradas": 156,
    "rating": 4.8
  }
}
```

### 4. POST /api/profile/:username/change-password
**Descripción:** Cambiar contraseña del usuario

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Body:**
```json
{
  "currentPassword": "279323",
  "newPassword": "nueva123",
  "confirmPassword": "nueva123"
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Contraseña actualizada exitosamente"
}
```

## Códigos de Error

### 400 - Bad Request
```json
{
  "success": false,
  "message": "Datos de entrada inválidos"
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "message": "Token no proporcionado"
}
```

### 403 - Forbidden
```json
{
  "success": false,
  "message": "No tienes permisos para acceder a este perfil"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "Usuario no encontrado"
}
```

### 500 - Internal Server Error
```json
{
  "success": false,
  "message": "Error interno del servidor"
}
```

## Estructura de Google Sheets

### Hoja: "Perfiles_Emprendedoras"
| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| username | email | phone | address | businessName | businessType | avatar | rango | fechaRegistro | totalVentas | clientesActivos | placasGeneradas | rating | notifications | darkMode | language | theme |

### Hoja: "usuarios" (para cambio de contraseña)
| A | B | C |
|---|---|---|
| username | email | password |

## Validaciones Implementadas

1. **Autenticación JWT:** Verificar token válido
2. **Propiedad del perfil:** Usuario solo puede acceder a su propio perfil
3. **Existencia del usuario:** Verificar que el usuario existe en Google Sheets
4. **Validación de contraseña:** Verificar contraseña actual antes de cambiar
5. **Confirmación de contraseña:** Verificar que las contraseñas nuevas coincidan
6. **Manejo de errores:** Try/catch en todos los endpoints
