import prisma from '../lib/prisma.js';

// GET all movies con filtros
export async function getAllMovies(filters = {}, orderBy='createdAt') {
  const orderConfig = {
    createdAt: { createdAt: 'desc' },
    rating: { rating: 'desc' },
    year: { year: 'desc' },
    title: { title: 'asc' }
  };

  const where = {};
  //filtro por titulo
  if(filters.search){
    where.title = {
      contains: filters.search,
      mode: 'insensitive'
    }
  }

  // Filtro por género
  if (filters.genre) {
    where.genre = filters.genre;
  }

  // Filtro por año exacto
  if (filters.year) {
    where.year = parseInt(filters.year);
  }

  // Filtro por rating mínimo
  if (filters.minRating) {
    where.rating = {
      gte: parseFloat(filters.minRating)
    };
  }

  // filtro por director
  if (filters.director){
    where.director = filters.director;
  }

  return await prisma.movie.findMany({
    where,
    orderBy:orderConfig[orderBy] || orderConfig.createdAt
  });
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

export function getGenres() {
  // Devuelve los valores del enum
  return ['ACTION', 'COMEDY', 'DRAMA', 'HORROR', 'SCIFI', 'THRILLER'];
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