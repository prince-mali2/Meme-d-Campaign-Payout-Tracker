import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMilestone {
  viewThreshold: number;
  payout: number; // in cents
}

export interface ICampaign extends Document {
  name: string;
  brandId: Types.ObjectId;
  platform: 'Instagram' | 'YouTube';
  totalBudget: number; // in cents
  spentBudget: number; // in cents
  milestones: IMilestone[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MilestoneSchema = new Schema<IMilestone>(
  {
    viewThreshold: { type: Number, required: true, min: 1 },
    payout: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const CampaignSchema = new Schema<ICampaign>(
  {
    name: { type: String, required: true, trim: true },
    brandId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    platform: { type: String, enum: ['Instagram', 'YouTube'], required: true },
    totalBudget: { type: Number, required: true, min: 1 },
    spentBudget: { type: Number, default: 0, min: 0 },
    milestones: {
      type: [MilestoneSchema],
      required: true,
      validate: {
        validator: (v: IMilestone[]) => v && v.length > 0,
        message: 'Campaign must have at least one milestone',
      },
    },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export const Campaign = mongoose.model<ICampaign>('Campaign', CampaignSchema);
