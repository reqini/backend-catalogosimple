import express from "express";
import { prisma } from "../../database/prisma.js";

const router = express.Router();

// GET /api/products - Obtener todos los productos
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 50, familia, linea, vigencia } = req.query;
    
    const where = {};
    if (familia) where.familia = familia;
    if (linea) where.linea = linea;
    if (vigencia) where.vigencia = vigencia;

    const products = await prisma.product.findMany({
      where,
      skip: (page - 1) * limit,
      take: parseInt(limit),
      orderBy: { combo: 'asc' }
    });

    const total = await prisma.product.count({ where });

    res.json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener productos",
      error: error.message
    });
  }
});

// GET /api/products/:id - Obtener producto por ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado"
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error("Error al obtener producto:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener producto",
      error: error.message
    });
  }
});

// GET /api/products/combo/:combo - Obtener producto por número de combo
router.get("/combo/:combo", async (req, res) => {
  try {
    const { combo } = req.params;
    
    const product = await prisma.product.findUnique({
      where: { combo: parseInt(combo) }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado"
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error("Error al obtener producto:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener producto",
      error: error.message
    });
  }
});

// POST /api/products - Crear nuevo producto
router.post("/", async (req, res) => {
  try {
    const productData = req.body;
    
    // Verificar si el combo ya existe
    const existingProduct = await prisma.product.findUnique({
      where: { combo: productData.combo }
    });

    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: "Ya existe un producto con ese número de combo"
      });
    }

    const product = await prisma.product.create({
      data: productData
    });

    res.status(201).json({
      success: true,
      message: "Producto creado exitosamente",
      data: product
    });
  } catch (error) {
    console.error("Error al crear producto:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear producto",
      error: error.message
    });
  }
});

// PUT /api/products/:id - Actualizar producto
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const productData = req.body;

    // Verificar si el producto existe
    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado"
      });
    }

    // Si se está cambiando el combo, verificar que no exista otro producto con ese combo
    if (productData.combo && productData.combo !== existingProduct.combo) {
      const comboExists = await prisma.product.findUnique({
        where: { combo: productData.combo }
      });

      if (comboExists) {
        return res.status(400).json({
          success: false,
          message: "Ya existe un producto con ese número de combo"
        });
      }
    }

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: productData
    });

    res.json({
      success: true,
      message: "Producto actualizado exitosamente",
      data: product
    });
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar producto",
      error: error.message
    });
  }
});

// DELETE /api/products/:id - Eliminar producto
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si el producto existe
    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado"
      });
    }

    await prisma.product.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: "Producto eliminado exitosamente"
    });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar producto",
      error: error.message
    });
  }
});

// GET /api/products/stats - Estadísticas de productos
router.get("/stats/overview", async (req, res) => {
  try {
    const totalProducts = await prisma.product.count();
    const activeProducts = await prisma.product.count({
      where: { vigencia: "SI" }
    });
    const families = await prisma.product.groupBy({
      by: ['familia'],
      _count: { familia: true }
    });
    const lines = await prisma.product.groupBy({
      by: ['linea'],
      _count: { linea: true }
    });

    res.json({
      success: true,
      data: {
        total: totalProducts,
        active: activeProducts,
        inactive: totalProducts - activeProducts,
        families: families.map(f => ({ familia: f.familia, count: f._count.familia })),
        lines: lines.map(l => ({ linea: l.linea, count: l._count.linea }))
      }
    });
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener estadísticas",
      error: error.message
    });
  }
});

export default router;
