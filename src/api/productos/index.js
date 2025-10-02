import express from "express"

import config from "../../config/index.js";
import GoogleSheet from "../../googleSheet/GoogleSheet.js";

const router = express.Router()

const googleSheet = new GoogleSheet(config.GOOGLE_CREDENTIALS, config.GOOGLE_SHEET_ID)

// Ruta para obtener productos
router.get("/", async (_req, res) => {
  try {
    // Obtener datos de Google Sheets
    const productos = await googleSheet.getData("A:AE");
    res.json(productos);

  } catch (error) {
    console.error("Error al obtener productos de Google Sheets:", error.message);
    res.status(500).json({ 
      error: "Error al conectar con Google Sheets", 
      message: error.message 
    });
  }
});

export default router