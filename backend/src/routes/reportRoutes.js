import { Router } from 'express';
import { getPlatformReports, downloadReportCSV } from '../controllers/reportController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorizeAdmin } from '../middlewares/adminMiddleware.js';

const router = Router();

// Reports are accessible by administrators
router.use(protect);
router.use(authorizeAdmin);

router.get('/', getPlatformReports);
router.get('/download', downloadReportCSV);

export default router;

