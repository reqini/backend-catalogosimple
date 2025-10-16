import "dotenv/config";
if (process.env.NODE_ENV === "production") {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
}

import express from "express";
import { createServer } from "http";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import config from "./config/index.js"; // Aquí importamos config
import { notFound, errorHandler } from "./middleware/middlewares.js";
import routes from "./routes/index.js";

const getServer = async () => {
  const app = express();
  const server = createServer(app);

  console.log("bien...")

  // Configuración de CORS
  const allowedOrigins = [
    "http://localhost:3000",
    "https://catalogosimple.ar",
  ];

  app.use(
    cors({
      origin: allowedOrigins,
      methods: "GET,POST,PUT,DELETE",
      credentials: true,
    })
  );

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          "default-src": ["'self'"],
          "script-src": ["'self'", "'unsafe-inline'", "https://catalogosimple.ar"],
          "style-src": ["'self'", "'unsafe-inline'"],
          "img-src": ["'self'", "data:", "https://catalogosimple.ar"],
        },
      },
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Servir archivos estáticos desde la carpeta public
  app.use(express.static('public'));

  // Ruta principal - servir la landing page
  app.get('/', (req, res) => {
    res.sendFile('index.html', { root: 'public' });
  });

  // Ruta para la vista previa
  app.get('/preview.html', (req, res) => {
    res.sendFile('preview.html', { root: 'public' });
  });

  app.use(routes);

  app.use(notFound);
  app.use(errorHandler);

  return server;
};

const port = config.PORT || 3001;

getServer()
  .then((server) => {
    server.listen(port, () => {
      console.info(`Servidor en ejecución en el puerto ${port}`); // Mensaje genérico
    });
  })
  .catch(() => {
    console.error("No se pudo iniciar el servidor. Verifica la configuración."); // Mensaje genérico
  });
