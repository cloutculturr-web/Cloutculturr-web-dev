import mongoose, { Schema, Document } from 'mongoose';

export interface IFile extends Document {
  ownerType: 'creator_application';
  ownerId: mongoose.Types.ObjectId;
  fileType: string;
  originalName: string;
  size: number;
  storagePath: string;
  uploadedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const fileSchema = new Schema<IFile>(
  {
    ownerType: {
      type: String,
      enum: ['creator_application'],
      required: true,
      index: true,
    },
    ownerId: { type: Schema.Types.ObjectId, required: true, index: true },
    fileType: { type: String, required: true },
    originalName: { type: String, required: true },
    size: { type: Number, required: true },
    storagePath: { type: String, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

fileSchema.index({ ownerType: 1, ownerId: 1 });

export default mongoose.model<IFile>('File', fileSchema);
