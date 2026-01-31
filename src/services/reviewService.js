import prisma from '../lib/prisma.js';

// Obtener reviews de una película
export async function getReviewsByMovie(movieId) {
  return await prisma.review.findMany({
    where: { movieId: parseInt(movieId) },
    orderBy: { createdAt: 'desc' }
  });
}

// Crear review para una película
export async function createReview(movieId, data) {
  // Verificar que la película existe
  const movie = await prisma.movie.findUnique({
    where: { id: parseInt(movieId) }
  });

  if (!movie) {
    throw new Error('Película no encontrada');
  }

  return await prisma.review.create({
    data: {
      movieId: parseInt(movieId),
      author: data.author,
      rating: parseInt(data.rating),
      comment: data.comment
    }
  });
}

// Eliminar review
export async function deleteReview(reviewId) {
  return await prisma.review.delete({
    where: { id: parseInt(reviewId) }
  });
}