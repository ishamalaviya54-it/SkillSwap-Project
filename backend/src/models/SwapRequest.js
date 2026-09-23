import mongoose from 'mongoose';

const swapRequestSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Requester is required']
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient is required'],
      alias: 'receiver'
    },
    offeredSkill: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Offered skill is required']
    },
    wantedSkill: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Wanted skill is required']
    },
    message: {
      type: String,
      trim: true,
      default: ''
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

// Virtual for alias receiver
swapRequestSchema.virtual('receiver').get(function () {
  return this.recipient;
});

export const SwapRequest = mongoose.models.SwapRequest || mongoose.model('SwapRequest', swapRequestSchema);
export default SwapRequest;
