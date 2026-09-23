import mongoose from 'mongoose';

const analysisSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  channelId: { type: String, required: true },
  channelName: { type: String },
  subscribers: { type: Number },
  insights: { type: Array, default: [] },
  ideas: { type: Array, default: [] },
  trends: { type: Object, default: {} },
  competitors: { type: Object, default: {} },
}, { timestamps: true });

export const Analysis = mongoose.model('Analysis', analysisSchema);