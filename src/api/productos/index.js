import express from "express"

import config from "../../config/index.js";
import GoogleSheet from "../../googleSheet/GoogleSheet.js";
import { mockProducts } from "./mock-data.js";

const router = express.Router()

const googleSheet = new GoogleSheet(config.GOOGLE_CREDENTIALS, config.GOOGLE_SHEET_ID)

// Ruta para obtener productos
router.get("/", async (_req, res) => {
  try {
    // Intentar obtener datos de Google Sheets
    const productos = await googleSheet.getData("productos!A:AE");
    res.json(productos);

  } catch (error) {
    console.error("Error al obtener productos de Google Sheets:", error.message);
    console.log("🔄 Usando datos mock temporalmente...");
    
    // Usar datos mock como fallback
    res.json(mockProducts);
  }
});

export default router