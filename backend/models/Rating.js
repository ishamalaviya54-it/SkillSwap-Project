import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema(
  {
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'fromUser is required'],
      alias: 'reviewer'
    },
    toUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'toUser is required'],
      alias: 'reviewee'
    },
    swapRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SwapRequest',
      required: [true, 'swapRequest is required'],
      alias: 'swap'
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    feedback: {
      type: String,
      trim: true,
      default: '',
      alias: 'comment'
    }
  },
  {
    timestamps: true
  }
);

export const Rating = mongoose.models.Rating || mongoose.model('Rating', ratingSchema);
export default Rating;
