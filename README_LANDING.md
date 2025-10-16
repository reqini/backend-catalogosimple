# 🍳 API Essen - Landing Page

## 🚀 Descripción

Landing page interactiva para la API pública de productos Essen. Esta página permite a los usuarios:

- 📊 Ver estadísticas en tiempo real del catálogo
- 🧪 Probar la API directamente desde el navegador
- 💻 Ver ejemplos de código en JavaScript, Python y cURL
- 📖 Consultar documentación completa de endpoints
- 🔒 Entender la política de precios

## 🌐 URL de Acceso

```
https://backend-catalogosimple.onrender.com/
```

## ✨ Características

### 📊 Dashboard en Tiempo Real
- Estadísticas actualizadas del catálogo
- Contador de productos, familias y líneas
- Productos activos vs inactivos

### 🧪 Testing Interactivo
- Botones para probar diferentes endpoints
- Respuestas JSON formateadas y coloreadas
- Manejo de errores en tiempo real

### 💻 Ejemplos de Código
- **JavaScript/Fetch**: Ejemplos listos para usar
- **Python/Requests**: Código para integración Python
- **cURL**: Comandos para testing desde terminal

### 📖 Documentación Completa
- Lista de todos los endpoints disponibles
- Parámetros y filtros explicados
- Ejemplos de uso prácticos

### 🔒 Política de Precios Clara
- Explicación de por qué los precios no están disponibles
- Información de contacto para obtener precios
- Mensajes informativos en toda la interfaz

## 🛠️ Tecnologías Utilizadas

- **HTML5**: Estructura semántica
- **CSS3**: Diseño responsive con gradientes y animaciones
- **JavaScript**: Interactividad y consumo de API
- **Prism.js**: Highlighting de código
- **Express.js**: Servidor para archivos estáticos

## 📱 Responsive Design

La landing page está optimizada para:
- 💻 Desktop (1200px+)
- 📱 Tablet (768px - 1199px)
- 📱 Mobile (< 768px)

## 🎨 Características de Diseño

- **Gradiente de fondo**: Azul a púrpura
- **Cards flotantes**: Efecto hover con elevación
- **Colores consistentes**: Paleta basada en los colores de la API
- **Tipografía moderna**: System fonts para mejor rendimiento
- **Animaciones suaves**: Transiciones CSS para mejor UX

## 🔧 Funcionalidades JavaScript

### Carga de Estadísticas
```javascript
async function loadStats() {
  // Carga estadísticas del catálogo al cargar la página
}
```

### Testing de API
```javascript
async function testAPI(endpoint) {
  // Prueba endpoints y muestra resultados formateados
}
```

### Manejo de Errores
- Conexión fallida
- Errores HTTP (4xx, 5xx)
- Timeouts
- Respuestas malformadas

## 📊 Métricas Mostradas

1. **Total de Productos**: Número total en el catálogo
2. **Familias**: Diferentes familias de productos
3. **Líneas**: Diferentes líneas de productos
4. **Productos Activos**: Productos con vigencia "SI"

## 🧪 Endpoints de Prueba

La landing incluye botones para probar:

1. **Info API**: Información general
2. **Productos**: Lista de productos (limitada a 5)
3. **Categorías**: Familias, líneas y vigencias
4. **Estadísticas**: Datos agregados del catálogo
5. **Búsqueda**: Buscar productos por término
6. **Filtros**: Productos por familia específica

## 🔒 Seguridad

- **CORS configurado**: Solo orígenes permitidos
- **Helmet.js**: Headers de seguridad
- **Sin precios**: Información financiera protegida
- **Rate limiting**: Límites en requests

## 📈 Performance

- **Cache de 5 minutos**: En la API para optimizar respuestas
- **CDN**: Para recursos estáticos (Prism.js, etc.)
- **Compresión**: Gzip habilitado
- **Lazy loading**: Para imágenes y recursos pesados

## 🚀 Deployment

La landing page se despliega automáticamente con el backend en Render:

1. **Build automático**: Al hacer push a main
2. **Archivos estáticos**: Servidos desde `/public`
3. **Ruta raíz**: `/` sirve `index.html`
4. **HTTPS**: Certificado SSL automático

## 📝 Mantenimiento

### Actualizar Contenido
1. Editar `public/index.html`
2. Commit y push a main
3. Deploy automático en Render

### Agregar Nuevos Endpoints
1. Actualizar la sección de endpoints en HTML
2. Agregar botón de prueba en JavaScript
3. Actualizar ejemplos de código

### Modificar Diseño
1. Editar estilos CSS en `<style>`
2. Probar en diferentes dispositivos
3. Verificar accesibilidad

## 🤝 Contribuciones

Para contribuir a la landing page:

1. Fork del repositorio
2. Crear rama para feature
3. Hacer cambios en `public/index.html`
4. Probar localmente
5. Crear Pull Request

## 📞 Soporte

Para problemas con la landing page:
- Abrir issue en GitHub
- Contactar al equipo de desarrollo
- Revisar logs en Render

---

*Landing page creada para facilitar el uso de la API Essen*
