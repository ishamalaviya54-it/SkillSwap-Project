import { Router } from 'express';
import {
  createSwapRequest,
  getSentSwaps,
  getReceivedSwaps,
  getMySwaps,
  acceptSwap,
  rejectSwap,
  cancelSwap,
  deleteSwap,
  updateSwapStatus
} from '../controllers/swapController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = Router();

// All swap routes require authentication
router.use(protect);

router.post('/', createSwapRequest);
router.get('/sent', getSentSwaps);
router.get('/received', getReceivedSwaps);
router.get('/', getMySwaps);
router.put('/:id/accept', acceptSwap);
router.put('/:id/reject', rejectSwap);
router.put('/:id/cancel', cancelSwap);
router.delete('/:id', deleteSwap);

// Backward compatibility routes
router.put('/:id/status', updateSwapStatus);
router.put('/:id', updateSwapStatus);

export default router;
