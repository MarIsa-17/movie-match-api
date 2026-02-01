import prisma from '../lib/prisma.js';

// 1. Obtener reviews de una película
export async function getReviewsByMovie(movieId) {
  return await prisma.review.findMany({
    where: { movieId: parseInt(movieId) },
    orderBy: { createdAt: 'desc' }
  });
}

// 2. Crear review para una película y actualizar rating
export async function createReview(movieId, data) {
  const parsedId = parseInt(movieId); 

  // Verificar que la película existe
  const movie = await prisma.movie.findUnique({
    where: { id: parsedId }
  });

  if (!movie) {
    throw new Error('Película no encontrada');
  }

  // Crear la nueva reseña
  const newReview = await prisma.review.create({
    data: {
      movieId: parsedId,
      author: data.author,
      rating: parseInt(data.rating),
      comment: data.comment
    }
  });

  // Obtener todas las reseñas para calcular el nuevo promedio
  const allReviews = await prisma.review.findMany({
    where: { movieId: parsedId }
  });

  const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / allReviews.length;
  const roundedRating = Math.round(averageRating * 10) / 10;

  // Actualizar el rating en la tabla Movie
  await prisma.movie.update({
    where: { id: parsedId },
    data: { rating: roundedRating }
  });

  return newReview;
}

// 3. Eliminar review y actualizar rating
export async function deleteReview(reviewId) {
  const parsedReviewId = parseInt(reviewId);

  const review = await prisma.review.findUnique({
    where: { id: parsedReviewId }
  });

  if (!review) throw new Error("Reseña no encontrada");

  const mid = review.movieId;

  await prisma.review.delete({
    where: { id: parsedReviewId }
  });

  const remainingReviews = await prisma.review.findMany({
    where: { movieId: mid }
  });

  let newAvg = 0;
  if (remainingReviews.length > 0) {
    newAvg = remainingReviews.reduce((s, r) => s + r.rating, 0) / remainingReviews.length;
  }

  await prisma.movie.update({
    where: { id: mid },
    data: { rating: Math.round(newAvg * 10) / 10 }
  });
}