import { movies} from "../data/movies.js";

export function getAllMovies(filters = {}) {
  let result = [...movies];
  //filtro genero
  if (filters.genre) {
    result = result.filter(m => m.genre.toLowerCase() === filters.genre.toLowerCase());
  }
  // filtro rating
  if (filters.minRating) {
    result = result.filter(m => m.rating >= parseFloat(filters.minRating));
  }
  // filtro año
  if(filters.year){
    result = result.filter(m=> m.year === parseInt(filters.year));
  }
  //filtro director
  if(filters.director){
    result = result.filter (m => m.director.toLowerCase().includes(filters.director.toLowerCase()))
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

export function createMovie(movieData){
  // validación de duplicados
  const exists = movies.find((m)=> m.title.toLowerCase()===movieData.title.toLowerCase()
  )
  if(exists){
    throw new Error(`La pelicula "${movieData.title}" ya existe en la base de datos`)
  }
  
  const newNode={
    id:movies.length>0?movies[movies.length-1].id+1 : 1,//Generar ID
    ...movieData,
    rating: parseFloat(movieData.rating),
    year: parseInt(movieData.year)
  }
  movies.push(newNode);
  return newNode
}