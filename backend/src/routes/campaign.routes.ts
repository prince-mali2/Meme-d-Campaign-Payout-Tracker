import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import {
  createCampaign,
  listMyCampaigns,
  getCampaignDetail,
  listLiveCampaigns,
} from '../controllers/campaign.controller';

const router = Router();

// Brand routes
router.post('/', authenticate, requireRole('brand'), createCampaign);
router.get('/my', authenticate, requireRole('brand'), listMyCampaigns);

// Creator routes (must be before /:id to prevent route collision)
router.get('/live', authenticate, requireRole('creator', 'brand'), listLiveCampaigns);

// Public / detail route
router.get('/:id', authenticate, getCampaignDetail);

export default router;
