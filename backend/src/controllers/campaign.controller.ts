import { Request, Response } from 'express';
import { z } from 'zod';
import { Campaign } from '../models/Campaign';
import { cache } from '../services/cache.service';

const milestoneSchema = z.object({
  viewThreshold: z.number().int().positive('View threshold must be positive'),
  payout: z.number().int().positive('Payout must be positive'),
});

const createCampaignSchema = z.object({
  name: z.string().min(2, 'Campaign name must be at least 2 characters'),
  platform: z.enum(['Instagram', 'YouTube'], { errorMap: () => ({ message: 'Platform must be Instagram or YouTube' }) }),
  totalBudget: z.number().int().positive('Total budget must be a positive integer (in cents)'),
  milestones: z.array(milestoneSchema).min(1, 'At least one milestone is required'),
});

export async function createCampaign(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const data = createCampaignSchema.parse(req.body);

    // Sort milestones ascending by viewThreshold
    const sortedMilestones = [...data.milestones].sort((a, b) => a.viewThreshold - b.viewThreshold);

    const campaign = await Campaign.create({
      name: data.name,
      brandId: req.user.userId,
      platform: data.platform,
      totalBudget: data.totalBudget,
      spentBudget: 0,
      milestones: sortedMilestones,
      isActive: true,
    });

    // Invalidate live campaigns cache
    await cache.del('campaigns:live');

    res.status(201).json({
      message: 'Campaign created successfully',
      campaign: {
        id: campaign._id,
        name: campaign.name,
        platform: campaign.platform,
        totalBudget: campaign.totalBudget,
        spentBudget: campaign.spentBudget,
        milestones: campaign.milestones,
        isActive: campaign.isActive,
        createdAt: campaign.createdAt,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0].message });
      return;
    }
    console.error('Create campaign error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function listMyCampaigns(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const campaigns = await Campaign.find({ brandId: req.user.userId }).sort({ createdAt: -1 });

    const formatted = campaigns.map((c) => ({
      id: c._id,
      name: c.name,
      platform: c.platform,
      totalBudget: c.totalBudget,
      spentBudget: c.spentBudget,
      budgetRemaining: c.totalBudget - c.spentBudget,
      milestones: c.milestones,
      isActive: c.isActive,
      createdAt: c.createdAt,
    }));

    res.status(200).json({ campaigns: formatted });
  } catch (err) {
    console.error('List my campaigns error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getCampaignDetail(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const campaign = await Campaign.findById(id);

    if (!campaign) {
      res.status(404).json({ error: 'Campaign not found' });
      return;
    }

    res.status(200).json({
      campaign: {
        id: campaign._id,
        name: campaign.name,
        brandId: campaign.brandId,
        platform: campaign.platform,
        totalBudget: campaign.totalBudget,
        spentBudget: campaign.spentBudget,
        budgetRemaining: campaign.totalBudget - campaign.spentBudget,
        milestones: campaign.milestones,
        isActive: campaign.isActive,
        createdAt: campaign.createdAt,
      },
    });
  } catch (err) {
    console.error('Get campaign detail error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function listLiveCampaigns(req: Request, res: Response): Promise<void> {
  try {
    const cacheKey = 'campaigns:live';
    const cached = await cache.get<any[]>(cacheKey);

    if (cached) {
      res.status(200).json({ campaigns: cached, source: 'cache' });
      return;
    }

    const campaigns = await Campaign.find({ isActive: true }).sort({ createdAt: -1 });

    const formatted = campaigns.map((c) => ({
      id: c._id,
      name: c.name,
      platform: c.platform,
      totalBudget: c.totalBudget,
      spentBudget: c.spentBudget,
      budgetRemaining: c.totalBudget - c.spentBudget,
      milestones: c.milestones,
      createdAt: c.createdAt,
    }));

    await cache.set(cacheKey, formatted, 60);

    res.status(200).json({ campaigns: formatted, source: 'database' });
  } catch (err) {
    console.error('List live campaigns error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
