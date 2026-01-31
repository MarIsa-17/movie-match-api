import { Router } from 'express';
import * as reviewController from '../controllers/reviewController.js';

const router = Router();

// GET /movies/:movieId/reviews
router.get('/movies/:movieId/reviews', reviewController.getByMovie);

// POST /movies/:movieId/reviews
router.post('/movies/:movieId/reviews', reviewController.create);

// DELETE /reviews/:reviewId
router.delete('/reviews/:reviewId', reviewController.remove);

export default router;