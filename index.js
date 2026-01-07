import express from "express";
import { movies } from "./data/movies.js";
import e from "express";

const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
  // inicia ruta principal
  res.json({
    message: "Bienvenido a Movie Match API 🎬- Arita Pintado ",
    endpoints: {
      allMovies: `GET /movies: 'Obtener todas las películas'`,
      randomMovie: `GET /movies/random: 'Obtener una película aleatoria'`,
      movieById: `GET /movies/:id: 'Obtener una película por ID'`,
    },
  });
});

app.get("/movies", (req, res) => {
  // ruta para obtener todas las peliculas
  res.json(movies);
});

app.get("/movies/random", (req, res) => {
  // ruta para obtener pelicula aleatoria
  const randomIndex = Math.floor(Math.random() * movies.length);
  const randomMovie = movies[randomIndex];
  res.json(randomMovie);
});

app.get("/movies/:id", (req, res) => {
  // ruta para obtener pelicula por id
  const id = parseInt(req.params.id);
  const movie = movies.find((m) => m.id === id);
  if (!movie) {
    return res.status(404).json({ error: "Película no encontrada", id: id }); // importante identificar el status 404
  }
  res.json(movie);
});

app.listen(PORT, () => {
  // inicia el servidor
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
