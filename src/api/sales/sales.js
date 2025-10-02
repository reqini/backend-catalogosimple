import express from "express";
import { prisma } from "../../database/prisma.js";

const router = express.Router();

// GET /api/sales - Obtener todas las ventas
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 50, userId, estado, fecha_desde, fecha_hasta } = req.query;
    
    const where = {};
    if (userId) where.userId = parseInt(userId);
    if (estado) where.estado = estado;
    
    if (fecha_desde || fecha_hasta) {
      where.fecha_venta = {};
      if (fecha_desde) where.fecha_venta.gte = new Date(fecha_desde);
      if (fecha_hasta) where.fecha_venta.lte = new Date(fecha_hasta);
    }

    const sales = await prisma.sale.findMany({
      where,
      skip: (page - 1) * limit,
      take: parseInt(limit),
      orderBy: { fecha_venta: 'desc' },
      include: {
        user: {
          select: { username: true, nombre: true, apellido: true }
        },
        client: {
          select: { nombre: true, apellido: true, email: true }
        },
        items: {
          include: {
            product: {
              select: { combo: true, descripcion: true, codigo: true }
            }
          }
        }
      }
    });

    const total = await prisma.sale.count({ where });

    res.json({
      success: true,
      data: sales,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error al obtener ventas:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener ventas",
      error: error.message
    });
  }
});

// GET /api/sales/:id - Obtener venta por ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const sale = await prisma.sale.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: { username: true, nombre: true, apellido: true }
        },
        client: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Venta no encontrada"
      });
    }

    res.json({
      success: true,
      data: sale
    });
  } catch (error) {
    console.error("Error al obtener venta:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener venta",
      error: error.message
    });
  }
});

// POST /api/sales - Crear nueva venta
router.post("/", async (req, res) => {
  try {
    const { userId, clientId, items, metodo_pago, notas, comision } = req.body;

    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Usuario no encontrado"
      });
    }

    // Verificar que el cliente existe (si se proporciona)
    if (clientId) {
      const client = await prisma.client.findUnique({
        where: { id: clientId }
      });

      if (!client) {
        return res.status(400).json({
          success: false,
          message: "Cliente no encontrado"
        });
      }
    }

    // Calcular total
    let total = 0;
    for (const item of items) {
      const subtotal = item.cantidad * item.precio_unitario;
      const descuento = item.descuento || 0;
      total += subtotal - descuento;
    }

    // Crear venta con items
    const sale = await prisma.sale.create({
      data: {
        userId,
        clientId: clientId || null,
        total,
        comision: comision || 0,
        metodo_pago,
        notas,
        items: {
          create: items.map(item => ({
            cantidad: item.cantidad,
            precio_unitario: item.precio_unitario,
            subtotal: item.cantidad * item.precio_unitario,
            descuento: item.descuento || 0,
            productId: item.productId || null
          }))
        }
      },
      include: {
        user: {
          select: { username: true, nombre: true, apellido: true }
        },
        client: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: "Venta creada exitosamente",
      data: sale
    });
  } catch (error) {
    console.error("Error al crear venta:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear venta",
      error: error.message
    });
  }
});

// PUT /api/sales/:id - Actualizar venta
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Verificar si la venta existe
    const existingSale = await prisma.sale.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingSale) {
      return res.status(404).json({
        success: false,
        message: "Venta no encontrada"
      });
    }

    const sale = await prisma.sale.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        user: {
          select: { username: true, nombre: true, apellido: true }
        },
        client: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: "Venta actualizada exitosamente",
      data: sale
    });
  } catch (error) {
    console.error("Error al actualizar venta:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar venta",
      error: error.message
    });
  }
});

// DELETE /api/sales/:id - Eliminar venta
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si la venta existe
    const existingSale = await prisma.sale.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingSale) {
      return res.status(404).json({
        success: false,
        message: "Venta no encontrada"
      });
    }

    await prisma.sale.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: "Venta eliminada exitosamente"
    });
  } catch (error) {
    console.error("Error al eliminar venta:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar venta",
      error: error.message
    });
  }
});

// GET /api/sales/stats/overview - Estadísticas generales de ventas
router.get("/stats/overview", async (req, res) => {
  try {
    const totalVentas = await prisma.sale.count();
    const ventasActivas = await prisma.sale.count({
      where: { estado: "completada" }
    });
    const ventasPendientes = await prisma.sale.count({
      where: { estado: "pendiente" }
    });

    const stats = await prisma.sale.aggregate({
      _sum: { total: true, comision: true },
      _avg: { total: true }
    });

    // Ventas por mes (últimos 12 meses)
    const ventasPorMes = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "fecha_venta") as mes,
        COUNT(*) as cantidad,
        SUM(total) as total
      FROM "sales" 
      WHERE "fecha_venta" >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', "fecha_venta")
      ORDER BY mes DESC
    `;

    res.json({
      success: true,
      data: {
        total: totalVentas,
        completadas: ventasActivas,
        pendientes: ventasPendientes,
        totalVentas: stats._sum.total || 0,
        totalComisiones: stats._sum.comision || 0,
        ventaPromedio: stats._avg.total || 0,
        ventasPorMes
      }
    });
  } catch (error) {
    console.error("Error al obtener estadísticas de ventas:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener estadísticas",
      error: error.message
    });
  }
});

export default router;
