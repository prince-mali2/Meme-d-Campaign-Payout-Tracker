import { calculatePayout } from '../../src/services/payout.service';

describe('Budget Cap & Sequential Payout Simulation', () => {
  const milestones = [
    { viewThreshold: 10000, payout: 30000 },
    { viewThreshold: 50000, payout: 70000 },
  ];

  it('never exceeds totalBudget across sequential payouts', () => {
    let totalBudget = 100000; // 1000 INR
    let spentBudget = 0;
    let lastMilestonePaid: number | null = null;

    // Post hits 12,000 views -> earns 30000
    let res = calculatePayout({
      views: 12000,
      milestones,
      totalBudget,
      spentBudget,
      lastMilestonePaid,
    });
    expect(res.shouldPay).toBe(true);
    if (res.shouldPay) {
      spentBudget += res.amount;
      lastMilestonePaid = res.milestone.viewThreshold;
    }
    expect(spentBudget).toBe(30000);

    // Post hits 60,000 views -> crosses 50k milestone (payout 70000)
    res = calculatePayout({
      views: 60000,
      milestones,
      totalBudget,
      spentBudget,
      lastMilestonePaid,
    });
    expect(res.shouldPay).toBe(true);
    if (res.shouldPay) {
      spentBudget += res.amount;
      lastMilestonePaid = res.milestone.viewThreshold;
    }
    expect(spentBudget).toBe(100000);
    expect(spentBudget).toBe(totalBudget);

    // Another update with a DIFFERENT post that hits 60,000 views when budget is exhausted
    res = calculatePayout({
      views: 60000,
      milestones,
      totalBudget,
      spentBudget, // 100000 spent out of 100000 total
      lastMilestonePaid: null, // new post
    });
    expect(res.shouldPay).toBe(false);
    if (!res.shouldPay) {
      expect(res.reason).toBe('insufficient_budget');
    }
  });
});
