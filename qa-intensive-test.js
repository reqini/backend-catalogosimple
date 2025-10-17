import fetch from 'node-fetch';

const BASE_URL = 'https://backend-catalogosimple.onrender.com';
const API_BASE = `${BASE_URL}/api`;

// Colores para output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`🧪 ${title}`, 'bold');
  log(`${'='.repeat(60)}`, 'cyan');
}

function logTest(testName) {
  log(`\n🔍 ${testName}`, 'blue');
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

function logInfo(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

// Función para hacer requests
async function makeRequest(endpoint, options = {}) {
  const startTime = Date.now();
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
    const endTime = Date.now();
    
    return {
      ok: response.ok,
      status: response.status,
      data,
      headers: response.headers,
      responseTime: endTime - startTime
    };
  } catch (error) {
    const endTime = Date.now();
    return {
      ok: false,
      status: 0,
      data: { error: error.message },
      headers: {},
      responseTime: endTime - startTime
    };
  }
}

// Test de endpoints legacy (Google Sheets)
async function testLegacyEndpoints() {
  logSection('TESTING ENDPOINTS LEGACY (Google Sheets)');
  
  const legacyTests = [
    { name: 'Productos Legacy', endpoint: '/productos' },
    { name: 'Usuarios Legacy', endpoint: '/user/all' },
    { name: 'Ventas Legacy', endpoint: '/ventas' },
    { name: 'Clientes Legacy', endpoint: '/clientes' },
    { name: 'Bancos Legacy', endpoint: '/bancos' }
  ];

  for (const test of legacyTests) {
    logTest(test.name);
    const result = await makeRequest(test.endpoint);
    
    if (result.ok) {
      logSuccess(`${test.name}: Status ${result.status} - ${result.responseTime}ms`);
      if (Array.isArray(result.data)) {
        logInfo(`   Datos: ${result.data.length} elementos`);
      } else if (result.data.success !== undefined) {
        logInfo(`   Success: ${result.data.success}`);
      }
    } else {
      logError(`${test.name}: Status ${result.status} - ${result.data.error || 'Error desconocido'}`);
    }
  }
}

// Test de endpoints nuevos (PostgreSQL)
async function testNewEndpoints() {
  logSection('TESTING ENDPOINTS NUEVOS (PostgreSQL)');
  
  const newTests = [
    { name: 'Productos Nuevos', endpoint: '/products' },
    { name: 'Usuarios Nuevos', endpoint: '/users' },
    { name: 'Ventas Nuevas', endpoint: '/sales' },
    { name: 'Clientes Nuevos', endpoint: '/clients' },
    { name: 'Dashboard', endpoint: '/dashboard/overview' }
  ];

  for (const test of newTests) {
    logTest(test.name);
    const result = await makeRequest(test.endpoint);
    
    if (result.ok) {
      logSuccess(`${test.name}: Status ${result.status} - ${result.responseTime}ms`);
      if (result.data.data && Array.isArray(result.data.data)) {
        logInfo(`   Datos: ${result.data.data.length} elementos`);
      }
      if (result.data.pagination) {
        logInfo(`   Paginación: ${result.data.pagination.total} total`);
      }
    } else {
      logError(`${test.name}: Status ${result.status} - ${result.data.error || 'Error desconocido'}`);
      if (result.status === 404) {
        logWarning('   Posible causa: PostgreSQL no configurado en Render');
      }
    }
  }
}

// Test de API Essen
async function testEssenAPI() {
  logSection('TESTING API ESSEN (PÚBLICA)');
  
  const essenTests = [
    { name: 'Info API Essen', endpoint: '/essen/' },
    { name: 'Productos Essen', endpoint: '/essen/products?limit=5' },
    { name: 'Categorías Essen', endpoint: '/essen/categories' },
    { name: 'Estadísticas Essen', endpoint: '/essen/stats' },
    { name: 'Búsqueda Essen', endpoint: '/essen/search?q=Capri' },
    { name: 'Producto por Combo', endpoint: '/essen/products/combo/505' }
  ];

  for (const test of essenTests) {
    logTest(test.name);
    const result = await makeRequest(test.endpoint);
    
    if (result.ok) {
      logSuccess(`${test.name}: Status ${result.status} - ${result.responseTime}ms`);
      
      // Verificar estructura de respuesta
      if (result.data.success !== undefined) {
        logInfo(`   Success: ${result.data.success}`);
      }
      
      // Verificar que no hay precios
      if (test.name.includes('Productos') && result.data.data) {
        const hasPricing = result.data.data.some(product => product.precios);
        if (hasPricing) {
          logError('   ❌ ERROR: Se encontraron precios en API pública');
        } else {
          logSuccess('   ✅ Precios correctamente ocultos');
        }
      }
      
      // Verificar información de contacto
      if (result.data.pricing_info || result.data.pricing_policy) {
        const contactInfo = result.data.pricing_info || result.data.pricing_policy;
        if (contactInfo.contact && contactInfo.contact.includes('11 5793-5007')) {
          logSuccess('   ✅ Información de contacto actualizada');
        } else {
          logWarning('   ⚠️ Información de contacto no actualizada');
        }
      }
    } else {
      logError(`${test.name}: Status ${result.status} - ${result.data.error || 'Error desconocido'}`);
    }
  }
}

// Test de páginas web
async function testWebPages() {
  logSection('TESTING PÁGINAS WEB');
  
  const webTests = [
    { name: 'Landing Principal', url: `${BASE_URL}/` },
    { name: 'Vista Previa', url: `${BASE_URL}/preview.html` }
  ];

  for (const test of webTests) {
    logTest(test.name);
    const startTime = Date.now();
    
    try {
      const response = await fetch(test.url);
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      if (response.ok) {
        logSuccess(`${test.name}: Status ${response.status} - ${responseTime}ms`);
        
        // Verificar contenido HTML
        const html = await response.text();
        
        if (test.name.includes('Landing')) {
          if (html.includes('API Essen')) {
            logSuccess('   ✅ Contenido de landing correcto');
          } else {
            logError('   ❌ Contenido de landing incorrecto');
          }
          
          if (html.includes('11 5793-5007')) {
            logSuccess('   ✅ Número de WhatsApp actualizado');
          } else {
            logWarning('   ⚠️ Número de WhatsApp no encontrado');
          }
        }
        
        if (test.name.includes('Vista Previa')) {
          if (html.includes('Vista Previa')) {
            logSuccess('   ✅ Contenido de vista previa correcto');
          } else {
            logError('   ❌ Contenido de vista previa incorrecto');
          }
          
          if (html.includes('loading') && html.includes('lazy')) {
            logSuccess('   ✅ Lazy loading implementado');
          } else {
            logWarning('   ⚠️ Lazy loading no encontrado');
          }
        }
        
      } else {
        logError(`${test.name}: Status ${response.status}`);
      }
    } catch (error) {
      logError(`${test.name}: Error de conexión - ${error.message}`);
    }
  }
}

// Test de performance
async function testPerformance() {
  logSection('TESTING PERFORMANCE');
  
  const performanceTests = [
    { name: 'API Essen - Productos', endpoint: '/essen/products?limit=50' },
    { name: 'API Essen - Estadísticas', endpoint: '/essen/stats' },
    { name: 'API Essen - Búsqueda', endpoint: '/essen/search?q=Durables' },
    { name: 'Legacy - Productos', endpoint: '/productos' }
  ];

  for (const test of performanceTests) {
    logTest(test.name);
    
    // Hacer 3 requests para promediar
    const times = [];
    for (let i = 0; i < 3; i++) {
      const result = await makeRequest(test.endpoint);
      if (result.ok) {
        times.push(result.responseTime);
      }
    }
    
    if (times.length > 0) {
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      const minTime = Math.min(...times);
      const maxTime = Math.max(...times);
      
      logInfo(`   Tiempo promedio: ${Math.round(avgTime)}ms`);
      logInfo(`   Tiempo mínimo: ${minTime}ms`);
      logInfo(`   Tiempo máximo: ${maxTime}ms`);
      
      if (avgTime < 1000) {
        logSuccess('   ✅ Excelente performance');
      } else if (avgTime < 3000) {
        logWarning('   ⚠️ Performance aceptable');
      } else {
        logError('   ❌ Performance lenta');
      }
    } else {
      logError('   ❌ No se pudo medir performance');
    }
  }
}

// Test de filtros y paginación
async function testFiltersAndPagination() {
  logSection('TESTING FILTROS Y PAGINACIÓN');
  
  const filterTests = [
    { name: 'Filtro por Familia', endpoint: '/essen/products?familia=Durables&limit=5' },
    { name: 'Filtro por Vigencia', endpoint: '/essen/products?vigencia=SI&limit=5' },
    { name: 'Paginación - Página 1', endpoint: '/essen/products?page=1&limit=10' },
    { name: 'Paginación - Página 2', endpoint: '/essen/products?page=2&limit=10' },
    { name: 'Búsqueda Compleja', endpoint: '/essen/search?q=Capri&familia=Durables' }
  ];

  for (const test of filterTests) {
    logTest(test.name);
    const result = await makeRequest(test.endpoint);
    
    if (result.ok) {
      logSuccess(`${test.name}: Status ${result.status}`);
      
      // Verificar estructura de respuesta
      if (result.data.data && Array.isArray(result.data.data)) {
        logInfo(`   Resultados: ${result.data.data.length}`);
        
        // Verificar filtros
        if (test.name.includes('Familia') && result.data.data.length > 0) {
          const allDurables = result.data.data.every(p => p.familia === 'Durables');
          if (allDurables) {
            logSuccess('   ✅ Filtro por familia funciona');
          } else {
            logError('   ❌ Filtro por familia no funciona');
          }
        }
        
        if (test.name.includes('Vigencia') && result.data.data.length > 0) {
          const allActive = result.data.data.every(p => p.vigencia === 'SI');
          if (allActive) {
            logSuccess('   ✅ Filtro por vigencia funciona');
          } else {
            logError('   ❌ Filtro por vigencia no funciona');
          }
        }
      }
      
      // Verificar paginación
      if (result.data.pagination) {
        const pagination = result.data.pagination;
        logInfo(`   Paginación: ${pagination.page}/${pagination.pages} (${pagination.total} total)`);
        
        if (test.name.includes('Página 1') && pagination.page === 1) {
          logSuccess('   ✅ Paginación página 1 correcta');
        }
        
        if (test.name.includes('Página 2') && pagination.page === 2) {
          logSuccess('   ✅ Paginación página 2 correcta');
        }
      }
    } else {
      logError(`${test.name}: Status ${result.status}`);
    }
  }
}

// Test de manejo de errores
async function testErrorHandling() {
  logSection('TESTING MANEJO DE ERRORES');
  
  const errorTests = [
    { name: 'Producto Inexistente', endpoint: '/essen/products/99999' },
    { name: 'Combo Inexistente', endpoint: '/essen/products/combo/99999' },
    { name: 'Endpoint Inexistente', endpoint: '/essen/nonexistent' },
    { name: 'Parámetros Inválidos', endpoint: '/essen/products?limit=abc' },
    { name: 'Búsqueda Vacía', endpoint: '/essen/search' }
  ];

  for (const test of errorTests) {
    logTest(test.name);
    const result = await makeRequest(test.endpoint);
    
    if (result.status === 404 || result.status === 400) {
      logSuccess(`${test.name}: Error ${result.status} manejado correctamente`);
      if (result.data.message) {
        logInfo(`   Mensaje: ${result.data.message}`);
      }
    } else if (result.ok) {
      logWarning(`${test.name}: Debería devolver error pero devolvió ${result.status}`);
    } else {
      logError(`${test.name}: Error inesperado ${result.status}`);
    }
  }
}

// Test de estructura de datos
async function testDataStructure() {
  logSection('TESTING ESTRUCTURA DE DATOS');
  
  logTest('Estructura de Producto Essen');
  const result = await makeRequest('/essen/products?limit=1');
  
  if (result.ok && result.data.data && result.data.data.length > 0) {
    const product = result.data.data[0];
    const requiredFields = ['id', 'combo', 'familia', 'linea', 'descripcion', 'vigencia'];
    const forbiddenFields = ['precios', 'cuotas', 'comisiones'];
    
    logInfo('Verificando campos requeridos:');
    requiredFields.forEach(field => {
      if (product[field] !== undefined) {
        logSuccess(`   ✅ ${field}: presente`);
      } else {
        logError(`   ❌ ${field}: faltante`);
      }
    });
    
    logInfo('Verificando campos prohibidos:');
    forbiddenFields.forEach(field => {
      if (product[field] === undefined) {
        logSuccess(`   ✅ ${field}: correctamente oculto`);
      } else {
        logError(`   ❌ ${field}: ERROR - no debería estar visible`);
      }
    });
    
    // Verificar pricing_info
    if (product.pricing_info) {
      logSuccess('   ✅ pricing_info: presente');
      if (product.pricing_info.contact_message && product.pricing_info.contact_message.includes('11 5793-5007')) {
        logSuccess('   ✅ Información de contacto actualizada');
      } else {
        logWarning('   ⚠️ Información de contacto no actualizada');
      }
    } else {
      logError('   ❌ pricing_info: faltante');
    }
  } else {
    logError('No se pudo obtener producto para verificar estructura');
  }
}

// Test de seguridad
async function testSecurity() {
  logSection('TESTING SEGURIDAD');
  
  const securityTests = [
    { name: 'CORS Headers', endpoint: '/essen/' },
    { name: 'Content-Type', endpoint: '/essen/products?limit=1' },
    { name: 'Rate Limiting', endpoint: '/essen/products?limit=1' }
  ];

  for (const test of securityTests) {
    logTest(test.name);
    const result = await makeRequest(test.endpoint);
    
    if (test.name.includes('CORS')) {
      const corsHeader = result.headers.get('access-control-allow-origin');
      if (corsHeader) {
        logSuccess(`   ✅ CORS configurado: ${corsHeader}`);
      } else {
        logWarning('   ⚠️ CORS no configurado');
      }
    }
    
    if (test.name.includes('Content-Type')) {
      const contentType = result.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        logSuccess('   ✅ Content-Type correcto');
      } else {
        logError('   ❌ Content-Type incorrecto');
      }
    }
  }
  
  // Test de protección de precios
  logTest('Protección de Precios');
  const pricingTest = await makeRequest('/essen/products?limit=10');
  
  if (pricingTest.ok && pricingTest.data.data) {
    const hasPricing = pricingTest.data.data.some(product => 
      product.precios || product.cuotas || product.comisiones
    );
    
    if (!hasPricing) {
      logSuccess('   ✅ Precios correctamente protegidos');
    } else {
      logError('   ❌ ERROR CRÍTICO: Precios expuestos en API pública');
    }
  }
}

// Función principal
async function runIntensiveQA() {
  log('🚀 INICIANDO QA INTENSIVO COMPLETO', 'bold');
  log('Sistema: API Essen + Landing + Vista Previa', 'cyan');
  log(`URL Base: ${BASE_URL}`, 'cyan');
  
  const startTime = Date.now();
  
  try {
    await testLegacyEndpoints();
    await testNewEndpoints();
    await testEssenAPI();
    await testWebPages();
    await testPerformance();
    await testFiltersAndPagination();
    await testErrorHandling();
    await testDataStructure();
    await testSecurity();
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    logSection('RESUMEN FINAL');
    log(`⏱️ Tiempo total de testing: ${totalTime}ms`, 'cyan');
    log('📊 Tests ejecutados:', 'cyan');
    log('   - Endpoints Legacy (Google Sheets)', 'cyan');
    log('   - Endpoints Nuevos (PostgreSQL)', 'cyan');
    log('   - API Essen Pública', 'cyan');
    log('   - Páginas Web', 'cyan');
    log('   - Performance', 'cyan');
    log('   - Filtros y Paginación', 'cyan');
    log('   - Manejo de Errores', 'cyan');
    log('   - Estructura de Datos', 'cyan');
    log('   - Seguridad', 'cyan');
    
    log('\n🎉 QA INTENSIVO COMPLETADO', 'bold');
    
  } catch (error) {
    logError(`Error durante QA: ${error.message}`);
  }
}

// Ejecutar QA
runIntensiveQA();
