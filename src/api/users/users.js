import express from "express";
import { prisma } from "../../database/prisma.js";

const router = express.Router();

// GET /api/users - Obtener todos los usuarios
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 50, rango, tipo_usuario, estado } = req.query;
    
    const where = {};
    if (rango) where.rango = rango;
    if (tipo_usuario) where.tipo_usuario = tipo_usuario;
    if (estado) where.estado = estado;

    const users = await prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            ventas: true,
            clientes: true
          }
        }
      }
    });

    const total = await prisma.user.count({ where });

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener usuarios",
      error: error.message
    });
  }
});

// GET /api/users/:id - Obtener usuario por ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: {
        ventas: {
          take: 5,
          orderBy: { fecha_venta: 'desc' },
          include: {
            client: true,
            items: {
              include: {
                product: true
              }
            }
          }
        },
        clientes: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            ventas: true,
            clientes: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado"
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener usuario",
      error: error.message
    });
  }
});

// GET /api/users/username/:username - Obtener usuario por username
router.get("/username/:username", async (req, res) => {
  try {
    const { username } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado"
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener usuario",
      error: error.message
    });
  }
});

// POST /api/users - Crear nuevo usuario
router.post("/", async (req, res) => {
  try {
    const userData = req.body;
    
    // Verificar si el username ya existe
    const existingUser = await prisma.user.findUnique({
      where: { username: userData.username }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Ya existe un usuario con ese username"
      });
    }

    const user = await prisma.user.create({
      data: userData
    });

    res.status(201).json({
      success: true,
      message: "Usuario creado exitosamente",
      data: user
    });
  } catch (error) {
    console.error("Error al crear usuario:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear usuario",
      error: error.message
    });
  }
});

// PUT /api/users/:id - Actualizar usuario
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userData = req.body;

    // Verificar si el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado"
      });
    }

    // Si se está cambiando el username, verificar que no exista otro usuario con ese username
    if (userData.username && userData.username !== existingUser.username) {
      const usernameExists = await prisma.user.findUnique({
        where: { username: userData.username }
      });

      if (usernameExists) {
        return res.status(400).json({
          success: false,
          message: "Ya existe un usuario con ese username"
        });
      }
    }

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: userData
    });

    res.json({
      success: true,
      message: "Usuario actualizado exitosamente",
      data: user
    });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar usuario",
      error: error.message
    });
  }
});

// DELETE /api/users/:id - Eliminar usuario
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado"
      });
    }

    await prisma.user.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: "Usuario eliminado exitosamente"
    });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar usuario",
      error: error.message
    });
  }
});

// GET /api/users/:id/stats - Estadísticas del usuario
router.get("/:id/stats", async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: {
            ventas: true,
            clientes: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado"
      });
    }

    // Calcular estadísticas de ventas
    const ventasStats = await prisma.sale.aggregate({
      where: { userId: parseInt(id) },
      _sum: { total: true, comision: true },
      _avg: { total: true }
    });

    res.json({
      success: true,
      data: {
        usuario: user.username,
        totalVentas: user._count.ventas,
        totalClientes: user._count.clientes,
        ventasTotal: ventasStats._sum.total || 0,
        comisionTotal: ventasStats._sum.comision || 0,
        ventaPromedio: ventasStats._avg.total || 0
      }
    });
  } catch (error) {
    console.error("Error al obtener estadísticas del usuario:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener estadísticas",
      error: error.message
    });
  }
});

export default router;
