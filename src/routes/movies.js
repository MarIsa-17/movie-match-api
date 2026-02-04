import { Router } from "express";

import * as moviesController from "../controllers/moviesController.js";

const router = Router();

router.get("/", moviesController.getMovies); // Trae todas y maneja filtros: género, rating, año, director
router.get("/genres", moviesController.getGenres); // 
router.get("/discover", moviesController.discoverMovies);// IA
router.get("/random", moviesController.getRandomMovie); // random
router.get("/reports/empty", moviesController.getEmptyMovies); 
router.get("/reports/recent", moviesController.getRecentMovies);
router.get("/reports/export", moviesController.exportData);
router.get("/stats", moviesController.getStats)

// ---- Rutas dinámicas (AL FINAL)
router.get("/:id", moviesController.getMovieById); // ID dinámico
router.post("/",moviesController.createMovie); // Ruta post (crear una película nueva)
router.delete('/:id', moviesController.deleteAtomic); // Si moviesController.deleteMovie no existe, explota.

export default router;
