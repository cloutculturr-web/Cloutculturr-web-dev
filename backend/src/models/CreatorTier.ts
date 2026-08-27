import mongoose, { Schema, Document } from 'mongoose';

export interface ICreatorTier extends Document {
  name: string;
  level: 1 | 2 | 3;
  description: string;
  pricingGuidance: {
    min: number | null;
    max: number | null;
    currency: string;
  };
  eligibilityCriteria: string;
  status: 'active' | 'inactive';
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const creatorTierSchema = new Schema<ICreatorTier>(
  {
    name: { type: String, required: [true, 'Tier name is required'], trim: true },
    level: { type: Number, enum: [1, 2, 3], required: true, unique: true },
    description: { type: String, trim: true, default: '' },
    pricingGuidance: {
      min: { type: Number, default: null, min: [0, 'Minimum price cannot be negative'] },
      max: { type: Number, default: null, min: [0, 'Maximum price cannot be negative'] },
      currency: { type: String, default: 'INR' },
    },
    eligibilityCriteria: { type: String, trim: true, default: '' },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

creatorTierSchema.index({ level: 1 }, { unique: true });
creatorTierSchema.index({ status: 1 });

export default mongoose.model<ICreatorTier>('CreatorTier', creatorTierSchema);
