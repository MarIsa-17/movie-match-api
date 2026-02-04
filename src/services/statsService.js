import prisma from '../lib/prisma.js';

export async function getDashboardStats() {
  // Ejecutar todas las consultas en paralelo
  const [
    totalMovies,
    totalReviews,
    avgRating,
    moviesByGenre,
    //moviesByDirector,
    topRated,
    mostReviewed,
    recentReviews
  ] = await Promise.all([
    // Total de películas
    prisma.movie.count(),

    // Total de reviews
    prisma.review.count(),

    // Rating promedio de películas
    prisma.movie.aggregate({
      _avg: { rating: true }
    }),

    // Películas por género
    prisma.movie.groupBy({
      by: ['genre'],
      _count: { id: true },
      _avg: { rating: true }
    }),

    /*
    //Películas por director
    prisma.movie.groupBy({
        by: ['director'],
        take: 5,
        _count: { id: true},
        _avg: { rating: true}
    }),
*/
    // Top 5 películas mejor calificadas
    prisma.movie.findMany({
      orderBy: { rating: 'desc' },
      take: 5,
      select: { id: true, title: true, rating: true, genre: true }
    }),

    // Top 5 películas con más reviews
    prisma.movie.findMany({
      include: {
        _count: { select: { reviews: true } }
      },
      orderBy: {
        reviews: { _count: 'desc' }
      },
      take: 5
    }),

    // Últimas 10 reviews
    prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        movie: { select: { id: true, title: true } }
      }
    })
  ]);

  return {
    totalMovies,
    totalReviews,
    avgRating: Math.round((avgRating._avg.rating || 0) * 10) / 10,
    moviesByGenre: moviesByGenre.map(g => ({
      genre: g.genre,
      count: g._count.id,
      avgRating: Math.round((g._avg.rating || 0) * 10) / 10
    })),
    // moviesByDirector: moviesByDirector.map(d => ({
    //   director: d.director || 'desconocido',
    //   count: d._count.id,
    //   avgRating: Math.round((d._avg.rating || 0) * 10) / 10
    // })),
    topRated,
    mostReviewed: mostReviewed.map(m => ({
      id: m.id,
      title: m.title,
      reviewCount: m._count.reviews
    })),
    recentReviews: recentReviews.map(r => ({
      id: r.id,
      author: r.author,
      rating: r.rating,
      comment: r.comment,
      movieTitle: r.movie.title,
      createdAt: r.createdAt
    }))
  };
}