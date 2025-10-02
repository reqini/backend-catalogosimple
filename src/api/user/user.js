import express from "express"

import config from "../../config/index.js";
import GoogleSheet from "../../googleSheet/GoogleSheet.js";

const router = express.Router()

const googleSheet = new GoogleSheet(config.GOOGLE_CREDENTIALS, config.GOOGLE_SHEET_ID)

// Ruta para obtener usuarios
router.get("/all", async (_req, res) => {
  try {

    const users = await googleSheet.getData("usuarios");
    res.json(users);
  } catch (error) {
    console.error("Error al obtener usuarios:", error.message);
    res.status(500).json({ message: "Error al obtener usuarios" });
  }
});

// Ruta para actualizar la contraseña del usuario
router.post("/update-password", async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Se requieren nombre de usuario y contraseña"
    });
  }
  
  try {
    // Obtener todos los usuarios
    const usuarios = await googleSheet.getData("usuarios");
    
    // Buscar el usuario por username
    const userIndex = usuarios.findIndex(user => user.username === username);
    
    if (userIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: "Usuario no encontrado" 
      });
    }
    
    // Actualizar la contraseña (la columna B, y +2 porque la fila 1 son los encabezados)
    const rowIndex = userIndex + 2;
    await googleSheet.updateData("usuarios", `B${rowIndex}`, [[password]]);
    
    res.json({ 
      success: true, 
      message: "Contraseña actualizada correctamente" 
    });
  } catch (error) {
    console.error("Error al actualizar la contraseña:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Error al actualizar la contraseña" 
    });
  }
});

// Ruta para agregar usuario de prueba
router.post("/test-add-user", async (req, res) => {
  try {
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
    
    console.log("🧪 Agregando usuario de prueba:", testUser);
    
    // Agregar usuario a la hoja "usuarios"
    await googleSheet.addData("usuarios", testUser);
    
    res.json({ 
      success: true, 
      message: "Usuario de prueba agregado exitosamente",
      user: testUser[0]
    });
  } catch (error) {
    console.error("Error al agregar usuario de prueba:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Error al agregar usuario de prueba: " + error.message
    });
  }
});

// Ruta para eliminar usuario de Google Sheets
router.post("/delete-account", async (req, res) => {
  const { username } = req.body;
  
  if (!username) {
    return res.status(400).json({
      success: false,
      message: "Se requiere nombre de usuario"
    });
  }
  
  try {
    // Obtener todos los usuarios
    const usuarios = await googleSheet.getData("usuarios");
    
    // Buscar el usuario por username
    const userIndex = usuarios.findIndex(user => user.username === username);
    
    if (userIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: "Usuario no encontrado" 
      });
    }
    
    // Borrar los datos del usuario (vaciar las celdas)
    const rowIndex = userIndex + 2;
    await googleSheet.updateData("usuarios", `A${rowIndex}:C${rowIndex}`, [["", "", ""]]);
    
    res.json({ 
      success: true, 
      message: "Cuenta eliminada correctamente" 
    });
  } catch (error) {
    console.error("Error al eliminar la cuenta:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Error al eliminar la cuenta" 
    });
  }
});

export default router