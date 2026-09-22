import { Router } from 'express';
import { submitFeedback, getUserFeedback } from '../controllers/feedbackController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/', protect, submitFeedback);
router.get('/user/:userId', getUserFeedback);

export default router;

