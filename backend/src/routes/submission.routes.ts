import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { submitPost, getMyEarnings, updateViews } from '../controllers/submission.controller';

const router = Router();

// Creator routes
router.post('/', authenticate, requireRole('creator', 'brand'), submitPost);
router.get('/my-earnings', authenticate, requireRole('creator', 'brand'), getMyEarnings);

// Public / simulation route (no role check needed per brief)
router.patch('/:id/views', updateViews);

export default router;
