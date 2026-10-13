export interface IMilestone {
  viewThreshold: number;
  payout: number;
}

export interface CalculatePayoutParams {
  views: number;
  milestones: IMilestone[]; // assumed sorted ascending by viewThreshold
  totalBudget: number;
  spentBudget: number;
  lastMilestonePaid: number | null;
}

export type PayoutResult =
  | {
      shouldPay: true;
      milestone: IMilestone;
      amount: number;
      reason: 'milestone_reached';
    }
  | {
      shouldPay: false;
      reason: 'no_milestone_reached' | 'already_paid' | 'insufficient_budget';
      milestone?: null;
      amount?: 0;
    };

export function calculatePayout(params: CalculatePayoutParams): PayoutResult {
  const { views, milestones, totalBudget, spentBudget, lastMilestonePaid } = params;

  // 1. Filter milestones where viewThreshold <= views
  const crossedMilestones = milestones.filter((m) => m.viewThreshold <= views);

  if (crossedMilestones.length === 0) {
    return { shouldPay: false, reason: 'no_milestone_reached', amount: 0 };
  }

  // 2. Pick the highest crossed milestone (since sorted ascending, it's the last element)
  const highestCrossed = crossedMilestones[crossedMilestones.length - 1];

  // 3. Check idempotency: if this exact milestone (or a higher one) was already paid
  if (lastMilestonePaid !== null && highestCrossed.viewThreshold <= lastMilestonePaid) {
    return { shouldPay: false, reason: 'already_paid', amount: 0 };
  }

  // 4. Check budget cap
  const remainingBudget = totalBudget - spentBudget;
  if (remainingBudget < highestCrossed.payout) {
    return { shouldPay: false, reason: 'insufficient_budget', amount: 0 };
  }

  // 5. Approved for payout
  return {
    shouldPay: true,
    milestone: highestCrossed,
    amount: highestCrossed.payout,
    reason: 'milestone_reached',
  };
}
