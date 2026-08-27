import mongoose, { Schema, Document } from 'mongoose';

/**
 * Generic atomic sequence counter, keyed by an arbitrary string id
 * (e.g. "REQ-2026"). Used to generate real, sequential, human-facing
 * codes (like CC-REQ-2026-0001) without ever fabricating an ID client-side.
 */
export interface ICounter extends Document {
  _id: string;
  seq: number;
}

const counterSchema = new Schema<ICounter>({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

export default mongoose.model<ICounter>('Counter', counterSchema);
