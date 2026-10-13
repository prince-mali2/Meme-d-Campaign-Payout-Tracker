import { Request, Response } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import { Submission } from '../models/Submission';
import { Campaign } from '../models/Campaign';
import { calculatePayout } from '../services/payout.service';
import { detectSpike } from '../services/viewSpike.service';
import { cache } from '../services/cache.service';

const createSubmissionSchema = z.object({
  campaignId: z.string().min(1, 'Campaign ID is required'),
  postLink: z.string().url('Invalid post URL'),
});

const updateViewsSchema = z.object({
  views: z.number().int().min(0, 'Views must be a non-negative integer'),
});

export async function submitPost(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const data = createSubmissionSchema.parse(req.body);

    const campaign = await Campaign.findById(data.campaignId);
    if (!campaign || !campaign.isActive) {
      res.status(404).json({ error: 'Campaign not found or inactive' });
      return;
    }

    // Check if creator already submitted this post link for this campaign
    const existing = await Submission.findOne({ campaignId: data.campaignId, creatorId: req.user.userId, postLink: data.postLink });
    if (existing) {
      res.status(400).json({ error: 'You have already submitted this post link for this campaign' });
      return;
    }

    const submission = await Submission.create({
      campaignId: campaign._id,
      creatorId: req.user.userId,
      postLink: data.postLink,
      currentViews: 0,
      viewHistory: [],
      payoutStatus: 'pending',
      payoutAmount: 0,
      lastMilestonePaid: null,
      spikeFlag: false,
    });

    res.status(201).json({
      message: 'Post submitted successfully',
      submission: {
        id: submission._id,
        campaignId: submission.campaignId,
        creatorId: submission.creatorId,
        postLink: submission.postLink,
        currentViews: submission.currentViews,
        payoutStatus: submission.payoutStatus,
        payoutAmount: submission.payoutAmount,
        createdAt: submission.createdAt,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0].message });
      return;
    }
    console.error('Submit post error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getMyEarnings(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const submissions = await Submission.find({ creatorId: req.user.userId })
      .populate('campaignId', 'name platform totalBudget spentBudget milestones')
      .sort({ createdAt: -1 });

    const totalEarnings = submissions
      .filter((s) => s.payoutStatus === 'paid')
      .reduce((sum, s) => sum + s.payoutAmount, 0);

    const formatted = submissions.map((s) => ({
      id: s._id,
      campaign: s.campaignId,
      postLink: s.postLink,
      currentViews: s.currentViews,
      payoutStatus: s.payoutStatus,
      payoutAmount: s.payoutAmount,
      spikeFlag: s.spikeFlag,
      createdAt: s.createdAt,
    }));

    res.status(200).json({
      totalEarnings,
      submissions: formatted,
    });
  } catch (err) {
    console.error('Get my earnings error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateViews(req: Request, res: Response): Promise<void> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const data = updateViewsSchema.parse(req.body);

    const submission = await Submission.findById(id).session(session);
    if (!submission) {
      await session.abortTransaction();
      session.endSession();
      res.status(404).json({ error: 'Submission not found' });
      return;
    }

    const campaign = await Campaign.findById(submission.campaignId).session(session);
    if (!campaign) {
      await session.abortTransaction();
      session.endSession();
      res.status(404).json({ error: 'Associated campaign not found' });
      return;
    }

    // Append new view record
    submission.currentViews = data.views;
    submission.viewHistory.push({
      views: data.views,
      recordedAt: new Date(),
    });

    // Check for unusual view spike
    const isSpike = detectSpike(submission.viewHistory);
    if (isSpike) {
      submission.spikeFlag = true;
    }

    // Run payout calculation service
    const payoutResult = calculatePayout({
      views: data.views,
      milestones: campaign.milestones,
      totalBudget: campaign.totalBudget,
      spentBudget: campaign.spentBudget,
      lastMilestonePaid: submission.lastMilestonePaid,
    });

    if (payoutResult.shouldPay) {
      // Check budget again within transaction
      const remainingBudget = campaign.totalBudget - campaign.spentBudget;
      if (remainingBudget >= payoutResult.amount) {
        campaign.spentBudget += payoutResult.amount;
        submission.payoutStatus = 'paid';
        submission.payoutAmount += payoutResult.amount; // accumulate if multiple payouts across milestones over time
        submission.lastMilestonePaid = payoutResult.milestone.viewThreshold;

        await campaign.save({ session });
      } else {
        submission.payoutStatus = 'insufficient_budget';
      }
    } else {
      if (payoutResult.reason === 'insufficient_budget') {
        submission.payoutStatus = 'insufficient_budget';
      } else if (payoutResult.reason === 'no_milestone_reached') {
        if (submission.payoutStatus === 'pending') {
          submission.payoutStatus = 'no_milestone_reached';
        }
      }
      // if already_paid, keep status as paid
    }

    await submission.save({ session });
    await session.commitTransaction();
    session.endSession();

    // Invalidate live campaigns cache because spentBudget changed
    await cache.del('campaigns:live');

    res.status(200).json({
      message: 'Views updated successfully',
      submission: {
        id: submission._id,
        currentViews: submission.currentViews,
        payoutStatus: submission.payoutStatus,
        payoutAmount: submission.payoutAmount,
        lastMilestonePaid: submission.lastMilestonePaid,
        spikeFlag: submission.spikeFlag,
      },
      campaignBudget: {
        totalBudget: campaign.totalBudget,
        spentBudget: campaign.spentBudget,
        budgetRemaining: campaign.totalBudget - campaign.spentBudget,
      },
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0].message });
      return;
    }
    console.error('Update views error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
