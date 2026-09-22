import mongoose from 'mongoose';

const swapRequestSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    offeredSkill: {
      type: String,
      required: true,
      trim: true
    },
    wantedSkill: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      default: '',
      trim: true
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'cancelled', 'completed'],
      default: 'pending'
    },
    adminNotes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

export const SwapRequest = mongoose.model('SwapRequest', swapRequestSchema);

