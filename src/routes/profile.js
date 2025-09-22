import express from "express";
import config from "../config/index.js";
import GoogleSheet from "../googleSheet/GoogleSheet.js";
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
router.put("/:username", authenticateUser, verifyOwnership, async (req, res) => {
  try {
    const { username } = req.params;
    const updates = req.body;

    // Verificar que el usuario existe
    const userData = await findUserRow("Perfiles_Emprendedoras", username);
    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado"
      });
    }

    // Obtener índice de la fila
    const rowIndex = await getUserRowIndex("Perfiles_Emprendedoras", username);

    // Preparar actualizaciones
    const updatesToApply = [];
    const columns = {
      email: 'B',
      phone: 'C',
      address: 'D',
      businessName: 'E',
      businessType: 'F',
      avatar: 'G',
      notifications: 'N',
      darkMode: 'O',
      language: 'P',
      theme: 'Q'
    };

    // Procesar actualizaciones directas
    for (const [field, column] of Object.entries(columns)) {
      if (updates[field] !== undefined) {
        updatesToApply.push({
          range: `Perfiles_Emprendedoras!${column}${rowIndex}`,
          values: [[String(updates[field])]]
        });
      }
    }

    // Procesar preferencias anidadas
    if (updates.preferences) {
      for (const [pref, value] of Object.entries(updates.preferences)) {
        if (columns[pref]) {
          updatesToApply.push({
            range: `Perfiles_Emprendedoras!${columns[pref]}${rowIndex}`,
            values: [[String(value)]]
          });
        }
      }
    }

    // Aplicar actualizaciones
    if (updatesToApply.length > 0) {
      await googleSheet.updateData("Perfiles_Emprendedoras", "", updatesToApply);
    }

    res.json({
      success: true,
      message: "Perfil actualizado exitosamente"
    });

  } catch (error) {
    console.error("Error al actualizar perfil:", error.message);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor"
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
