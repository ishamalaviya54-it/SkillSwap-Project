import { Router } from 'express';
import {
  createSwapRequest,
  getMySwaps,
  updateSwapStatus,
  cancelSwapRequest
} from '../controllers/swapController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(protect); // All swap actions require authentication

router.post('/', createSwapRequest);
router.get('/', getMySwaps);
router.patch('/:id/status', updateSwapStatus);
router.patch('/:id/cancel', cancelSwapRequest);

export default router;

