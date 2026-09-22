import { Router } from 'express';
import {
  getAdminStats,
  getAllUsersAdmin,
  toggleBanUser,
  moderateSkillDescription,
  getAllSwapsAdmin,
  createAnnouncement,
  generateReport
} from '../controllers/adminController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorizeAdmin } from '../middlewares/adminMiddleware.js';

const router = Router();

// Protect all admin routes with authentication and admin role authorization
router.use(protect);
router.use(authorizeAdmin);

router.get('/stats', getAdminStats);
router.get('/users', getAllUsersAdmin);
router.patch('/users/:id/ban', toggleBanUser);
router.patch('/skills/moderate', moderateSkillDescription);
router.get('/swaps', getAllSwapsAdmin);
router.post('/announcements', createAnnouncement);
router.get('/reports', generateReport);

export default router;

