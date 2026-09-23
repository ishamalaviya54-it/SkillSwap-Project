import { Router } from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import swapRoutes from './swapRoutes.js';
import ratingRoutes from './ratingRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import feedbackRoutes from './feedbackRoutes.js';
import adminRoutes from './adminRoutes.js';

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
router.use('/swaps', swapRoutes);
router.use('/ratings', ratingRoutes);
router.use('/notifications', notificationRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/admin', adminRoutes);

export default router;
