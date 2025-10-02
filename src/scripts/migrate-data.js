import { google } from "googleapis";
import { prisma } from "../database/prisma.js";
import config from "../config/index.js";
import dotenv from "dotenv";

dotenv.config();

console.log("🔄 Iniciando migración de datos de Google Sheets a PostgreSQL...");

// Función para obtener datos de Google Sheets
async function getGoogleSheetsData() {
  try {
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    
    const auth = new google.auth.GoogleAuth({
      credentials: credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"]
    });
    
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: authClient });
    
    console.log("✅ Conectado a Google Sheets");
    
    // Obtener productos
    console.log("📦 Obteniendo productos...");
    const productosResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: config.GOOGLE_SHEET_ID,
      range: "A:AE",
    });
    
    const productosData = productosResponse.data.values || [];
    console.log(`📊 Productos encontrados: ${productosData.length}`);
    
    // Obtener usuarios
    console.log("👥 Obteniendo usuarios...");
    const usuariosResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: config.GOOGLE_SHEET_ID,
      range: "usuarios!A:G",
    });
    
    const usuariosData = usuariosResponse.data.values || [];
    console.log(`📊 Usuarios encontrados: ${usuariosData.length}`);
    
    return { productosData, usuariosData };
    
  } catch (error) {
    console.error("❌ Error al obtener datos de Google Sheets:", error.message);
    throw error;
  }
}

// Función para migrar productos
async function migrateProducts(productosData) {
  console.log("\n📦 Migrando productos...");
  
  // Saltar la primera fila (headers)
  const productos = productosData.slice(1);
  
  let migrated = 0;
  let errors = 0;
  
  for (const row of productos) {
    try {
      // Mapear datos según la estructura del Google Sheet
      const productData = {
        combo: row[0] ? parseInt(row[0]) : null,
        familia: row[1] || null,
        linea: row[2] || null,
        codigo: row[3] || null,
        descripcion: row[4] || null,
        puntos: row[5] || null,
        precio_preferencial: row[6] || null,
        precio_negocio: row[7] || null,
        precio_emprendedor_no_categorizado: row[8] || null,
        precio_emprendedor_categorizado_y_tdf: row[9] || null,
        precio_emprendedor_sin_iva: row[10] || null,
        psvp_lista: row[11] || null,
        veinticuatro_sin_interes: row[12] || null,
        veinte_sin_interes: row[13] || null,
        dieciocho_sin_interes: row[14] || null,
        quince_sin_interes: row[15] || null,
        catorce_sin_interes: row[16] || null,
        doce_sin_interes: row[17] || null,
        diez_sin_interes: row[18] || null,
        nueve_sin_interes: row[19] || null,
        seis_sin_interes: row[20] || null,
        tres_sin_interes: row[21] || null,
        por_comisionable: row[22] || null,
        vigencia: row[23] || null,
        tres_con_interes: row[24] || null,
        seis_con_interes: row[25] || null,
        valor_comisionable: row[26] || null,
        imagen: row[27] || null,
        ficha_tecnica: row[28] || null,
        discount: row[29] || null,
        event: row[30] || null
      };
      
      // Solo crear si tiene combo válido
      if (productData.combo) {
        await prisma.product.upsert({
          where: { combo: productData.combo },
          update: productData,
          create: productData
        });
        migrated++;
      }
      
    } catch (error) {
      console.error(`❌ Error al migrar producto ${row[0]}:`, error.message);
      errors++;
    }
  }
  
  console.log(`✅ Productos migrados: ${migrated}, Errores: ${errors}`);
}

// Función para migrar usuarios
async function migrateUsers(usuariosData) {
  console.log("\n👥 Migrando usuarios...");
  
  // Saltar la primera fila (headers)
  const usuarios = usuariosData.slice(1);
  
  let migrated = 0;
  let errors = 0;
  
  for (const row of usuarios) {
    try {
      const userData = {
        username: row[0] || null,
        password: row[1] || null,
        email: row[2] || null,
        nombre: row[3] || null,
        apellido: row[4] || null,
        rango: row[5] || null,
        codigo_emprendedora: row[6] || null,
        tipo_usuario: row[7] || null,
        estado: row[8] || "Activo"
      };
      
      // Solo crear si tiene username válido
      if (userData.username) {
        await prisma.user.upsert({
          where: { username: userData.username },
          update: userData,
          create: userData
        });
        migrated++;
      }
      
    } catch (error) {
      console.error(`❌ Error al migrar usuario ${row[0]}:`, error.message);
      errors++;
    }
  }
  
  console.log(`✅ Usuarios migrados: ${migrated}, Errores: ${errors}`);
}

// Función principal
async function main() {
  try {
    // Verificar conexión a la base de datos
    await prisma.$connect();
    console.log("✅ Conectado a PostgreSQL");
    
    // Obtener datos de Google Sheets
    const { productosData, usuariosData } = await getGoogleSheetsData();
    
    // Migrar productos
    await migrateProducts(productosData);
    
    // Migrar usuarios
    await migrateUsers(usuariosData);
    
    console.log("\n🎉 Migración completada exitosamente!");
    
  } catch (error) {
    console.error("❌ Error durante la migración:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar migración
main();
