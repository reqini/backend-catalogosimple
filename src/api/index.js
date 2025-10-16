import express from "express";

// Rutas legacy (Google Sheets)
import admin from "./admin/admin.js";
import user from "./user/user.js";
import clientes from "./clientes/clientes.js";
import productos from "./productos/index.js";
import bancos from "./bancos/index.js";
import ventas from "./ventas/ventas.js";

// Rutas nuevas (Base de datos)
import products from "./products/products.js";
import users from "./users/users.js";
import sales from "./sales/sales.js";
import clients from "./clients/clients.js";
import dashboard from "./dashboard/dashboard.js";

// API Pública Essen
import essen from "./essen/essen.js";

const router = express.Router();

// Rutas legacy (Google Sheets) - Mantener compatibilidad
router.use("/user", user)
router.use("/admin", admin)
router.use("/clientes", clientes)
router.use("/ventas", ventas)
router.use("/productos", productos)
router.use("/bancos", bancos)

// Rutas nuevas (Base de datos) - Para el dashboard
router.use("/products", products)
router.use("/users", users)
router.use("/sales", sales)
router.use("/clients", clients)
router.use("/dashboard", dashboard)

// API Pública Essen (sin precios)
router.use("/essen", essen)

export default router;
