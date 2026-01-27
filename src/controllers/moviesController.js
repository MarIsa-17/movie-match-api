import * as moviesService from "../services/moviesService.js";
import { enrichMoviesWithAI } from "../services/aiService.js";


const sendSuccess = (res, data) => {
  const dataArray = Array.isArray(data) ? data : [data];
  res.json({ 
    success: true, 
    data: dataArray, 
    count: dataArray.length 
  });
};

const sendError = (res, status, message) => {
  res.status(status).json({ success: false, error: message });
};

export async function getMovies(req, res) {
    // Extraemos los filtros de la URL y el ordenamiento
    const filters = {
      genre: req.query.genre,
      year: req.query.year,
      minRating: req.query.minRating,
      director: req.query.director, // Agregado 
      search: req.query.search, // busqueda
    };

    // Pasamos los filtros al servicio
    const movies = await moviesService.getAllMovies(filters,req.query.orderBy); 
    // sendSuccess =  respuesta tenga { success, data, count }
    sendSuccess(res, movies);
  } 

export function getGenres(req, res) {
  const genres = moviesService.getGenres(); // Devuelve los géneros permitidos ['ACTION', 'COMEDY'...]
  res.json({ 
    success: true, 
    data: genres, 
    count: genres.length 
  });
}

export function getMovieById(req, res) {
  const movie = moviesService.getMovieById(req.params.id);
  if (!movie)
    return sendError(res, 404, `Película ID ${req.params.id} no encontrada`);
  sendSuccess(res, movie);
}

export function getRandomMovie(req,res){
  const randomMovies = moviesService.getRandomMovies(1);
  sendSuccess(res, randomMovies);
}

export async function discoverMovies(req, res) {
  try {
    const count = Number(req.query.count) || 1;

    // AGREGAR 'await' AQUÍ
    const randomMovies = await moviesService.getRandomMovies(count); 
    
    // Enriquecer con IA
    const enrichedMovies = await enrichMoviesWithAI(randomMovies);
    
    res.json({
      success: true,
      count: enrichedMovies.length,
      data: enrichedMovies,
    });
  } catch (error) {
    console.error("❌ Discover error:", error.message);
    res.status(500).json({ success: false, error: "Error al obtener recomendaciones" });
  }
}


export async function createMovie(req, res){
  const { title, year, rating, genre, director } = req.body;

  // ----------------- Lista de géneros permitidos (debe ser igual a tu enum) -------------------
  const permiGenres = ['ACTION', 'COMEDY', 'DRAMA', 'HORROR', 'SCIFI', 'THRILLER'];

  if (!permiGenres.includes(genre)) {
    return res.status(400).json({ 
      success: false, 
      message: `Género no válido. Los permitidos son: ${permiGenres.join(', ')}` 
    });
  }

  try {
    const newMovie = await moviesService.createMovie(req.body);
    res.status(201).json({ success: true, data: newMovie });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getStats(req, res) {
  try {
    const stats = await moviesService.getStatsByGenre();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

