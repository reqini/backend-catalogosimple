import express from "express"

import config from "../../config/index.js";
import GoogleSheet from "../../googleSheet/GoogleSheet.js";

const router = express.Router()

const googleSheet = new GoogleSheet(config.GOOGLE_CREDENTIALS, config.GOOGLE_SHEET_ID)

// Ruta para obtener productos
router.get("/", async (_req, res) => {
  try {
    const productos = await googleSheet.getData("A:AE");

    res.json(productos);

  } catch (error) {
    console.error("Error al obtener productos:", error.message);
    res.status(500).json({ message: "Error al obtener productos" });
  }
});

export default router