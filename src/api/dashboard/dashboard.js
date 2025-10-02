import express from "express";
import { prisma } from "../../database/prisma.js";

const router = express.Router();

// GET /api/dashboard/overview - Estadísticas generales del dashboard
router.get("/overview", async (req, res) => {
  try {
    // Estadísticas de productos
    const totalProducts = await prisma.product.count();
    const activeProducts = await prisma.product.count({
      where: { vigencia: "SI" }
    });

    // Estadísticas de usuarios
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({
      where: { estado: "Activo" }
    });

    // Estadísticas de clientes
    const totalClients = await prisma.client.count();
    const activeClients = await prisma.client.count({
      where: { activo: true }
    });

    // Estadísticas de ventas
    const totalSales = await prisma.sale.count();
    const completedSales = await prisma.sale.count({
      where: { estado: "completada" }
    });
    const pendingSales = await prisma.sale.count({
      where: { estado: "pendiente" }
    });

    // Totales financieros
    const salesStats = await prisma.sale.aggregate({
      _sum: { total: true, comision: true },
      _avg: { total: true }
    });

    // Ventas por familia de productos
    const ventasPorFamilia = await prisma.$queryRaw`
      SELECT 
        p.familia,
        COUNT(si.id) as cantidad_vendida,
        SUM(si.subtotal) as total_vendido
      FROM products p
      LEFT JOIN sale_items si ON p.id = si."productId"
      LEFT JOIN sales s ON si."saleId" = s.id
      WHERE s.estado = 'completada' OR s.estado IS NULL
      GROUP BY p.familia
      ORDER BY total_vendido DESC
    `;

    // Ventas por línea de productos
    const ventasPorLinea = await prisma.$queryRaw`
      SELECT 
        p.linea,
        COUNT(si.id) as cantidad_vendida,
        SUM(si.subtotal) as total_vendido
      FROM products p
      LEFT JOIN sale_items si ON p.id = si."productId"
      LEFT JOIN sales s ON si."saleId" = s.id
      WHERE s.estado = 'completada' OR s.estado IS NULL
      GROUP BY p.linea
      ORDER BY total_vendido DESC
    `;

    // Top productos más vendidos
    const topProductos = await prisma.$queryRaw`
      SELECT 
        p.combo,
        p.descripcion,
        p.familia,
        p.linea,
        COUNT(si.id) as cantidad_vendida,
        SUM(si.subtotal) as total_vendido
      FROM products p
      LEFT JOIN sale_items si ON p.id = si."productId"
      LEFT JOIN sales s ON si."saleId" = s.id
      WHERE s.estado = 'completada' OR s.estado IS NULL
      GROUP BY p.id, p.combo, p.descripcion, p.familia, p.linea
      ORDER BY cantidad_vendida DESC
      LIMIT 10
    `;

    // Top usuarios con más ventas
    const topUsuarios = await prisma.$queryRaw`
      SELECT 
        u.username,
        u.nombre,
        u.apellido,
        u.rango,
        COUNT(s.id) as total_ventas,
        SUM(s.total) as total_vendido,
        SUM(s.comision) as total_comision
      FROM users u
      LEFT JOIN sales s ON u.id = s."userId"
      WHERE s.estado = 'completada' OR s.estado IS NULL
      GROUP BY u.id, u.username, u.nombre, u.apellido, u.rango
      ORDER BY total_vendido DESC
      LIMIT 10
    `;

    // Ventas por mes (últimos 12 meses)
    const ventasPorMes = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "fecha_venta") as mes,
        COUNT(*) as cantidad_ventas,
        SUM(total) as total_ventas,
        SUM(comision) as total_comisiones
      FROM sales 
      WHERE "fecha_venta" >= NOW() - INTERVAL '12 months'
        AND estado = 'completada'
      GROUP BY DATE_TRUNC('month', "fecha_venta")
      ORDER BY mes DESC
    `;

    res.json({
      success: true,
      data: {
        productos: {
          total: totalProducts,
          activos: activeProducts,
          inactivos: totalProducts - activeProducts
        },
        usuarios: {
          total: totalUsers,
          activos: activeUsers,
          inactivos: totalUsers - activeUsers
        },
        clientes: {
          total: totalClients,
          activos: activeClients,
          inactivos: totalClients - activeClients
        },
        ventas: {
          total: totalSales,
          completadas: completedSales,
          pendientes: pendingSales,
          canceladas: totalSales - completedSales - pendingSales,
          totalVendido: salesStats._sum.total || 0,
          totalComisiones: salesStats._sum.comision || 0,
          ventaPromedio: salesStats._avg.total || 0
        },
        ventasPorFamilia,
        ventasPorLinea,
        topProductos,
        topUsuarios,
        ventasPorMes
      }
    });
  } catch (error) {
    console.error("Error al obtener estadísticas del dashboard:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener estadísticas del dashboard",
      error: error.message
    });
  }
});

// GET /api/dashboard/products/stats - Estadísticas detalladas de productos
router.get("/products/stats", async (req, res) => {
  try {
    const { familia, linea } = req.query;
    
    const where = {};
    if (familia) where.familia = familia;
    if (linea) where.linea = linea;

    const productos = await prisma.product.findMany({
      where,
      include: {
        _count: {
          select: { saleItems: true }
        }
      }
    });

    // Estadísticas por familia
    const statsPorFamilia = await prisma.product.groupBy({
      by: ['familia'],
      where,
      _count: { familia: true },
      _avg: { combo: true }
    });

    // Estadísticas por línea
    const statsPorLinea = await prisma.product.groupBy({
      by: ['linea'],
      where,
      _count: { linea: true },
      _avg: { combo: true }
    });

    res.json({
      success: true,
      data: {
        total: productos.length,
        porFamilia: statsPorFamilia,
        porLinea: statsPorLinea,
        productos: productos.map(p => ({
          id: p.id,
          combo: p.combo,
          familia: p.familia,
          linea: p.linea,
          descripcion: p.descripcion,
          vigencia: p.vigencia,
          vecesVendido: p._count.saleItems
        }))
      }
    });
  } catch (error) {
    console.error("Error al obtener estadísticas de productos:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener estadísticas de productos",
      error: error.message
    });
  }
});

// GET /api/dashboard/sales/trends - Tendencias de ventas
router.get("/sales/trends", async (req, res) => {
  try {
    const { periodo = '30' } = req.query; // días

    // Ventas por día
    const ventasPorDia = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('day', "fecha_venta") as dia,
        COUNT(*) as cantidad_ventas,
        SUM(total) as total_ventas,
        SUM(comision) as total_comisiones
      FROM sales 
      WHERE "fecha_venta" >= NOW() - INTERVAL '${parseInt(periodo)} days'
        AND estado = 'completada'
      GROUP BY DATE_TRUNC('day', "fecha_venta")
      ORDER BY dia DESC
    `;

    // Comparación con período anterior
    const ventasActuales = await prisma.sale.aggregate({
      where: {
        fecha_venta: {
          gte: new Date(Date.now() - parseInt(periodo) * 24 * 60 * 60 * 1000)
        },
        estado: "completada"
      },
      _sum: { total: true },
      _count: { id: true }
    });

    const ventasAnteriores = await prisma.sale.aggregate({
      where: {
        fecha_venta: {
          gte: new Date(Date.now() - parseInt(periodo) * 2 * 24 * 60 * 60 * 1000),
          lt: new Date(Date.now() - parseInt(periodo) * 24 * 60 * 60 * 1000)
        },
        estado: "completada"
      },
      _sum: { total: true },
      _count: { id: true }
    });

    const crecimientoVentas = ventasAnteriores._sum.total > 0 
      ? ((ventasActuales._sum.total - ventasAnteriores._sum.total) / ventasAnteriores._sum.total) * 100
      : 0;

    const crecimientoCantidad = ventasAnteriores._count.id > 0
      ? ((ventasActuales._count.id - ventasAnteriores._count.id) / ventasAnteriores._count.id) * 100
      : 0;

    res.json({
      success: true,
      data: {
        ventasPorDia,
        crecimiento: {
          ventas: {
            actual: ventasActuales._sum.total || 0,
            anterior: ventasAnteriores._sum.total || 0,
            porcentaje: crecimientoVentas
          },
          cantidad: {
            actual: ventasActuales._count.id || 0,
            anterior: ventasAnteriores._count.id || 0,
            porcentaje: crecimientoCantidad
          }
        }
      }
    });
  } catch (error) {
    console.error("Error al obtener tendencias de ventas:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener tendencias de ventas",
      error: error.message
    });
  }
});

export default router;
