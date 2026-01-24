import prisma from '../lib/prisma.js';

// GET all movies
export async function getAllMovies() {
  const result = await prisma.movie.findMany();
  return result;
}

// GET movie by ID
export async function getMovieById(id) {
  return await prisma.movie.findUnique({
    where: { id: parseInt(id) }
  });
}

// POST create movie
export async function createMovie(data) {
  return await prisma.movie.create({
    data: {
      title: data.title,
      year: parseInt(data.year),
      genre: data.genre,       // Agregado para persistencia
      director: data.director, // Agregado para persistencia
      rating: parseFloat(data.rating),
      poster: data.poster || null
    }
  });
}

// PUT update movie
export async function updateMovie(id, data) {
  return await prisma.movie.update({
    where: { id: parseInt(id) },
    data: {
      title: data.title,
      year: parseInt(data.year),
      rating: parseFloat(data.rating),
      poster: data.poster
    }
  });
}

// DELETE movie
export async function deleteMovie(id) {
  return await prisma.movie.delete({
    where: { id: parseInt(id) }
  });
}