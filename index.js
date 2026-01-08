import express from "express";
import moviesRouter from "./routes/movies.js";


const app = express();
const PORT = 3000;

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

app.use('/movies', moviesRouter);


app.listen(PORT, () => {
  console.log(`🎬 Movie Match API corriendo en http://localhost:${PORT}`);
});