import express from "express";
import { prisma } from "../../database/prisma.js";

const router = express.Router();

// GET /api/clients - Obtener todos los clientes
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 50, userId, activo } = req.query;
    
    const where = {};
    if (userId) where.userId = parseInt(userId);
    if (activo !== undefined) where.activo = activo === 'true';

    const clients = await prisma.client.findMany({
      where,
      skip: (page - 1) * limit,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { username: true, nombre: true, apellido: true }
        },
        _count: {
          select: { ventas: true }
        }
      }
    });

    const total = await prisma.client.count({ where });

    res.json({
      success: true,
      data: clients,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener clientes",
      error: error.message
    });
  }
});

// GET /api/clients/:id - Obtener cliente por ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const client = await prisma.client.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: { username: true, nombre: true, apellido: true }
        },
        ventas: {
          orderBy: { fecha_venta: 'desc' },
          include: {
            items: {
              include: {
                product: {
                  select: { combo: true, descripcion: true, codigo: true }
                }
              }
            }
          }
        }
      }
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Cliente no encontrado"
      });
    }

    res.json({
      success: true,
      data: client
    });
  } catch (error) {
    console.error("Error al obtener cliente:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener cliente",
      error: error.message
    });
  }
});

// POST /api/clients - Crear nuevo cliente
router.post("/", async (req, res) => {
  try {
    const clientData = req.body;
    
    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: clientData.userId }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Usuario no encontrado"
      });
    }

    const client = await prisma.client.create({
      data: clientData,
      include: {
        user: {
          select: { username: true, nombre: true, apellido: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: "Cliente creado exitosamente",
      data: client
    });
  } catch (error) {
    console.error("Error al crear cliente:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear cliente",
      error: error.message
    });
  }
});

// PUT /api/clients/:id - Actualizar cliente
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const clientData = req.body;

    // Verificar si el cliente existe
    const existingClient = await prisma.client.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingClient) {
      return res.status(404).json({
        success: false,
        message: "Cliente no encontrado"
      });
    }

    const client = await prisma.client.update({
      where: { id: parseInt(id) },
      data: clientData,
      include: {
        user: {
          select: { username: true, nombre: true, apellido: true }
        }
      }
    });

    res.json({
      success: true,
      message: "Cliente actualizado exitosamente",
      data: client
    });
  } catch (error) {
    console.error("Error al actualizar cliente:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar cliente",
      error: error.message
    });
  }
});

// DELETE /api/clients/:id - Eliminar cliente
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si el cliente existe
    const existingClient = await prisma.client.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingClient) {
      return res.status(404).json({
        success: false,
        message: "Cliente no encontrado"
      });
    }

    await prisma.client.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: "Cliente eliminado exitosamente"
    });
  } catch (error) {
    console.error("Error al eliminar cliente:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar cliente",
      error: error.message
    });
  }
});

// GET /api/clients/:id/stats - Estadísticas del cliente
router.get("/:id/stats", async (req, res) => {
  try {
    const { id } = req.params;

    const client = await prisma.client.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: { ventas: true }
        }
      }
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Cliente no encontrado"
      });
    }

    // Calcular estadísticas de ventas
    const ventasStats = await prisma.sale.aggregate({
      where: { clientId: parseInt(id) },
      _sum: { total: true },
      _avg: { total: true }
    });

    res.json({
      success: true,
      data: {
        cliente: `${client.nombre} ${client.apellido || ''}`.trim(),
        totalVentas: client._count.ventas,
        totalCompras: ventasStats._sum.total || 0,
        compraPromedio: ventasStats._avg.total || 0
      }
    });
  } catch (error) {
    console.error("Error al obtener estadísticas del cliente:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener estadísticas",
      error: error.message
    });
  }
});

export default router;
