import "dotenv/config";
import express from "express";
import moviesRouter from "./routes/movies.js";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

// importación de  middlewares custom
import { logger } from "./middlewares/logger.js";
import { notFound } from "./middlewares/notFound.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { responseTime } from "./middlewares/responseTime.js";

//iniciar aplicación
const app = express();
const PORT = process.env.PORT || 3000;

// cargar los  MIDDLEWARES GLOBALES (ANTES de rutas)
app.use(cors()); // Permite requests de otros dominios
app.use(express.json()); // Parsea JSON en body de requests
app.use(logger); // Tu middleware de logging
app.use(responseTime); // tiempo de respuesta

// Cargar el archivo YAML
// Tip: YAML.load() convierte YAML a objeto JavaScript
const swaggerDoc = YAML.load("./docs/swagger.yaml");

//===== RUTAS
app.get("/", (req, res) => {
  // inicia ruta principal
  res.json({
    message: "Bienvenido a Movie Match API 🎬- Arita Pintado ",
    endpoints: {
      allMovies: `GET /movies: 'Obtener todas las películas'`,
      filterByGenre: `GET /movies?genre=Drama 'Filtrar películas por género'`,
      filterCombined: `GET /movies?genre=Drama&minRating=8.5&year=:year&director=Nolan 'Filtrar películas por múltiples criterios'`,
      randomMovie: `GET /movies/random: 'Obtener una película aleatoria'`,
      movieById: `GET /movies/:id: 'Obtener una película por ID'`,
    },
  });
});

/*
app.get("/movies", (req, res) => { 
  // ruta para obtener todas las peliculas inicialmente sin filtros
  res.json(movies);
});
*/

/*
//===================Error de prueba 400=================
app.get("/error-test", (req, res, next) => {
  const error = new Error("Este es un error de prueba");
  error.status = 400;
  next(error); // envía el error al errorHandler
});
*/

app.get("/health", (req, res) => {
  res.json({
    status: "UP",
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())} segundos`,
    environment: process.env.NODE_ENV || "development",
  });
});

app.use("/movies", moviesRouter);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// ===== MIDDLEWARES DE ERROR (DESPUÉS de rutas) =====
// ¿Por qué después? Porque capturan lo que las rutas NO manejaron
app.use(notFound); // Rutas no encontradas (404)
app.use(errorHandler); // Errores generales (500)

app.listen(PORT, () => console.log(`🎬 API en http://localhost:${PORT}`));
