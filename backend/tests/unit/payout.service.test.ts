import { calculatePayout } from '../../src/services/payout.service';

describe('calculatePayout service', () => {
  const milestones = [
    { viewThreshold: 10000, payout: 50000 },  // 10k views -> ₹500 (50000 cents)
    { viewThreshold: 50000, payout: 200000 }, // 50k views -> ₹2000 (200000 cents)
    { viewThreshold: 100000, payout: 500000 },// 100k views -> ₹5000 (500000 cents)
  ];

  it('returns no_milestone_reached when views are below the lowest threshold', () => {
    const result = calculatePayout({
      views: 5000,
      milestones,
      totalBudget: 1000000,
      spentBudget: 0,
      lastMilestonePaid: null,
    });

    expect(result.shouldPay).toBe(false);
    if (!result.shouldPay) {
      expect(result.reason).toBe('no_milestone_reached');
    }
  });

  it('pays the correct milestone when threshold is crossed', () => {
    const result = calculatePayout({
      views: 12000,
      milestones,
      totalBudget: 1000000,
      spentBudget: 0,
      lastMilestonePaid: null,
    });

    expect(result.shouldPay).toBe(true);
    if (result.shouldPay) {
      expect(result.milestone.viewThreshold).toBe(10000);
      expect(result.amount).toBe(50000);
    }
  });

  it('pays only the highest milestone crossed when multiple are crossed in a single update', () => {
    const result = calculatePayout({
      views: 75000, // crosses 10k and 50k
      milestones,
      totalBudget: 1000000,
      spentBudget: 0,
      lastMilestonePaid: null,
    });

    expect(result.shouldPay).toBe(true);
    if (result.shouldPay) {
      expect(result.milestone.viewThreshold).toBe(50000);
      expect(result.amount).toBe(200000);
    }
  });

  it('is idempotent: returns already_paid if same milestone is rechecked', () => {
    const result = calculatePayout({
      views: 12000,
      milestones,
      totalBudget: 1000000,
      spentBudget: 50000,
      lastMilestonePaid: 10000,
    });

    expect(result.shouldPay).toBe(false);
    if (!result.shouldPay) {
      expect(result.reason).toBe('already_paid');
    }
  });

  it('upgrades payment when a higher milestone is crossed subsequently', () => {
    const result = calculatePayout({
      views: 60000,
      milestones,
      totalBudget: 1000000,
      spentBudget: 50000,
      lastMilestonePaid: 10000, // previously paid 10k
    });

    expect(result.shouldPay).toBe(true);
    if (result.shouldPay) {
      expect(result.milestone.viewThreshold).toBe(50000);
      expect(result.amount).toBe(200000);
    }
  });

  it('returns insufficient_budget when remaining budget is less than payout', () => {
    const result = calculatePayout({
      views: 105000, // crosses 100k milestone (payout 500000)
      milestones,
      totalBudget: 600000,
      spentBudget: 550000, // remaining budget = 50000, but milestone payout is 500000
      lastMilestonePaid: 50000,
    });

    expect(result.shouldPay).toBe(false);
    if (!result.shouldPay) {
      expect(result.reason).toBe('insufficient_budget');
    }
  });

  it('pays successfully when remaining budget is exactly equal to payout', () => {
    const result = calculatePayout({
      views: 12000,
      milestones,
      totalBudget: 50000,
      spentBudget: 0,
      lastMilestonePaid: null,
    });

    expect(result.shouldPay).toBe(true);
    if (result.shouldPay) {
      expect(result.amount).toBe(50000);
    }
  });

  it('handles single milestone campaigns correctly', () => {
    const singleMilestone = [{ viewThreshold: 1000, payout: 10000 }];
    const result = calculatePayout({
      views: 1500,
      milestones: singleMilestone,
      totalBudget: 50000,
      spentBudget: 0,
      lastMilestonePaid: null,
    });

    expect(result.shouldPay).toBe(true);
    if (result.shouldPay) {
      expect(result.amount).toBe(10000);
    }
  });
});
