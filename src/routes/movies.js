import { Router } from "express";

import * as moviesController from "../controllers/moviesController.js";

const router = Router();

router.get("/", moviesController.getMovies); // Trae todas y maneja filtros: género, rating, año, director
router.post("/",moviesController.createMovie); // Ruta post (crear una película nueva)
router.get("/discover", moviesController.discoverMovies);// IA
router.get("/random", moviesController.getRandomMovie); // random
router.get("/:id", moviesController.getMovieById); // ID dinámico

export default router;
