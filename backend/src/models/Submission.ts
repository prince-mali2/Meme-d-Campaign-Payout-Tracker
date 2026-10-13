import mongoose, { Schema, Document, Types } from 'mongoose';

export type PayoutStatus = 'pending' | 'paid' | 'insufficient_budget' | 'no_milestone_reached';

export interface IViewRecord {
  views: number;
  recordedAt: Date;
}

export interface ISubmission extends Document {
  campaignId: Types.ObjectId;
  creatorId: Types.ObjectId;
  postLink: string;
  currentViews: number;
  viewHistory: IViewRecord[];
  payoutStatus: PayoutStatus;
  payoutAmount: number; // in cents
  lastMilestonePaid: number | null; // viewThreshold of highest milestone paid
  spikeFlag: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ViewRecordSchema = new Schema<IViewRecord>(
  {
    views: { type: Number, required: true, min: 0 },
    recordedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const SubmissionSchema = new Schema<ISubmission>(
  {
    campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign', required: true, index: true },
    creatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    postLink: { type: String, required: true, trim: true },
    currentViews: { type: Number, default: 0, min: 0 },
    viewHistory: { type: [ViewRecordSchema], default: [] },
    payoutStatus: {
      type: String,
      enum: ['pending', 'paid', 'insufficient_budget', 'no_milestone_reached'],
      default: 'pending',
    },
    payoutAmount: { type: Number, default: 0, min: 0 },
    lastMilestonePaid: { type: Number, default: null },
    spikeFlag: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Submission = mongoose.model<ISubmission>('Submission', SubmissionSchema);
