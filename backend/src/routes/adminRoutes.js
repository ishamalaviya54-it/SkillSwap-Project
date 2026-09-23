import { Router } from 'express';
import {
  getAdminStats,
  getAllUsersAdmin,
  toggleBanUser,
  deleteUserAdmin,
  getAllSwapsAdmin,
  getAllSkillsAdmin,
  moderateSkillDescription,
  deleteSkillAdmin,
  getAllRatingsAdmin,
  deleteRatingAdmin,
  createAnnouncement,
  getAllAnnouncements,
  deleteAnnouncement,
  getAdminReports
} from '../controllers/adminController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorizeAdmin } from '../middlewares/adminMiddleware.js';

const router = Router();

// Protect all admin routes: Requires valid JWT + role === 'admin'
router.use(protect);
router.use(authorizeAdmin);

// Dashboard Statistics
router.get('/stats', getAdminStats);

// User Management
router.get('/users', getAllUsersAdmin);
router.put('/users/:id/ban', toggleBanUser);
router.patch('/users/:id/ban', toggleBanUser);
router.delete('/users/:id', deleteUserAdmin);

// Swap Monitoring
router.get('/swaps', getAllSwapsAdmin);

// Skill Moderation
router.get('/skills', getAllSkillsAdmin);
router.put('/skills/:id/moderate', moderateSkillDescription);
router.put('/skills/:id', moderateSkillDescription);
router.patch('/skills/moderate', moderateSkillDescription);
router.delete('/skills/:id', deleteSkillAdmin);

// Ratings & Feedback Moderation
router.get('/ratings', getAllRatingsAdmin);
router.delete('/ratings/:id', deleteRatingAdmin);

// Platform Announcements
router.post('/announcements', createAnnouncement);
router.get('/announcements', getAllAnnouncements);
router.delete('/announcements/:id', deleteAnnouncement);

// Reports
router.get('/reports', getAdminReports);

export default router;
