import { Feedback } from '../models/Feedback.js';
import { SwapRequest } from '../models/SwapRequest.js';

export const submitFeedback = async (req, res, next) => {
  try {
    const { swapId, rating, comment } = req.body;

    if (!swapId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Swap ID, rating, and feedback comment are required'
      });
    }

    const swap = await SwapRequest.findById(swapId);
    if (!swap) {
      return res.status(404).json({
        success: false,
        message: 'Swap not found'
      });
    }

    const isRequester = swap.requester.toString() === req.user._id.toString();
    const isRecipient = swap.recipient.toString() === req.user._id.toString();

    if (!isRequester && !isRecipient) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this swap'
      });
    }

    const reviewee = isRequester ? swap.recipient : swap.requester;

    const feedback = await Feedback.create({
      swap: swapId,
      reviewer: req.user._id,
      reviewee,
      rating,
      comment
    });

    res.status(201).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    next(error);
  }
};

export const getUserFeedback = async (req, res, next) => {
  try {
    const feedbackList = await Feedback.find({ reviewee: req.params.userId })
      .populate('reviewer', 'name avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: feedbackList.length,
      data: feedbackList
    });
  } catch (error) {
    next(error);
  }
};

