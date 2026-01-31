import * as reviewService from '../services/reviewService.js';

export async function getByMovie(req, res) {
  try {
    const { movieId } = req.params;
    const reviews = await reviewService.getReviewsByMovie(movieId);
    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function create(req, res) {
  try {
    const { movieId } = req.params;
    const review = await reviewService.createReview(movieId, req.body);
    res.status(201).json({ success: true, data: review });
  } catch (error) {
    if (error.message === 'Película no encontrada') {
      return res.status(404).json({ success: false, error: error.message });
    }
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function remove(req, res) {
  try {
    const { reviewId } = req.params;
    await reviewService.deleteReview(reviewId);
    res.json({ success: true, message: 'Review eliminada' });
  } catch (error) {
    res.status(404).json({ success: false, error: "La reseña no existe o ya fue eliminada" });
  }
}