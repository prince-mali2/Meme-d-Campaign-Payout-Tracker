export type Role = 'brand' | 'creator';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: AuthUser;
}

export interface Milestone {
  viewThreshold: number;
  payout: number; // in cents
}

export interface Campaign {
  id: string;
  name: string;
  platform: 'Instagram' | 'YouTube';
  totalBudget: number; // in cents
  spentBudget: number; // in cents
  budgetRemaining?: number;
  milestones: Milestone[];
  isActive?: boolean;
  brandId?: string;
  createdAt: string;
}

export type PayoutStatus = 'pending' | 'paid' | 'insufficient_budget' | 'no_milestone_reached';

export interface Submission {
  id: string;
  campaign?: Campaign | string;
  campaignId?: string;
  creatorId?: string;
  postLink: string;
  currentViews: number;
  payoutStatus: PayoutStatus;
  payoutAmount: number; // in cents
  spikeFlag: boolean;
  createdAt: string;
}
