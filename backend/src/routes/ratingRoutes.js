import { Router } from 'express';
import {
  createRating,
  getUserRatings,
  getEligibleSwapsToRate
} from '../controllers/ratingController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/', protect, createRating);
router.get('/user/:userId', getUserRatings);
router.get('/eligible', protect, getEligibleSwapsToRate);

export default router;

