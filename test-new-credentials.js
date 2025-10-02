import { google } from "googleapis";
import fs from "fs";

const GOOGLE_SHEET_ID = "1ATl5Avm6NjoiaPrVOG8xw8fLAZeBfuf5HG-sGBMCGQw";

console.log("🔍 Probando nuevas credenciales de Google Sheets...");
console.log("📋 Sheet ID:", GOOGLE_SHEET_ID);
console.log("📄 Archivo de credenciales:", process.argv[2] || "credentials.json");

// Leer credenciales desde archivo JSON
let credentials;
try {
  const credFile = process.argv[2] || "credentials.json";
  const credData = fs.readFileSync(credFile, 'utf8');
  credentials = JSON.parse(credData);
  console.log("✅ Credenciales cargadas desde:", credFile);
} catch (error) {
  console.error("❌ Error al cargar credenciales:", error.message);
  console.log("💡 Uso: node test-new-credentials.js [archivo-credentials.json]");
  process.exit(1);
}

console.log("📧 Client Email:", credentials.client_email);
console.log("🔑 Private Key ID:", credentials.private_key_id);

try {
  // Crear cliente de autenticación
  console.log("\n=== PROBANDO AUTENTICACIÓN ===");
  const auth = new google.auth.GoogleAuth({
    credentials: credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"]
  });
  
  const authClient = await auth.getClient();
  console.log("✅ Cliente de autenticación creado");
  
  // Probar acceso a la hoja
  const sheets = google.sheets({ version: "v4", auth: authClient });
  
  console.log("📊 Probando acceso a la hoja...");
  const response = await sheets.spreadsheets.get({
    spreadsheetId: GOOGLE_SHEET_ID,
  });
  
  console.log("✅ Acceso exitoso!");
  console.log("📋 Título de la hoja:", response.data.properties.title);
  
  // Probar lectura de datos
  console.log("\n=== PROBANDO LECTURA DE DATOS ===");
  const dataResponse = await sheets.spreadsheets.values.get({
    spreadsheetId: GOOGLE_SHEET_ID,
    range: "A:AE",
  });
  
  console.log("✅ Lectura exitosa!");
  console.log("📊 Filas encontradas:", dataResponse.data.values?.length || 0);
  
  if (dataResponse.data.values && dataResponse.data.values.length > 0) {
    console.log("📋 Primera fila (headers):", dataResponse.data.values[0].slice(0, 5));
    
    // Buscar los productos específicos 496-504
    console.log("\n=== BUSCANDO PRODUCTOS 496-504 ===");
    const targetProducts = ["496", "497", "498", "499", "500", "501", "502", "503", "504"];
    let foundProducts = [];
    
    for (let i = 1; i < dataResponse.data.values.length; i++) {
      const row = dataResponse.data.values[i];
      if (row && row[0] && targetProducts.includes(row[0].toString())) {
        foundProducts.push({
          combo: row[0],
          codigo: row[3],
          descripcion: row[4]
        });
      }
    }
    
    console.log("🎯 Productos encontrados:", foundProducts.length);
    foundProducts.forEach(p => {
      console.log(`   Combo ${p.combo}: ${p.codigo} - ${p.descripcion}`);
    });
  }
  
  console.log("\n🎉 ¡CREDENCIALES VÁLIDAS! Ahora puedes actualizar el .env");
  console.log("📝 Copia el contenido del archivo JSON a GOOGLE_CREDENTIALS en .env");
  
} catch (error) {
  console.error("❌ Error:", error.message);
  if (error.response) {
    console.error("📋 Detalles:", error.response.data);
  }
  console.log("\n💡 Las credenciales aún no funcionan. Verifica que el service account tenga permisos de Editor en el Google Sheet.");
}
