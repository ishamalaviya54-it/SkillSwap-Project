import { Router } from 'express';
import { getAllAnnouncements } from '../controllers/adminController.js';

const router = Router();

// Public / User announcement endpoint
router.get('/', getAllAnnouncements);

export default router;

