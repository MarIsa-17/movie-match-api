import * as moviesService from "../services/moviesService.js";
import { enrichMoviesWithAI } from "../services/aiService.js";

const sendSuccess = (res, data) => {
  const dataArray = Array.isArray(data) ? data : [data];
  res.json({ success: true, data: dataArray, count: dataArray.length });
};

const sendError = (res, status, message) => {
  res.status(status).json({ success: false, error: message });
};

export function getMovies(req, res) {
  const movies = moviesService.getAllMovies(req.query);
  sendSuccess(res, movies);
}

export function getMovieById(req, res) {
  const movie = moviesService.getMovieById(req.params.id);
  if (!movie)
    return sendError(res, 404, `Película ID ${req.params.id} no encontrada`);
  sendSuccess(res, movie);
}

export async function discoverMovies(req, res) {
  try {
    const count = parseInt(req.query.count) || 10;

    const randomMovies = moviesService.getRandomMovies(count);
    const enrichedMovies = await enrichMoviesWithAI(randomMovies);
    res.json({
      success: true,
      count: enrichedMovies.length,
      data: enrichedMovies,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Error al obtener recomendaciones" });
  }
}
