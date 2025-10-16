import fetch from 'node-fetch';

const BASE_URL = 'https://backend-catalogosimple.onrender.com';
const API_BASE = `${BASE_URL}/api`;

// Colores para output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName) {
  log(`\n🧪 ${testName}`, 'blue');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Función para hacer requests
async function makeRequest(endpoint, options = {}) {
  try {
    const url = `${API_BASE}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    const data = await response.json();
    
    return {
      ok: response.ok,
      status: response.status,
      data,
      headers: response.headers
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      data: { error: error.message },
      headers: {}
    };
  }
}

// Test 1: Verificar endpoints legacy (Google Sheets)
async function testLegacyEndpoints() {
  logTest('TESTING ENDPOINTS LEGACY (Google Sheets)');
  
  // Test productos legacy
  const productosLegacy = await makeRequest('/productos');
  if (productosLegacy.ok) {
    logSuccess(`Productos legacy: ${productosLegacy.data.length} productos encontrados`);
  } else {
    logError(`Productos legacy falló: ${productosLegacy.data.error || productosLegacy.status}`);
  }

  // Test usuarios legacy
  const usuariosLegacy = await makeRequest('/user/all');
  if (usuariosLegacy.ok) {
    logSuccess(`Usuarios legacy: ${usuariosLegacy.data.length} usuarios encontrados`);
  } else {
    logError(`Usuarios legacy falló: ${usuariosLegacy.data.error || usuariosLegacy.status}`);
  }
}

// Test 2: Verificar endpoints nuevos (PostgreSQL)
async function testNewEndpoints() {
  logTest('TESTING ENDPOINTS NUEVOS (PostgreSQL)');
  
  // Test productos nuevos
  const productos = await makeRequest('/products');
  if (productos.ok) {
    logSuccess(`Productos nuevos: ${productos.data.data?.length || 0} productos encontrados`);
    log(`   Paginación: ${JSON.stringify(productos.data.pagination)}`, 'blue');
  } else {
    logError(`Productos nuevos falló: ${productos.data.error || productos.status}`);
    if (productos.status === 500) {
      logWarning('Posible problema: Base de datos no configurada o Prisma no inicializado');
    }
  }

  // Test usuarios nuevos
  const usuarios = await makeRequest('/users');
  if (usuarios.ok) {
    logSuccess(`Usuarios nuevos: ${usuarios.data.data?.length || 0} usuarios encontrados`);
  } else {
    logError(`Usuarios nuevos falló: ${usuarios.data.error || usuarios.status}`);
  }

  // Test ventas nuevas
  const ventas = await makeRequest('/sales');
  if (ventas.ok) {
    logSuccess(`Ventas nuevas: ${ventas.data.data?.length || 0} ventas encontradas`);
  } else {
    logError(`Ventas nuevas falló: ${ventas.data.error || ventas.status}`);
  }

  // Test clientes nuevos
  const clientes = await makeRequest('/clients');
  if (clientes.ok) {
    logSuccess(`Clientes nuevos: ${clientes.data.data?.length || 0} clientes encontrados`);
  } else {
    logError(`Clientes nuevos falló: ${clientes.data.error || clientes.status}`);
  }

  // Test dashboard
  const dashboard = await makeRequest('/dashboard/overview');
  if (dashboard.ok) {
    logSuccess(`Dashboard: Estadísticas obtenidas correctamente`);
    log(`   Productos: ${dashboard.data.data?.productos?.total || 0}`, 'blue');
    log(`   Usuarios: ${dashboard.data.data?.usuarios?.total || 0}`, 'blue');
    log(`   Ventas: ${dashboard.data.data?.ventas?.total || 0}`, 'blue');
  } else {
    logError(`Dashboard falló: ${dashboard.data.error || dashboard.status}`);
  }
}

// Test 3: Verificar estructura de respuestas
async function testResponseStructure() {
  logTest('TESTING ESTRUCTURA DE RESPUESTAS');
  
  const response = await makeRequest('/products');
  
  if (response.ok) {
    const data = response.data;
    
    // Verificar estructura básica
    if (data.success !== undefined) {
      logSuccess('Campo "success" presente');
    } else {
      logError('Campo "success" faltante');
    }

    if (data.data !== undefined) {
      logSuccess('Campo "data" presente');
    } else {
      logError('Campo "data" faltante');
    }

    if (data.pagination !== undefined) {
      logSuccess('Paginación presente');
      log(`   Estructura: ${JSON.stringify(Object.keys(data.pagination))}`, 'blue');
    } else {
      logWarning('Paginación no presente');
    }

    // Verificar estructura de productos
    if (data.data && data.data.length > 0) {
      const product = data.data[0];
      const requiredFields = ['id', 'combo', 'familia', 'linea', 'descripcion'];
      
      requiredFields.forEach(field => {
        if (product[field] !== undefined) {
          logSuccess(`Campo "${field}" presente en productos`);
        } else {
          logError(`Campo "${field}" faltante en productos`);
        }
      });
    }
  }
}

// Test 4: Verificar paginación y filtros
async function testPaginationAndFilters() {
  logTest('TESTING PAGINACIÓN Y FILTROS');
  
  // Test paginación
  const page1 = await makeRequest('/products?page=1&limit=5');
  if (page1.ok && page1.data.pagination) {
    logSuccess(`Página 1: ${page1.data.data.length} productos`);
    log(`   Total: ${page1.data.pagination.total}`, 'blue');
  }

  // Test filtros
  const filtered = await makeRequest('/products?familia=Durables');
  if (filtered.ok) {
    logSuccess(`Filtro por familia: ${filtered.data.data.length} productos`);
  }

  const vigencia = await makeRequest('/products?vigencia=SI');
  if (vigencia.ok) {
    logSuccess(`Filtro por vigencia: ${vigencia.data.data.length} productos`);
  }
}

// Test 5: Verificar manejo de errores
async function testErrorHandling() {
  logTest('TESTING MANEJO DE ERRORES');
  
  // Test producto inexistente
  const notFound = await makeRequest('/products/99999');
  if (notFound.status === 404) {
    logSuccess('Error 404 manejado correctamente');
  } else {
    logError(`Error 404 no manejado: ${notFound.status}`);
  }

  // Test endpoint inexistente
  const badEndpoint = await makeRequest('/nonexistent');
  if (badEndpoint.status === 404) {
    logSuccess('Endpoint inexistente manejado correctamente');
  } else {
    logError(`Endpoint inexistente no manejado: ${badEndpoint.status}`);
  }
}

// Test 6: Verificar performance
async function testPerformance() {
  logTest('TESTING PERFORMANCE');
  
  const startTime = Date.now();
  const response = await makeRequest('/products');
  const endTime = Date.now();
  
  const responseTime = endTime - startTime;
  
  if (response.ok) {
    logSuccess(`Response time: ${responseTime}ms`);
    if (responseTime > 5000) {
      logWarning('Response time > 5s - posible problema de performance');
    }
  }
}

// Test 7: Verificar CORS y headers
async function testCORS() {
  logTest('TESTING CORS Y HEADERS');
  
  const response = await makeRequest('/products');
  
  if (response.headers) {
    const corsHeader = response.headers.get('access-control-allow-origin');
    if (corsHeader) {
      logSuccess(`CORS configurado: ${corsHeader}`);
    } else {
      logWarning('CORS no configurado');
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      logSuccess('Content-Type correcto');
    } else {
      logError('Content-Type incorrecto');
    }
  }
}

// Función principal
async function runAllTests() {
  log('🚀 INICIANDO TESTING COMPLETO DE API', 'bold');
  log('=' * 50, 'blue');
  
  try {
    await testLegacyEndpoints();
    await testNewEndpoints();
    await testResponseStructure();
    await testPaginationAndFilters();
    await testErrorHandling();
    await testPerformance();
    await testCORS();
    
    log('\n🎉 TESTING COMPLETADO', 'bold');
    log('=' * 50, 'blue');
    
  } catch (error) {
    logError(`Error durante testing: ${error.message}`);
  }
}

// Ejecutar tests
runAllTests();
