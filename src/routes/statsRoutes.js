import { Router } from 'express';
import * as statsController from '../controllers/statsController.js';

const router = Router();

router.get('/stats', statsController.getStats);

export default router;