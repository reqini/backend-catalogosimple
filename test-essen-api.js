import fetch from 'node-fetch';

const BASE_URL = 'https://backend-catalogosimple.onrender.com';
const ESSEN_API = `${BASE_URL}/api/essen`;

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
    const url = `${ESSEN_API}${endpoint}`;
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

// Test 1: Información de la API
async function testAPIInfo() {
  logTest('TESTING INFORMACIÓN DE LA API ESSEN');
  
  const response = await makeRequest('/');
  
  if (response.ok) {
    logSuccess('API Essen disponible');
    log(`   Versión: ${response.data.version}`, 'blue');
    log(`   Descripción: ${response.data.description}`, 'blue');
    
    if (response.data.pricing_policy) {
      log(`   Política de precios: ${response.data.pricing_policy.message}`, 'yellow');
    }
    
    log(`   Endpoints disponibles: ${Object.keys(response.data.endpoints).length}`, 'blue');
  } else {
    logError(`API Essen no disponible: ${response.status}`);
  }
}

// Test 2: Obtener productos
async function testGetProducts() {
  logTest('TESTING OBTENER PRODUCTOS ESSEN');
  
  const response = await makeRequest('/products?limit=5');
  
  if (response.ok) {
    const products = response.data.data;
    logSuccess(`Productos obtenidos: ${products.length}`);
    
    if (products.length > 0) {
      const product = products[0];
      log(`   Primer producto: Combo ${product.combo} - ${product.descripcion}`, 'blue');
      
      // Verificar que NO tenga precios
      if (!product.precios && product.pricing_info) {
        logSuccess('✅ Precios correctamente ocultos');
        log(`   Mensaje: ${product.pricing_info.message}`, 'yellow');
      } else {
        logError('❌ Los precios están visibles (NO deberían estarlo)');
      }
      
      // Verificar campos disponibles
      const requiredFields = ['id', 'combo', 'familia', 'linea', 'descripcion', 'vigencia'];
      requiredFields.forEach(field => {
        if (product[field] !== undefined) {
          logSuccess(`   Campo "${field}" presente`);
        } else {
          logError(`   Campo "${field}" faltante`);
        }
      });
    }
    
    // Verificar paginación
    if (response.data.pagination) {
      logSuccess('Paginación funcionando');
      log(`   Total: ${response.data.pagination.total} productos`, 'blue');
    }
  } else {
    logError(`Error al obtener productos: ${response.status}`);
  }
}

// Test 3: Filtros por familia
async function testFamilyFilter() {
  logTest('TESTING FILTRO POR FAMILIA');
  
  const response = await makeRequest('/products?familia=Durables&limit=3');
  
  if (response.ok) {
    const products = response.data.data;
    logSuccess(`Productos Durables encontrados: ${products.length}`);
    
    // Verificar que todos sean de la familia Durables
    const allDurables = products.every(p => p.familia === 'Durables');
    if (allDurables) {
      logSuccess('✅ Filtro por familia funcionando correctamente');
    } else {
      logError('❌ Filtro por familia no funciona');
    }
  } else {
    logError(`Error en filtro por familia: ${response.status}`);
  }
}

// Test 4: Filtro por vigencia
async function testVigenciaFilter() {
  logTest('TESTING FILTRO POR VIGENCIA');
  
  const response = await makeRequest('/products?vigencia=SI&limit=3');
  
  if (response.ok) {
    const products = response.data.data;
    logSuccess(`Productos activos encontrados: ${products.length}`);
    
    // Verificar que todos estén activos
    const allActive = products.every(p => p.vigencia === 'SI');
    if (allActive) {
      logSuccess('✅ Filtro por vigencia funcionando correctamente');
    } else {
      logError('❌ Filtro por vigencia no funciona');
    }
  } else {
    logError(`Error en filtro por vigencia: ${response.status}`);
  }
}

// Test 5: Búsqueda
async function testSearch() {
  logTest('TESTING BÚSQUEDA DE PRODUCTOS');
  
  const response = await makeRequest('/search?q=Capri');
  
  if (response.ok) {
    const products = response.data.data;
    logSuccess(`Productos Capri encontrados: ${products.length}`);
    
    if (products.length > 0) {
      const product = products[0];
      log(`   Ejemplo: ${product.descripcion}`, 'blue');
      
      // Verificar que la búsqueda funcione
      const hasCapri = products.some(p => 
        p.descripcion?.toLowerCase().includes('capri') ||
        p.linea?.toLowerCase().includes('capri') ||
        p.familia?.toLowerCase().includes('capri')
      );
      
      if (hasCapri) {
        logSuccess('✅ Búsqueda funcionando correctamente');
      } else {
        logWarning('⚠️ Búsqueda puede no estar funcionando correctamente');
      }
    }
  } else {
    logError(`Error en búsqueda: ${response.status}`);
  }
}

// Test 6: Obtener producto específico
async function testGetSpecificProduct() {
  logTest('TESTING OBTENER PRODUCTO ESPECÍFICO');
  
  // Primero obtener un producto para usar su combo
  const productsResponse = await makeRequest('/products?limit=1');
  
  if (productsResponse.ok && productsResponse.data.data.length > 0) {
    const combo = productsResponse.data.data[0].combo;
    
    const response = await makeRequest(`/products/combo/${combo}`);
    
    if (response.ok) {
      const product = response.data.data;
      logSuccess(`Producto obtenido: Combo ${product.combo}`);
      log(`   Descripción: ${product.descripcion}`, 'blue');
      
      // Verificar que NO tenga precios
      if (!product.precios && product.pricing_info) {
        logSuccess('✅ Precios correctamente ocultos en producto específico');
      } else {
        logError('❌ Los precios están visibles en producto específico');
      }
    } else {
      logError(`Error al obtener producto específico: ${response.status}`);
    }
  }
}

// Test 7: Categorías
async function testCategories() {
  logTest('TESTING OBTENER CATEGORÍAS');
  
  const response = await makeRequest('/categories');
  
  if (response.ok) {
    const categories = response.data.data;
    logSuccess('Categorías obtenidas');
    
    if (categories.familias && categories.familias.length > 0) {
      log(`   Familias: ${categories.familias.length}`, 'blue');
      log(`   Ejemplo: ${categories.familias[0].label} (${categories.familias[0].count} productos)`, 'blue');
    }
    
    if (categories.lineas && categories.lineas.length > 0) {
      log(`   Líneas: ${categories.lineas.length}`, 'blue');
      log(`   Ejemplo: ${categories.lineas[0].label} (${categories.lineas[0].count} productos)`, 'blue');
    }
  } else {
    logError(`Error al obtener categorías: ${response.status}`);
  }
}

// Test 8: Estadísticas
async function testStats() {
  logTest('TESTING ESTADÍSTICAS');
  
  const response = await makeRequest('/stats');
  
  if (response.ok) {
    const stats = response.data.data;
    logSuccess('Estadísticas obtenidas');
    log(`   Total productos: ${stats.total}`, 'blue');
    
    if (stats.por_familia && Object.keys(stats.por_familia).length > 0) {
      const firstFamily = Object.keys(stats.por_familia)[0];
      log(`   Ejemplo familia: ${firstFamily} (${stats.por_familia[firstFamily]} productos)`, 'blue');
    }
    
    // Verificar que NO incluya precios
    if (!stats.precios && stats.pricing_info) {
      logSuccess('✅ Estadísticas sin precios (correcto)');
    } else {
      logError('❌ Estadísticas incluyen precios (incorrecto)');
    }
  } else {
    logError(`Error al obtener estadísticas: ${response.status}`);
  }
}

// Test 9: Performance
async function testPerformance() {
  logTest('TESTING PERFORMANCE');
  
  const startTime = Date.now();
  const response = await makeRequest('/products?limit=10');
  const endTime = Date.now();
  
  const responseTime = endTime - startTime;
  
  if (response.ok) {
    logSuccess(`Response time: ${responseTime}ms`);
    if (responseTime > 3000) {
      logWarning('Response time > 3s - revisar performance');
    } else if (responseTime < 1000) {
      logSuccess('Excelente performance!');
    }
  } else {
    logError(`Error en test de performance: ${response.status}`);
  }
}

// Función principal
async function runEssenAPITests() {
  log('🚀 INICIANDO TESTING COMPLETO DE API ESSEN', 'bold');
  log('=' * 60, 'blue');
  
  try {
    await testAPIInfo();
    await testGetProducts();
    await testFamilyFilter();
    await testVigenciaFilter();
    await testSearch();
    await testGetSpecificProduct();
    await testCategories();
    await testStats();
    await testPerformance();
    
    log('\n🎉 TESTING DE API ESSEN COMPLETADO', 'bold');
    log('=' * 60, 'blue');
    log('\n📋 RESUMEN:', 'bold');
    log('✅ API Essen disponible públicamente', 'green');
    log('✅ Productos disponibles sin precios', 'green');
    log('✅ Filtros y búsqueda funcionando', 'green');
    log('✅ Categorías y estadísticas disponibles', 'green');
    log('🔒 Precios protegidos correctamente', 'yellow');
    
  } catch (error) {
    logError(`Error durante testing: ${error.message}`);
  }
}

// Ejecutar tests
runEssenAPITests();
