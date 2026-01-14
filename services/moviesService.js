import { movies} from "../data/movies.js";

export function getAllMovies(filters = {}) {
  let result = [...movies];
  if (filters.genre) {
    result = result.filter(m => m.genre.toLowerCase() === filters.genre.toLowerCase());
  }
  if (filters.minRating) {
    result = result.filter(m => m.rating >= parseFloat(filters.minRating));
  }
  return result;
}

export function getMovieById(id) {
  return movies.find(m => m.id === parseInt(id));
}

export function getRandomMovies(count = 10) {
  const shuffled = [...movies].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, movies.length));
}