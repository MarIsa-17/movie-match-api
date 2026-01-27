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
  try {
    // 1. Extraemos los filtros de la URL
    const filters = {
      genre: req.query.genre,
      year: req.query.year,
      minRating: req.query.minRating,
      director: req.query.director // Agregado 
    };

    // 2. Pasamos los filtros al servicio
    const movies = await moviesService.getAllMovies(filters); 
    // sendSuccess =  respuesta tenga { success, data, count }
    sendSuccess(res, movies);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
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

    const randomMovies = moviesService.getRandomMovies(count);// película random
    const enrichedMovies = await enrichMoviesWithAI(randomMovies);//Enriquecer con IA (UNA sola vez)
    res.json({
      success: true,
      count: enrichedMovies.length,
      data: enrichedMovies,
    });
  } catch (error) {
    console.error("❌ Discover error:", error.message);
    sendError(res, 500, "Error al obtener recomendaciones");
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

