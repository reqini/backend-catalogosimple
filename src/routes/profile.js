import express from "express";
import config from "../config/index.js";
import GoogleSheet from "../googleSheet/GoogleSheet.js";
import GoogleSpreadsheet from "google-spreadsheet";
import { authenticateUser } from "../middleware/auth.js";

const router = express.Router();
const googleSheet = new GoogleSheet(config.GOOGLE_CREDENTIALS, config.GOOGLE_SHEET_ID);

// Middleware para verificar que el usuario solo acceda a su propio perfil
const verifyOwnership = (req, res, next) => {
  const { username } = req.params;
  const tokenUsername = req.user.username;

  if (username !== tokenUsername) {
    return res.status(403).json({
      success: false,
      message: "No tienes permisos para acceder a este perfil"
    });
  }
  next();
};

// Helper function para encontrar fila de usuario en Google Sheets
const findUserRow = async (sheetName, username) => {
  try {
    const data = await googleSheet.getData(`${sheetName}!A:Z`);
    const userRow = data.find(row => row.username && row.username.toLowerCase() === username.toLowerCase());
    return userRow;
  } catch (error) {
    throw new Error(`Error al buscar usuario: ${error.message}`);
  }
};

// Helper function para obtener índice de fila
const getUserRowIndex = async (sheetName, username) => {
  try {
    const data = await googleSheet.getData(`${sheetName}!A:Z`);
    const rowIndex = data.findIndex(row => row.username && row.username.toLowerCase() === username.toLowerCase());
    return rowIndex + 2; // +2 porque Google Sheets empieza en 1 y tiene encabezado
  } catch (error) {
    throw new Error(`Error al obtener índice de fila: ${error.message}`);
  }
};

// 1. GET /api/profile/:username - Obtener datos del perfil
router.get("/:username", authenticateUser, verifyOwnership, async (req, res) => {
  try {
    const { username } = req.params;
    
    const userData = await findUserRow("Perfiles_Emprendedoras", username);
    
    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado"
      });
    }

    const profileData = {
      username: userData.username,
      email: userData.email,
      phone: userData.phone,
      address: userData.address,
      businessName: userData.businessName,
      businessType: userData.businessType,
      avatar: userData.avatar,
      rango: userData.rango,
      fechaRegistro: userData.fechaRegistro,
      preferences: {
        notifications: userData.notifications === "true",
        darkMode: userData.darkMode === "true",
        language: userData.language,
        theme: userData.theme
      }
    };

    res.json({
      success: true,
      data: profileData
    });

  } catch (error) {
    console.error("Error al obtener perfil:", error.message);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor"
    });
  }
});

// 2. PUT /api/profile/:username - Actualizar datos del perfil
router.put("/:username", authenticateUser, async (req, res) => {
  try {
    const { username } = req.params;
    const updateData = req.body;
    
    console.log('Actualizando perfil para:', username);
    console.log('Datos recibidos:', updateData);
    
    // Verificar permisos
    if (req.user.username !== username) {
      return res.status(403).json({ 
        success: false, 
        message: 'No tienes permisos para actualizar este perfil' 
      });
    }
    
    // Conectar con Google Sheets
    const doc = new GoogleSpreadsheet(config.GOOGLE_SHEET_ID);
    await doc.useServiceAccountAuth({
      client_email: config.GOOGLE_CREDENTIALS.client_email,
      private_key: config.GOOGLE_CREDENTIALS.private_key,
    });
    await doc.loadInfo();
    
    const sheet = doc.sheetsByTitle['Perfiles_Emprendedoras'];
    const rows = await sheet.getRows();
    
    // Buscar usuario
    const userRow = rows.find(row => row.username === username);
    
    if (!userRow) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Actualizar datos (solo los campos que vienen en el body)
    Object.keys(updateData).forEach(key => {
      if (key !== 'preferences' && updateData[key] !== undefined) {
        userRow[key] = updateData[key];
        console.log(`Actualizando ${key}: ${updateData[key]}`);
      }
    });
    
    // Actualizar preferencias si vienen
    if (updateData.preferences) {
      Object.keys(updateData.preferences).forEach(pref => {
        if (updateData.preferences[pref] !== undefined) {
          userRow[pref] = updateData.preferences[pref].toString();
          console.log(`Actualizando preferencia ${pref}: ${updateData.preferences[pref]}`);
        }
      });
    }
    
    // Guardar cambios
    await userRow.save();
    console.log('Perfil actualizado exitosamente');
    
    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente'
    });
    
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor: ' + error.message
    });
  }
});

// 3. GET /api/profile/:username/stats - Obtener estadísticas del usuario
router.get("/:username/stats", authenticateUser, verifyOwnership, async (req, res) => {
  try {
    const { username } = req.params;
    
    const userData = await findUserRow("Perfiles_Emprendedoras", username);
    
    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado"
      });
    }

    const statsData = {
      totalVentas: parseInt(userData.totalVentas) || 0,
      clientesActivos: parseInt(userData.clientesActivos) || 0,
      placasGeneradas: parseInt(userData.placasGeneradas) || 0,
      rating: parseFloat(userData.rating) || 0.0
    };

    res.json({
      success: true,
      data: statsData
    });

  } catch (error) {
    console.error("Error al obtener estadísticas:", error.message);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor"
    });
  }
});

// 4. POST /api/profile/:username/change-password - Cambiar contraseña
router.post("/:username/change-password", authenticateUser, verifyOwnership, async (req, res) => {
  try {
    const { username } = req.params;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validar datos de entrada
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Todos los campos son requeridos"
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Las contraseñas nuevas no coinciden"
      });
    }

    // Buscar usuario en la hoja de login (usuarios)
    const userData = await findUserRow("usuarios", username);
    
    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado"
      });
    }

    // Verificar contraseña actual
    if (userData.password !== currentPassword) {
      return res.status(400).json({
        success: false,
        message: "La contraseña actual es incorrecta"
      });
    }

    // Obtener índice de la fila para actualizar
    const rowIndex = await getUserRowIndex("usuarios", username);

    // Actualizar contraseña
    await googleSheet.updateData("usuarios", `C${rowIndex}`, [[newPassword]]);

    res.json({
      success: true,
      message: "Contraseña actualizada exitosamente"
    });

  } catch (error) {
    console.error("Error al cambiar contraseña:", error.message);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor"
    });
  }
});

export default router;
