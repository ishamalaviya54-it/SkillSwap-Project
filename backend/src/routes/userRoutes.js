import { Router } from 'express';
import { getPublicUsers, getUserById, updateProfile } from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/public', getPublicUsers);
router.get('/:id', getUserById);
router.put('/profile', protect, updateProfile);

export default router;

