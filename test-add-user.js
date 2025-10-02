import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

const GOOGLE_SHEET_ID = "1ATl5Avm6NjoiaPrVOG8xw8fLAZeBfuf5HG-sGBMCGQw";

console.log("🔍 Probando agregar usuario nuevo al Google Sheet...");
console.log("📋 Sheet ID:", GOOGLE_SHEET_ID);

// Usar credenciales del .env
try {
  const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
  
  const auth = new google.auth.GoogleAuth({
    credentials: credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"]
  });
  
  const authClient = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: authClient });
  
  console.log("✅ Autenticación exitosa");
  
  // Buscar la hoja de usuarios (donde está el login)
  console.log("\n=== BUSCANDO HOJA DE USUARIOS ===");
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: GOOGLE_SHEET_ID,
  });
  
  console.log("📋 Hojas disponibles:");
  spreadsheet.data.sheets.forEach((sheet, index) => {
    console.log(`   ${index + 1}. ${sheet.properties.title}`);
  });
  
  // Buscar hoja que contenga usuarios (probablemente "usuarios", "users", o similar)
  const userSheet = spreadsheet.data.sheets.find(sheet => 
    sheet.properties.title.toLowerCase().includes('usuario') ||
    sheet.properties.title.toLowerCase().includes('user') ||
    sheet.properties.title.toLowerCase().includes('login')
  );
  
  if (!userSheet) {
    console.log("❌ No se encontró hoja de usuarios. Usando primera hoja disponible.");
    const firstSheet = spreadsheet.data.sheets[0];
    console.log(`📋 Usando hoja: ${firstSheet.properties.title}`);
    
    // Obtener datos de la primera hoja para ver su estructura
    const dataResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: `${firstSheet.properties.title}!A1:Z10`,
    });
    
    console.log("\n📊 Estructura de la hoja:");
    if (dataResponse.data.values) {
      dataResponse.data.values.forEach((row, index) => {
        if (index < 5) { // Mostrar solo las primeras 5 filas
          console.log(`   Fila ${index + 1}:`, row.slice(0, 5));
        }
      });
    }
    
    // Agregar usuario de prueba al final
    const timestamp = new Date().toISOString();
    const testUser = [
      `test_user_${Date.now()}`, // username
      "test@ejemplo.com", // email
      "123456", // password
      "Test User", // nombre
      "Test Apellido", // apellido
      "Activo", // estado
      timestamp // fecha_creacion
    ];
    
    console.log("\n=== AGREGANDO USUARIO DE PRUEBA ===");
    console.log("👤 Usuario de prueba:", testUser);
    
    await sheets.spreadsheets.values.append({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: `${firstSheet.properties.title}!A:Z`,
      valueInputOption: "RAW",
      requestBody: {
        values: [testUser]
      }
    });
    
    console.log("✅ Usuario de prueba agregado exitosamente");
    console.log("🎯 Ahora puedes verificar en el backend que este usuario aparece");
    
  } else {
    console.log(`✅ Hoja de usuarios encontrada: ${userSheet.properties.title}`);
    
    // Obtener datos de la hoja de usuarios
    const dataResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: `${userSheet.properties.title}!A1:Z10`,
    });
    
    console.log("\n📊 Estructura de usuarios:");
    if (dataResponse.data.values) {
      dataResponse.data.values.forEach((row, index) => {
        if (index < 5) {
          console.log(`   Fila ${index + 1}:`, row.slice(0, 5));
        }
      });
    }
    
    // Agregar usuario de prueba
    const timestamp = new Date().toISOString();
    const testUser = [
      `test_user_${Date.now()}`,
      "test@ejemplo.com",
      "123456",
      "Test User",
      "Test Apellido",
      "Activo",
      timestamp
    ];
    
    console.log("\n=== AGREGANDO USUARIO DE PRUEBA ===");
    console.log("👤 Usuario de prueba:", testUser);
    
    await sheets.spreadsheets.values.append({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: `${userSheet.properties.title}!A:Z`,
      valueInputOption: "RAW",
      requestBody: {
        values: [testUser]
      }
    });
    
    console.log("✅ Usuario de prueba agregado exitosamente");
  }
  
  console.log("\n🎉 PRUEBA COMPLETADA");
  console.log("💡 Ahora puedes verificar que el backend trae este usuario nuevo");
  
} catch (error) {
  console.error("❌ Error:", error.message);
  if (error.response) {
    console.error("📋 Detalles:", error.response.data);
  }
  console.log("\n💡 Las credenciales locales no funcionan. Usa el script con las nuevas credenciales:");
  console.log("   node test-new-credentials.js [archivo-credentials.json]");
}
