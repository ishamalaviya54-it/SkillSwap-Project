import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    swap: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SwapRequest',
      required: true
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reviewee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: true,
      trim: true
    },
    flagged: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

export const Feedback = mongoose.model('Feedback', feedbackSchema);

