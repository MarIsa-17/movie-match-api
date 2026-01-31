import * as moviesService from "../services/moviesService.js";
import { enrichMoviesWithAI } from "../services/aiService.js";
import pkg from 'yamljs';
const { parse } = pkg;


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
  try{
    const validGenres=['ACTION', 'COMEDY', 'DRAMA', 'HORROR', 'SCIFI', 'THRILLER']

    // Extraemos los filtros de la URL
    const { genre, year, minRating, director, search, orderBy } = req.query;

    if(genre && !validGenres.includes(genre.toUpperCase())){
      return res.status(400).json({
        success:false,
        error:`El género '${genre}' no es válido. Los permitidos son: ${validGenres.join(', ')}`
      })
    }

    const filters = {
      genre: genre ? genre.toUpperCase() : undefined,
      year: year? parseInt(year): undefined,
      minRating: minRating? parseFloat(minRating): undefined,
      director,
      search
    };

    // -------------------------------Pasamos los filtros sanitizados al servicio
    const movies = await moviesService.getAllMovies(filters, orderBy); 
    // sendSuccess =  respuesta tenga { success, data, count }
    sendSuccess(res, movies);
  } catch (error){
    // 4. ERROR SEGURO: No enviamos 'error.message' crudo si es un error de base de datos
    console.error("Database Error:", error.message);
    res.status(500).json({ success: false, error: "Ocurrió un error interno en el servidor" });
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

export async function getMovieById(req, res) {
  try {
    const { id } = req.params;
    const movie = await moviesService.getMovieById(id);

    if (!movie) {
      return res.status(404).json({ 
        success: false, 
        error: "Película no encontrada" 
      });
    }

    // Asegúrate de enviar 'movie' directamente, no dentro de un array
    res.json({ success: true, data: movie }); 
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
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

