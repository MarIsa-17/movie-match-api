import { Router } from 'express';
import * as statsController from '../controllers/statsController.js';

const router = Router();

router.get('/reports/dashboard', statsController.getStats);

export default router;