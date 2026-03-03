import { Schema, model, Document } from 'mongoose';

export interface ITranscript extends Document {
  originalText: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const transcriptSchema = new Schema<ITranscript>({
  originalText: { type: String, required: true },
  metadata: { type: Schema.Types.Mixed, default: {} },
}, { timestamps: true });


export default model<ITranscript>('Transcript', transcriptSchema);