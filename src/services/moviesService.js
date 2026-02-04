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
    include: {
      _count:{ select:{reviews:true}}
    },
    orderBy:orderConfig[orderBy] || orderConfig.createdAt
  });
}

// GET movie by ID
export async function getMovieById(id) {
  const movie = await prisma.movie.findUnique({
    where: { id: parseInt(id) },
    include: {
      reviews: { orderBy: { createdAt: 'desc' } }
    }
  });
  return movie;
}

export async function getRandomMovies(count = 1) {
  // Obtenemos el total de películas para calcular un salto aleatorio
  const totalMovies = await prisma.movie.count();
  const randomSkip = Math.floor(Math.random() * Math.max(0, totalMovies - count));
  
  return await prisma.movie.findMany({
    take: count,
    skip: randomSkip,
  });
}

// traer películas sin reseña
export async function getMoviesWithoutReviews() {
  return await prisma.movie.findMany({
    where: {
      reviews: { none: {} } // Filtro: donde la lista de reseñas esté vacía
    }
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

// estrenos recientes
export async function getRecentMovies() {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  return await prisma.movie.findMany({
    where: {
      createdAt: { gte: weekAgo } // "Greater than or equal" (Mayor o igual a hace una semana)
    },
    orderBy: { createdAt: 'desc' }
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

export async function searchMovies(params) {
  const { q, genre, yearMin, yearMax, ratingMin, page = 1, limit = 10 } = params;

  // Construir filtros
  const where = {
    AND: []
  };

  // Búsqueda por título
  if (q) {
    where.AND.push({
      title: { contains: q, mode: 'insensitive' }
    });
  }

  // Filtro por género
  if (genre) {
    where.AND.push({ genre });
  }

  // Rango de años
  if (yearMin || yearMax) {
    const yearFilter = {};
    if (yearMin) yearFilter.gte = parseInt(yearMin);
    if (yearMax) yearFilter.lte = parseInt(yearMax);
    where.AND.push({ year: yearFilter });
  }

  // Rating mínimo
  if (ratingMin) {
    where.AND.push({
      rating: { gte: parseFloat(ratingMin) }
    });
  }

  // Si no hay filtros, eliminar AND vacío
  if (where.AND.length === 0) {
    delete where.AND;
  }

  // Ejecutar consulta con paginación
  const [movies, total] = await Promise.all([
    prisma.movie.findMany({
      where,
      include: {
        _count: { select: { reviews: true } }
      },
      orderBy: { rating: 'desc' },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit)
    }),
    prisma.movie.count({ where })
  ]);

  return {
    data: movies,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  };
}

//Exportar para análisis (Data Mining)
export async function exportData() {
  const movies = await prisma.movie.findMany({
    include: {
      _count: { select: { reviews: true } },
      reviews: { select: { rating: true } }
    }
  });

  return movies.map(m => ({
    id: m.id,
    title: m.title,
    genre: m.genre,
    currentRating: m.rating,
    totalReviews: m._count.reviews,
    // Calculamos un promedio real basado en las reseñas actuales
    realAverage: m.reviews.length
      ? (m.reviews.reduce((sum, r) => sum + r.rating, 0) / m.reviews.length).toFixed(2)
      : "Sin reseñas"
  }));
}

// DELETE movie
export async function deleteMovie(id) {
  return await prisma.movie.delete({
    where: { id: parseInt(id) }
  });
}

export async function deleteMovieWithReviews(id) {
  const movieId = parseInt(id);

  return await prisma.$transaction(async (tx) => {
    // 1. Buscamos la película y contamos cuántas reseñas tiene antes de borrar
    const movie = await tx.movie.findUnique({
      where: { id: movieId },
      include: { _count: { select: { reviews: true } } }
    });

    if (!movie) {
      throw new Error('Película no encontrada');
    }

    const reviewCount = movie._count.reviews;

    // 2. Eliminamos las reseñas asociadas (Paso explícito de la transacción)
    await tx.review.deleteMany({
      where: { movieId: movieId }
    });

    // 3. Eliminamos la película
    await tx.movie.delete({
      where: { id: movieId }
    });

    // 4. Devolvemos un reporte de lo que pasó
    return {
      deletedMovie: movie.title,
      deletedReviewsCount: reviewCount
    };
  });
}

