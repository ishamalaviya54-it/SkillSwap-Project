import { Router } from 'express';
import {
  getPublicUsers,
  getMyProfile,
  getUserById,
  updateProfile
} from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = Router();

// Public routes
router.get('/', getPublicUsers);
router.get('/public', getPublicUsers);

// Private profile routes (declared BEFORE /:id so 'profile' is not matched as an ID)
router.get('/profile', protect, getMyProfile);
router.put('/profile', protect, updateProfile);

// Specific user by ID
router.get('/:id', getUserById);

export default router;
