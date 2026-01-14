import { Router } from "express";

import * as moviesController from "../controllers/moviesController.js";

const router = Router();

// Helpers (ayudantes) para respuestas consistentes se encuentran en controllers/moviesController.js


//  actualmente en controllers/moviesController.js
// GET /movies (con filtros)  este es endpoint principal para obtener todas las peliculas con filtros
/* router.get("/", (req, res) => {
  let result = [...movies];// clonar el array de peliculas para no modificar el original

  //filtros por query params -> genre, minRating, year, director - Ordenamiento y paginacion
  if (req.query.genre) {
    const genre = req.query.genre.toLowerCase();
    result = result.filter((m) => m.genre.toLowerCase() === genre);
  }

  if (req.query.minRating) {
    const minRating = parseFloat(req.query.minRating);
    result = result.filter((m) => m.rating >= minRating);
  }

  if (req.query.year) {
    const year = parseInt(req.query.year);
    result = result.filter((m) => m.year === year);
  }

  if (req.query.director) {
    const director = req.query.director.toLowerCase();
    result = result.filter((m) => m.director.toLowerCase().includes(director));
  }
  // Ordenamiento
  if(req.query.sortBy){
    const field = req.query.sortBy; // campo por el que se ordena rating, year
    const order = req.query.order === "desc" ? -1 : 1;

    result.sort((a,b) => {
      if(a[field] < b[field]) return -1 * order;
      if(a[field] > b[field]) return 1 * order;
      return 0;
    });
  }

  // Paginación
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const paginatedResult = result.slice(startIndex, endIndex);

    // respuesta estructurada para todos los filtros, ordenamiento y paginacion
    res.json({
      success: true,
      data: paginatedResult,
      count: paginatedResult.length,
      pagination: {
        total: result.length,
        currentPage: page,
        totalPages: Math.ceil(result.length / limit),
      },
    });    
});




// GET /movies/random
router.get("/random", (req, res) => {
  const randomMovie= moviesController.getRandomMovie();
  const randomIndex = Math.floor(Math.random() * movies.length);
  sendSuccess(res, movies[randomIndex]);
});

// GET/movies/stats -> estadisticas basicas de las peliculas
router.get("/stats", (req, res) => {
    const totalMovies = movies.length;
    
    // agrupar por genero
    const moviesByGenre = movies.reduce((acc, movie) => {
      const genre = movie.genre;
        acc[genre] = (acc[genre] || 0) + 1;
        return acc;
    }, {});
    res.json({
      success: true,
      data: {
        totalMovies,
        moviesByGenre,
      },
    });
});


// GET /movies/:id
router.get("/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const movie = movies.find((m) => m.id === id);

  if (!movie) {
    return sendError(res, 404, `Película con ID ${id} no encontrada`);
  }

  sendSuccess(res, movie);
});
*/

router.get("/", moviesController.getMovies);
router.get("/id", moviesController.getMovieById);
router.get("/discover", moviesController.discoverMovies);

export default router;
