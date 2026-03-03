import { Schema, model, Document, Types } from 'mongoose';

export interface IPRD extends Document {
  transcript: Types.ObjectId;
  content: string;
  createdAt: Date;
}

const prdSchema = new Schema<IPRD>({
  transcript: { type: Schema.Types.ObjectId, ref: 'Transcript', required: true },
  content: { type: String, required: true },
}, { timestamps: true });

export default model<IPRD>('PRD', prdSchema);