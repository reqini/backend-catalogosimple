import { prisma } from './src/database/prisma.js';

console.log('🧪 TESTING LOCAL - BASE DE DATOS POSTGRESQL');
console.log('=' * 50);

async function testLocalDatabase() {
  try {
    console.log('📡 Conectando a la base de datos...');
    await prisma.$connect();
    console.log('✅ Conexión exitosa');

    // Test 1: Verificar si hay productos
    console.log('\n📦 Verificando productos...');
    const productos = await prisma.product.count();
    console.log(`   Total productos: ${productos}`);

    if (productos > 0) {
      const firstProduct = await prisma.product.findFirst();
      console.log(`   Primer producto: ${firstProduct.combo} - ${firstProduct.descripcion}`);
    }

    // Test 2: Verificar si hay usuarios
    console.log('\n👥 Verificando usuarios...');
    const usuarios = await prisma.user.count();
    console.log(`   Total usuarios: ${usuarios}`);

    if (usuarios > 0) {
      const firstUser = await prisma.user.findFirst();
      console.log(`   Primer usuario: ${firstUser.username}`);
    }

    // Test 3: Verificar si hay ventas
    console.log('\n💰 Verificando ventas...');
    const ventas = await prisma.sale.count();
    console.log(`   Total ventas: ${ventas}`);

    // Test 4: Verificar si hay clientes
    console.log('\n👤 Verificando clientes...');
    const clientes = await prisma.client.count();
    console.log(`   Total clientes: ${clientes}`);

    // Test 5: Estadísticas del dashboard
    console.log('\n📊 Estadísticas del dashboard...');
    const stats = {
      productos: await prisma.product.count(),
      usuarios: await prisma.user.count(),
      ventas: await prisma.sale.count(),
      clientes: await prisma.client.count()
    };
    
    console.log('   Resumen:');
    console.log(`   - Productos: ${stats.productos}`);
    console.log(`   - Usuarios: ${stats.usuarios}`);
    console.log(`   - Ventas: ${stats.ventas}`);
    console.log(`   - Clientes: ${stats.clientes}`);

    console.log('\n🎉 Testing local completado exitosamente!');

  } catch (error) {
    console.error('❌ Error durante testing local:', error.message);
    
    if (error.message.includes('connect')) {
      console.log('\n💡 SOLUCIÓN:');
      console.log('   1. Configurar DATABASE_URL en .env');
      console.log('   2. Ejecutar: npm run db:push');
      console.log('   3. Ejecutar: npm run db:migrate-data');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testLocalDatabase();
