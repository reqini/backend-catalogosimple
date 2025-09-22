import express from "express";

import api from "../api/index.js";
import login from "../login/login.js";
import profile from "./profile.js";
import { authenticateUser } from "../middleware/auth.js";

const router = express.Router();

router.use("/auth", login);
router.use("/api", api); // sin authenticateUser
router.use("/api/profile", profile); // rutas de perfil con autenticación

router.get("/healthcheck", (req, res) => {
  res.send("ok");
});

export default router;
