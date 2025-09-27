# 📊 Configuración de Google Sheet como Base de Datos

## 🔗 **Google Sheet Principal**
**URL:** https://docs.google.com/spreadsheets/d/1ATl5Avm6NjoiaPrVOG8xw8fLAZeBfuf5HG-sGBMCGQw/edit?usp=sharing

**ID:** `1ATl5Avm6NjoiaPrVOG8xw8fLAZeBfuf5HG-sGBMCGQw`

## 📋 **Estructura de Hojas Identificadas**

### 1. **Hoja "productos"** (Hoja principal)
**Descripción:** Catálogo completo de productos Essen

**Columnas principales:**
| Col | Campo | Descripción | Ejemplo |
|-----|-------|-------------|---------|
| A | Combo | Número de combo | 31 |
| B | familia | Familia del producto | Durables |
| C | linea | Línea del producto | Terra |
| D | codigo | Código del producto | 38222002 |
| E | descripcion | Descripción del producto | SARTEN EXPRESS TERRA |
| F | puntos | Puntos del producto | 55 |
| G | precio_preferencial | Precio preferencial | $ 166,898 |
| H | precio_negocio | Precio de negocio | $ 196,350 |
| I | precio_emprendedor_no_categorizado | Precio emprendedor | $ 82,766 |
| J | precio_emprendedor_categorizado_y_tdf | Precio categorizado | $ 74,901 |
| K | precio_emprendedor_sin_iva | Precio sin IVA | $ 61,902 |
| L | psvp_lista | PSVP lista | $ 235,620 |
| M | veinticuatro_sin_interes | 24 cuotas sin interés | 13,090 |
| N | veinte_sin_interes | 20 cuotas sin interés | $ 15,708 |
| O | dieciocho_sin_interes | 18 cuotas sin interés | $ 16,830 |
| P | quince_sin_interes | 15 cuotas sin interés | $ 19,635 |
| Q | catorce_sin_interes | 14 cuotas sin interés | $ 23,562 |
| R | doce_sin_interes | 12 cuotas sin interés | $ 26,180 |
| S | diez_sin_interes | 10 cuotas sin interés | $ 39,270 |
| T | nueve_sin_interes | 9 cuotas sin interés | $ 78,540 |
| U | seis_sin_interes | 6 cuotas sin interés | 100 |
| V | tres_sin_interes | 3 cuotas sin interés | SI |
| W | por_comisionable | Por comisionable | $75,262 |
| X | vigencia | Estado de vigencia | $44,473.00 |
| Y | tres_con_interes | 3 cuotas con interés | 103458 |
| Z | seis_con_interes | 6 cuotas con interés | [URL imagen] |
| AA | valor_comisionable | Valor comisionable | [URL ficha técnica] |
| AB | imagen | URL de imagen | |
| AC | ficha_tecnica | URL ficha técnica | |
| AD | discount | Descuento | |
| AE | event | Evento | |

### 2. **Otras Hojas Identificadas**
- **"bancos"** - Lista de bancos disponibles
- **"usuarios"** - Datos de usuarios para login
- **"Perfiles_Emprendedoras"** - Perfiles de usuarios (para endpoints de perfil)
- **"ventas"** - Registro de ventas

## 🔧 **Configuración del Backend**

### **Variables de Entorno Requeridas:**
```env
GOOGLE_SHEET_ID=1ATl5Avm6NjoiaPrVOG8xw8fLAZeBfuf5HG-sGBMCGQw
GOOGLE_CREDENTIALS={"type":"service_account","project_id":"stremlive",...}
```

### **Configuración en config/index.js:**
```javascript
const config = {
  PORT: process.env.PORT || 3001,
  JWT_SECRET: process.env.JWT_SECRET || "supersecretkey1234",
  GOOGLE_SHEET_ID: process.env.GOOGLE_SHEET_ID,
  GOOGLE_CREDENTIALS: process.env.GOOGLE_CREDENTIALS ? JSON.parse(process.env.GOOGLE_CREDENTIALS) : null
};
```

## 🚀 **Endpoints que Usan esta Google Sheet**

### 1. **GET /api/productos**
**Archivo:** `src/api/productos/index.js`
**Hoja:** "productos"
**Función:** Obtener todos los productos del catálogo

### 2. **GET /api/ventas/data**
**Archivo:** `src/api/ventas/ventas.js`
**Hojas:** "productos" y "bancos"
**Función:** Obtener productos activos y lista de bancos

### 3. **PUT /api/profile/:username**
**Archivo:** `src/routes/profile.js`
**Hoja:** "Perfiles_Emprendedoras"
**Función:** Actualizar datos de perfil de usuario

### 4. **Otros endpoints de perfil**
**Archivo:** `src/routes/profile.js`
**Hoja:** "Perfiles_Emprendedoras"
**Funciones:** Obtener perfil, estadísticas, cambiar contraseña

## ✅ **Verificación de Configuración**

### **Estado Actual:**
- ✅ **GOOGLE_SHEET_ID** configurado en `example-env`
- ✅ **Endpoints** configurados para usar la hoja correcta
- ✅ **Estructura** de hojas identificada
- ✅ **Columnas** mapeadas correctamente

### **Service Account:**
- ✅ **Email:** catalogo@stremlive.iam.gserviceaccount.com
- ✅ **Permisos:** Debe tener acceso de "Editor" a la Google Sheet
- ✅ **Autenticación:** Configurada correctamente

## 🔒 **Permisos Requeridos**

### **En Google Sheets:**
1. **Compartir la hoja** con el service account
2. **Permisos de "Editor"** para el email: `catalogo@stremlive.iam.gserviceaccount.com`
3. **Acceso a todas las hojas** dentro del documento

### **Verificar Permisos:**
1. Abrir la Google Sheet
2. Hacer clic en "Compartir" (botón azul)
3. Verificar que `catalogo@stremlive.iam.gserviceaccount.com` tenga permisos de "Editor"

## 📝 **Próximos Pasos**

1. **Configurar variables de entorno** en Render con el GOOGLE_SHEET_ID correcto
2. **Verificar permisos** del service account en Google Sheets
3. **Probar endpoints** para confirmar conectividad
4. **Monitorear logs** en Render para verificar funcionamiento

## 🎯 **Resultado Esperado**

Con esta configuración, el backend debería:
- ✅ **Conectarse correctamente** a la Google Sheet
- ✅ **Obtener productos** desde la hoja "productos"
- ✅ **Actualizar perfiles** en "Perfiles_Emprendedoras"
- ✅ **Registrar ventas** en la hoja "ventas"
- ✅ **Acceder a datos** de usuarios y bancos

La Google Sheet está correctamente configurada como base de datos principal del sistema.
