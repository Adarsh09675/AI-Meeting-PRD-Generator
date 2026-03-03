import { Schema, model, Document, Types } from 'mongoose';

export interface IChunk extends Document {
  transcript: Types.ObjectId;
  text: string;
  embeddingId?: string;
  createdAt: Date;
}

const chunkSchema = new Schema<IChunk>({
  transcript: { type: Schema.Types.ObjectId, ref: 'Transcript', required: true },
  text: { type: String, required: true },
  embeddingId: { type: String },
}, { timestamps: true });

export default model<IChunk>('Chunk', chunkSchema);