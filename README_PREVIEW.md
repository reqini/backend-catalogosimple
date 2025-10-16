# 👀 Vista Previa - Renderizado de Datos API Essen

## 🚀 Descripción

Página de demostración interactiva que muestra ejemplos prácticos de cómo renderizar los datos de la API Essen en una interfaz web real. Incluye filtros, búsqueda, paginación y ejemplos de código.

## 🌐 URL de Acceso

```
https://backend-catalogosimple.onrender.com/preview.html
```

## ✨ Características

### 🎨 Interfaces de Renderizado

#### Vista Cuadrícula
- **Cards de productos** con imágenes, títulos y detalles
- **Diseño responsive** que se adapta a diferentes tamaños
- **Efectos hover** para mejor interactividad
- **Información completa** de cada producto

#### Vista Lista
- **Lista compacta** ideal para dispositivos móviles
- **Imágenes pequeñas** con información al lado
- **Fácil escaneo** de productos
- **Optimizada para pantallas pequeñas**

### 🔍 Funcionalidades de Filtrado

#### Filtros Disponibles
- **Por Familia**: Durables, Temporales, Especiales, etc.
- **Por Vigencia**: Activos, Inactivos, Todos
- **Búsqueda de texto**: Busca en descripción, código, familia, línea
- **Productos por página**: 6, 12, 24, 48

#### Búsqueda Inteligente
- **Debounce de 500ms**: Evita requests excesivos
- **Búsqueda en tiempo real**: Sin necesidad de hacer clic
- **Reset automático**: Vuelve a página 1 en nuevas búsquedas

### 📊 Estadísticas en Tiempo Real
- **Total de productos** disponibles
- **Número de familias** diferentes
- **Número de líneas** diferentes
- **Productos activos** vs inactivos

### 📄 Paginación Inteligente
- **Navegación fácil**: Botones anterior/siguiente
- **Información clara**: Página actual y total
- **Estado de botones**: Deshabilitados cuando corresponde
- **Contador de productos**: Total de resultados

## 💻 Ejemplos de Código

### Cargar Productos
```javascript
async function loadProducts() {
  const family = document.getElementById('familyFilter').value;
  const vigencia = document.getElementById('vigenciaFilter').value;
  const search = document.getElementById('searchInput').value;
  const limit = document.getElementById('limitSelect').value;
  const page = currentPage;

  let url = `${API_BASE}/api/essen/products?limit=${limit}&page=${page}`;
  
  if (family) url += `&familia=${family}`;
  if (vigencia) url += `&vigencia=${vigencia}`;
  if (search) url += `&search=${search}`;

  const response = await fetch(url);
  const data = await response.json();
  
  if (data.success) {
    renderProducts(data.data);
    updatePagination(data.pagination);
  }
}
```

### Renderizar Vista Cuadrícula
```javascript
function renderProducts(products) {
  const container = document.getElementById('productsContainer');
  
  container.innerHTML = `
    <div class="products-grid">
      ${products.map(product => `
        <div class="product-card">
          <div class="product-image">
            ${product.multimedia?.imagen ? 
              `<img src="${product.multimedia.imagen}" alt="${product.descripcion}">` :
              '<div class="no-image">Sin imagen</div>'
            }
          </div>
          <div class="product-combo">Combo ${product.combo}</div>
          <div class="product-title">${product.descripcion}</div>
          <div class="product-details">
            <span class="product-family">${product.familia}</span>
            <span class="product-line">${product.linea}</span>
            <span class="product-vigencia ${product.vigencia === 'SI' ? '' : 'inactive'}">
              ${product.vigencia === 'SI' ? 'Activo' : 'Inactivo'}
            </span>
          </div>
          <div class="pricing-notice">
            🔒 Para precios, contacte con nosotros
          </div>
        </div>
      `).join('')}
    </div>
  `;
}
```

### Renderizar Vista Lista
```javascript
function renderProducts(products) {
  const container = document.getElementById('productsContainer');
  
  container.innerHTML = `
    <div class="products-list">
      ${products.map(product => `
        <div class="product-item">
          <div class="product-item-image">
            ${product.multimedia?.imagen ? 
              `<img src="${product.multimedia.imagen}" alt="${product.descripcion}">` :
              '<div class="no-image">🍳</div>'
            }
          </div>
          <div class="product-item-info">
            <div class="product-item-title">
              Combo ${product.combo} - ${product.descripcion}
            </div>
            <div class="product-item-details">
              ${product.familia} • ${product.linea} • 
              <span class="product-vigencia ${product.vigencia === 'SI' ? '' : 'inactive'}">
                ${product.vigencia === 'SI' ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}
```

## 🎨 Estilos CSS

### Product Cards (Cuadrícula)
```css
.product-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
  border-color: #667eea;
}
```

### Product Items (Lista)
```css
.product-item {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 20px;
  transition: all 0.3s ease;
}

.product-item:hover {
  transform: translateX(5px);
  box-shadow: 0 5px 20px rgba(0,0,0,0.15);
}
```

### Badges de Estado
```css
.product-family {
  background: #e3f2fd;
  color: #1976d2;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.8rem;
}

.product-vigencia {
  background: #e8f5e8;
  color: #2e7d32;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.8rem;
}

.product-vigencia.inactive {
  background: #ffebee;
  color: #c62828;
}
```

## 📱 Responsive Design

### Desktop (> 768px)
- **Grid de 3-4 columnas** para vista cuadrícula
- **Lista con imágenes grandes** para vista lista
- **Controles horizontales** alineados

### Tablet (768px - 1024px)
- **Grid de 2 columnas** para vista cuadrícula
- **Lista con imágenes medianas** para vista lista
- **Controles adaptativos**

### Mobile (< 768px)
- **Grid de 1 columna** para vista cuadrícula
- **Lista vertical** con imágenes pequeñas
- **Controles apilados** verticalmente

## 🔧 Funcionalidades JavaScript

### Debounce para Búsqueda
```javascript
function debounceSearch() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage = 1;
    loadProducts();
  }, 500);
}
```

### Manejo de Errores de Imágenes
```javascript
<img src="${product.multimedia.imagen}" 
     alt="${product.descripcion}" 
     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
```

### Cambio de Vista
```javascript
function setView(view) {
  currentView = view;
  document.querySelectorAll('.view-btn').forEach(btn => 
    btn.classList.remove('active')
  );
  event.target.classList.add('active');
  loadProducts();
}
```

## 📊 Métricas de Performance

- **Tiempo de carga inicial**: < 2 segundos
- **Búsqueda con debounce**: 500ms delay
- **Cambio de vista**: Instantáneo
- **Paginación**: < 1 segundo
- **Responsive**: Adaptación automática

## 🚀 Casos de Uso

### Para Desarrolladores
1. **Ver ejemplos reales** de renderizado
2. **Copiar código** JavaScript y CSS
3. **Entender la estructura** de datos
4. **Probar diferentes vistas** y filtros

### Para Diseñadores
1. **Ver implementación visual** de la API
2. **Entender el flujo de usuario**
3. **Probar responsive design**
4. **Evaluar usabilidad**

### Para Product Managers
1. **Ver capacidades** de la API
2. **Entender limitaciones** (sin precios)
3. **Evaluar experiencia** de usuario
4. **Planificar funcionalidades**

## 🔒 Consideraciones de Seguridad

- **Sin precios**: Información financiera protegida
- **CORS configurado**: Solo orígenes permitidos
- **Validación de entrada**: Filtros sanitizados
- **Manejo de errores**: Respuestas controladas

## 📝 Mantenimiento

### Agregar Nuevos Filtros
1. Agregar control en HTML
2. Actualizar función `loadProducts()`
3. Probar en diferentes dispositivos

### Modificar Diseño
1. Editar estilos CSS
2. Verificar responsive
3. Probar accesibilidad

### Agregar Funcionalidades
1. Implementar en JavaScript
2. Actualizar ejemplos de código
3. Documentar cambios

---

*Vista previa creada para demostrar las capacidades de renderizado de la API Essen*
