import { Router } from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import swapRoutes from './swapRoutes.js';
import ratingRoutes from './ratingRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import feedbackRoutes from './feedbackRoutes.js';
import adminRoutes from './adminRoutes.js';
import reportRoutes from './reportRoutes.js';
import announcementRoutes from './announcementRoutes.js';
import skillRoutes from './skillRoutes.js';

const router = Router();

// Health Check Endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'SkillSwap API',
    timestamp: new Date().toISOString()
  });
});

// Resource Routers
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/skills', skillRoutes);
router.use('/swaps', swapRoutes);
router.use('/ratings', ratingRoutes);
router.use('/notifications', notificationRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/admin', adminRoutes);
router.use('/reports', reportRoutes);
router.use('/announcements', announcementRoutes);

export default router;
